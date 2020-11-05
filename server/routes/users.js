const Router = require('koa-router');
const path = require('path');
const fetch = require('node-fetch');
const busboy = require('async-busboy');
const shortid = require('shortid');
const sharp = require('sharp');
const s3 = require('../utils/s3Util');
const { updatedAt } = require('../utils/timestamp');

const User = require('../models/user');
const AchievementAward = require('../models/achievement_awards');

const log = require('../utils/logger');
const jwt = require('../middleware/jwt');
const permController = require('../middleware/permController');
const validateAuthRoutes = require('../middleware/validateRoutePostSchema/validateAuthRoutes');

const knex = require('../utils/knexUtil');

const {
  achievementAwardsType,
  userRoles,
  enrolledCoursesType,
  createPasswordHash,
  profileCompleteBoolean,
  inviteUserAward,
  getProfileImage
} = require('../utils/routesUtils/userRouteUtils');
const googleToken = require('../utils/oauth2/googleToken');
// require('../utils/oauth2/passport');
const router = new Router({
  prefix: '/users'
});


/**
 * @api {post} /users POST create a new user.
 * @apiName PostAUser
 * @apiGroup Authentication
 *
 * @apiParam (Required Params) {string} user[username] username
 * @apiParam (Required Params) {string} user[email] Unique email
 * @apiParam (Required Params) {string} user[password] validated password
 * @apiParam (Optional Params) {string} user[invitedBy] auto filled on the form
 * @apiParam (Optional Params) {string} user[tags] auto filled on the form
 *
 * @apiPermission none
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *        "user": {
 *          "id": "string",
 *          "username": "string",
 *          "inviteCode": "invited_by",
 *          "createdAt": "string",
 *          "updatedAt": "string",
 *          "tags": "array",
 *          "metadata": json_array
 *        }
 *     }
 *
 */

/**
* @api {post} /users POST create a new user.
* @apiName PostAUser
* @apiGroup Authentication
*
* @apiParam (Required Params) {string} user[username] username
* @apiParam (Required Params) {string} user[email] Unique email
* @apiParam (Required Params) {string} user[password] validated password
* @apiParam (Optional Params) {string} user[invitedBy] auto filled on the form
*
* @apiPermission none
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 201 OK
*     {
*        "user": {
*          "id": "string",
*          "username": "string",
*          "inviteCode": "invited_by",
*          "createdAt": "string",
*          "updatedAt": "string",
*          "metadata": json_array
*        }
*     }
*
* @apiError {String} errors Bad Request.
*/


/**
 * @swagger
 * models:
 *   User:
 *     id: User
 *     properties:
 *       username:
 *         type: String
 *       password:
 *         type: String
 */


router.post('/', validateAuthRoutes.validateNewUser, createPasswordHash, async ctx => {
  ctx.request.body.user.username = ctx.request.body.user.username.toLowerCase();
  ctx.request.body.user.email = ctx.request.body.user.email.toLowerCase();
  ctx.request.body.user.lastSeen = await updatedAt();
  ctx.request.body.user.metadata = { 'profileComplete': 'false', 'oneInviteComplete': 'false' };

  const inviteInsert = await knex('user_invite').insert([{ 'invited_by': ctx.request.body.user.inviteCode }], ['id', 'invited_by']);

  let newUser = ctx.request.body.user;
  newUser.inviteCode = shortid.generate();
  newUser.lastSeen = await updatedAt();

  const firstUserCheck = await User.query();
  let role = !firstUserCheck.length ? 'groupSuperAdmin' : 'groupBasic';

  try {
    const user = await User.query().insertAndFetch(newUser);
    await knex('group_members').insert({ 'user_id': user.id, 'group_id': role });
    await knex('user_invite').where({ id: inviteInsert[0].id }).update({ user_id: user.id }, ['id', 'invited_by', 'user_id']);

    log.info('Created a user with id %s with username %s with the invite code %s', user.id, user.username, user.inviteCode);

    ctx.status = 201;
    ctx.body = { user };
  } catch (e) {
    log.info('Failed for user - %s, with error %s', ctx.request.body.user.email, e.message, e.detail);
    ctx.throw(400, null, { errors: [e] });
  }


});


/**
 * @api {get} /users/:id GET a single user using id.
 * @apiName GetAUser
 * @apiGroup Authentication
 *
 * @apiVersion 0.4.0
 * @apiDescription list a single user on the platform
 * @apiPermission [admin, superadmin]
 * @apiHeader (Header) {String} authorization Bearer <<YOUR_API_KEY_HERE>>
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "user": {
 *       "id": "user2",
 *       "username": "user2",
 *       "createdAt": "2017-12-20T16:17:10.000Z",
 *       "updatedAt": "2017-12-20T16:17:10.000Z",
 *       "profileUri": "image_url",
 *       "private": boolean,
 *       "inviteCode": "invited_by",
 *       "achievementAwards": [
 *         {
 *           "id": "achievementaward1",
 *           "name": "completed 10 courses",
 *           "type": "achievementAwards"
 *         },
 *         {
 *           "id": "achievementaward2",
 *           "name": "fully filled profile",
 *           "type": "achievementAwards"
 *         }
 *       ],
 *       "userRoles": [
 *         {
 *           "name": "basic"
 *         }
 *       ],
 *       "enrolledCourses": [
 *          {
 *            "id": "course1",
 *            "name": "A Course 1",
 *            "type": "course"
 *          }
 *       ],
 *       "userVerification": []
 *    }
 * }
 *
 * @apiErrorExample
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "status": 401,
 *      "message": "You do not have permissions to view that user"
 *    }
 *
 * @apiErrorExample
 *    HTTP/1.1 404 Not Found
 *    {
 *      "status": 404,
 *      "message": "No User With that Id"
 *    }
 */

router.get('/:id', permController.requireAuth, async ctx => {

  try {
    let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;

    let userId = ctx.params.id != 'current' ? ctx.params.id : stateUserId;
    const user = await User.query().findById(userId).mergeJoinEager('[achievementAwards(selectBadgeNameAndId), userRoles(selectName), enrolledCourses(selectNameAndId), oauth2(selectData)]');
    user.profileUri = await getProfileImage(user.profileUri);

    if (user.id != stateUserId || stateUserId === 'anonymous') {
      // return specific data for all profiles incase it's private
      let publicData = {
        'username': 'private',
        'profileUri': 'images/profile-placeholder.gif',
        'id': user.id,
        'private': user.private
      };
      // return data if profile is not private
      if (user.private === 'false') {
        publicData.username = user.username;
        publicData.profileUri = user.profileUri;
      }
      ctx.status = 200;
      ctx.body = { user: publicData };
    } else {
      enrolledCoursesType(user);
      userRoles(user);
      // get all verification data
      achievementAwardsType(user);
      const userVerification = await knex('user_verification').where({ 'user_id': userId });
      user.userVerification = userVerification;

      if (profileCompleteBoolean(user) && user.metadata.profileComplete === 'false') {
        await User.query().patchAndFetchById(ctx.params.id, { 'metadata:profileComplete': 'true' });
        await AchievementAward.query().insert({
          'name': 'profile completed',
          'achievementId': ctx.params.id,
          'userId': ctx.params.id
        });
      }

      log.info('Got a request from %s for %s', ctx.request.ip, ctx.path);

      ctx.status = 200;
      ctx.body = { user };
    }
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, { message: 'The query key does not exist' });
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(406, null, { errors: [e.message] }); }
    throw e;
  }
});
/**
 * @api {get} /users GET all users.
 * @apiName GetUsers
 * @apiGroup Authentication
 *
 * @apiVersion 0.4.0
 * @apiDescription list all user on the platform
 * @apiPermission [admin, superadmin]
 * @apiHeader (Header) {String} authorization Bearer <<YOUR_API_KEY_HERE>>
 *
 * @apiParam (Required Params) {string} user[username] username
 * @apiParam (Required Params) {string} user[email] Unique email
 * @apiParam (Required Params) {string} user[password] validated password
 * @apiParam (Optional Params) {string} user[invitedBy] auto filled on the form
 * @apiParam (Optional Params) {string} user[tags] a list of String with tags a user has subscribed to
 * @apiParam (Optional Params) {string} user[metadata] json data
 *
 */
router.get('/', permController.requireAuth, permController.grantAccess('readAny', 'profile'), async ctx => {
  let user = User.query();

  if (ctx.query.username) {
    user.where('username', ctx.query.username);
    ctx.assert(user, 404, 'No User With that username');
  }
  try {
    user = await user.mergeJoinEager('[achievementAwards(selectBadgeNameAndId), userRoles(selectName), enrolledCourses(selectNameAndId)]');
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, { message: 'The query key does not exist' });
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(406, null, { errors: [e.message] }); }
    throw e;
  }

  enrolledCoursesType(user);
  achievementAwardsType(user);
  userRoles(user);

  ctx.body = { user };
});

/**
 * @api {put} /users/:id PUT users data.
 * @apiName PutAUser
 * @apiGroup Authentication
 *
 * @apiVersion 0.4.0
 * @apiDescription edit users data on the platform
 * @apiPermission [admin, superadmin]
 * @apiHeader (Header) {String} authorization Bearer <<YOUR_API_KEY_HERE>>
 *
 * @apiParam (PUT Params) {string} user[email] Unique email
 * @apiParam (PUT Params) {string} user[password] validated password
 * @apiParam (PUT Params) {string} user[tags] a list of String with tags a user has subscribed to
 * @apiParam (PUT Params) {string} user[metadata] json data
 *
 * @apiSuccess {String} user[object] Object data
 *
 */

router.put('/:id', jwt.authenticate, permController.requireAuth, async ctx => {

  ctx.request.body.user.updatedAt = await updatedAt();

  let user;
  try {
    user = await User.query().patchAndFetchById(ctx.params.id, ctx.request.body.user);
    ctx.assert(user, 404, 'That user does not exist.');
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request', e.message] }); }
    throw e;
  }

  if (profileCompleteBoolean(user) && user.metadata.profileComplete === 'false') {
    await User.query().patchAndFetchById(ctx.params.id, { 'metadata:profileComplete': 'true' });
    await AchievementAward.query().insert({
      'name': 'profile completed',
      'achievementId': ctx.params.id,
      'userId': ctx.params.id
    });
  }

  ctx.status = 200;
  ctx.body = { user };

});

router.post('/invite/:id', async ctx => {
  let invite;
  try {
    // invite = await User.query().patchAndFetchById(ctx.params.id, ctx.request.body.user);
    invite = await knex('user_invite').insert([{ user_id: ctx.params.id, 'invited_by': ctx.request.body.user.inviteBy }], ['id', 'invited_by', 'user_id']);
    ctx.assert(invite, 404, 'That user does not exist.');
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request', e.message] }); }
  }

  inviteUserAward(ctx.params.id);

  ctx.status = 200;
  ctx.body = { invite };

});

/**
 * @api {post} /users/:id/profile-image POST users profile picture.
 * @apiName PostAUser
 * @apiGroup Authentication
 *
 * @apiVersion 0.4.0
 * @apiDescription upload user profile pic
 * @apiPermission [basic, admin, superadmin]
 * @apiHeader (Header) {String} authorization Bearer <<YOUR_API_KEY_HERE>>
 *
 *
 * @apiError {String} errors Bad Request.
 */

router.post('/:id/profile-image', permController.requireAuth, async (ctx, next) => {
  if ('POST' != ctx.method) return await next();

  const { files } = await busboy(ctx.req);
  const fileNameBase = shortid.generate();
  const uploadPath = 'uploads/images/profile';
  const uploadDir = path.resolve(__dirname, '../public/' + uploadPath);

  ctx.assert(files.length, 400, 'No files sent.');
  ctx.assert(files.length === 1, 400, 'Too many files sent.');

  const resizer = sharp().resize(500, 500).jpeg({ quality: 70 });

  files[0].pipe(resizer);

  if (s3.config) {
    let buffer = await resizer.toBuffer();
    const params = {
      Bucket: s3.config.bucket, // pass your bucket name
      Key: `uploads/profiles/${fileNameBase}.jpg`, // key for saving filename
      Body: buffer, //image to be uploaded
    };

    try {
      //Upload image to AWS S3 bucket
      const uploaded = await s3.s3.upload(params).promise();
      log.info('Uploaded in:', uploaded.Location);
      await User.query().patchAndFetchById(ctx.params.id, { profileUri: fileNameBase });

      ctx.body = {
        host: `${params.Bucket}.s3.amazonaws.com/uploads/profiles`,
        path: `${fileNameBase}.jpg`
      };
    } catch (e) {
      log.error(e);
      ctx.throw(e.statusCode, null, { message: e.message });
    }
  }

  else {
    await resizer.toFile(`${uploadDir}/${fileNameBase}.jpg`);
    await User.query().findById(ctx.params.id).patchAndFetchById({ profile_uri: `${uploadPath}/${fileNameBase}.jpg` });
    ctx.body = {
      host: ctx.host,
      path: `${uploadPath}/${fileNameBase}.jpg`
    };
  }
});


/**
 *  {
 *    grant_type: 'google-oauth2',
 *    auth_code: '4/5wHAvpr3Vgw87k0474ZaBugG0SxLTFk9fcGEQal5xhz-QRC_E1tslqdxheSu69t8rH8TILGrMR5mt6vL-yYCIe8'
 *  }
 *
 * {
  grant_type: 'facebook-oauth2',
  auth_code: 'AQCKVkC_vwH-lDThmkFvhSmZEzjx4RpM5DH5FCxVSCUqvyaD99Jb_0GSXRBurFyLgl674PZF929og-h3XM9Me1lMWf2b_SONPvwcE7Q5C81Ke4SqQFj-JY03BEAZyTl-y9nFWZkrNPcOgseM98wHQ3diu1BtWXqa0Lcz5FgF54hsCX4DdY2NfudI_QY0udybwVM6FgbUmDFTVuogA4UvUxJbq__BWs4b5zw7LZTROBpVfI-YAsdQmCM-bZE3G8CYObZ1lUtcoKvl1eFFGeOaTQzc1KzYI5U6B2fWiOFoxx21QE7l0quQADEI2BQESpZ6XQ2PTXP0fuf_cEHZwzns7oTw'
}
 */
router.post('/token', async ctx => {
  try {
    const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=names,coverPhotos,emailAddresses,phoneNumbers&access_token=${ctx.request.body.auth_code}`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    console.log(JSON.stringify(json));
    googleToken(ctx.request.body.auth_code);
    ctx.status = 201;
    ctx.body = json;
  } catch (error) {
    console.log(error);
  }
});

module.exports = router.routes();