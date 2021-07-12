const Router = require('koa-router');
const Badge = require('../models/badges');
const path = require('path');
const sharp = require('sharp');
const koaBody = require('koa-body')({ multipart: true, multiples: false, keepExtensions: true });
const { nanoid } = require('nanoid/async');

const { requireAuth, grantAccess } = require('../middleware/permController');

const s3 = require('../utils/s3Util');
const log = require('../utils/logger');
const slugGen = require('../utils/slugGen');

const router = new Router({
  prefix: '/badges'
});

/**
 * @api {get} /api/v1/badges/:id GET a badge details.
 * @apiName GET a badge details
 * @apiGroup Badge
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the badge to update
 *
 * @apiSuccess {Object} badge Top level object
 * @apiSuccess {String} badge[id] badge id
 * @apiSuccess {String} badge[name] name given to badge
 * @apiSuccess {String} badge[slug] path to view the badge
 * @apiSuccess {String} badge[badgeUri] image link
 * @apiSuccess {String} badge[triggerId] foreign key for badge trigger
 * @apiSuccess {String} badge[creatorId] creator id
 * @apiSuccess {Number} badge[points] points awarded to badge owner
 * @apiSuccess {String} badge[description] badge explanation
 * @apiSuccess {String} badge[expiry] date time of expiry of the badge
 * @apiSuccess {Boolean} badge[isDeleted] boolean indicating if soft deleted
 * @apiSuccess {Object} badge[metadata] JSON metadata
 * @apiSuccess {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiSuccess {Number} badge[reminder] No. of times before a reminder sent
 * @apiSuccess {String} badge[reminderMessage] Reminder message to show
 * @apiSuccess {String} badge[createdAt]
 * @apiSuccess {String} badge[updatedAt]
 * @apiSuccess {String} badge[badge_triggers][id] trigger id same as trigger string
 * @apiSuccess {String} badge[badge_triggers][name] trigger name
 * @apiSuccess {String} badge[badge_triggers][type] model instance type
 *
 */
router.get('/:id', requireAuth, grantAccess('readAny', 'private'), async ctx => {
  const badge = await Badge.query().findById(ctx.params.id).withGraphFetched('badge_triggers(selectNameAndId)');

  // ctx.assert(badge, 404, 'Not found', { errors: ['Bad Request'] } );
  ctx.assert(badge, 404, null, { errors: ['Bad Request'] });

  ctx.status = 200;
  ctx.body = { badge };
});

/**
 * @api {get} /api/v1/badges GET all badge details.
 * @apiName GET all badge details
 * @apiGroup Badge
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 *
 * @apiSuccess {Object[]} badge Top level object
 * @apiSuccess {String} badge[id] badge id
 * @apiSuccess {String} badge[name] name given to badge
 * @apiSuccess {String} badge[slug] path to view the badge
 * @apiSuccess {String} badge[badgeUri] image link
 * @apiSuccess {String} badge[triggerId] foreign key for badge trigger
 * @apiSuccess {String} badge[creatorId] creator id
 * @apiSuccess {Number} badge[points] points awarded to badge owner
 * @apiSuccess {String} badge[description] badge explanation
 * @apiSuccess {String} badge[expiry] date time of expiry of the badge
 * @apiSuccess {Boolean} badge[isDeleted] boolean indicating if soft deleted
 * @apiSuccess {Object} badge[metadata] JSON metadata
 * @apiSuccess {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiSuccess {Number} badge[reminder] No. of times before a reminder sent
 * @apiSuccess {String} badge[reminderMessage] Reminder message to show
 * @apiSuccess {String} badge[createdAt]
 * @apiSuccess {String} badge[updatedAt]
 * @apiSuccess {String} badge[badge_triggers][id] trigger id same as trigger string
 * @apiSuccess {String} badge[badge_triggers][name] trigger name
 * @apiSuccess {String} badge[badge_triggers][type] model instance type
 *
 */

router.get('/', requireAuth, async ctx => {
  const { expiry, ...query } = ctx.query;
  let badges = Badge.query().where(query);

  if (expiry === 'true') badges.where('expiry', '>=', new Date().toISOString());
  if (expiry === 'false') badges.where('expiry', '<=', new Date().toISOString());

  const badge = await badges;

  ctx.assert(badge, 404);
  ctx.status = 200;
  ctx.body = { badge };
});



/**
 * @api {post} /api/v1/badges/ POST a new badge.
 * @apiName POST a badge details
 * @apiGroup Badge
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {Object} badge Top level object
 * @apiParam (Request Body) {String} badge[name] name given to badge
 * @apiParam (Request Body) {String} [badge[badgeUri]] image link
 * @apiParam (Request Body) {String} badge[triggerId] foreign key for badge trigger
 * @apiParam (Request Body) {String} badge[creatorId] creator id
 * @apiParam (Request Body) {Number} badge[points] points awarded to badge owner
 * @apiParam (Request Body) {String} badge[description] badge explanation
 * @apiParam (Request Body) {String} badge[expiry] date time of expiry of the badge
 * @apiParam (Request Body) {Boolean} [badge[isDeleted]] boolean indicating if soft deleted
 * @apiParam (Request Body) [badge[metadata]] JSON metadata
 * @apiParam (Request Body) {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiParam (Request Body) {Number} badge[reminder] No. of times before a reminder sent
 * @apiParam (Request Body) {String} badge[reminderMessage] Reminder message to show
 *
 * @apiSuccess {Object} badge Top level object
 * @apiSuccess {String} badge[id] badge id
 * @apiSuccess {String} badge[name] name given to badge
 * @apiSuccess {String} badge[slug] path to view the badge
 * @apiSuccess {String} badge[badgeUri] image link
 * @apiSuccess {String} badge[triggerId] foreign key for badge trigger
 * @apiSuccess {String} badge[creatorId] creator id
 * @apiSuccess {Number} badge[points] points awarded to badge owner
 * @apiSuccess {String} badge[description] badge explanation
 * @apiSuccess {String} badge[expiry] date time of expiry of the badge
 * @apiSuccess {Boolean} badge[isDeleted] boolean indicating if soft deleted
 * @apiSuccess {Object} badge[metadata] JSON metadata
 * @apiSuccess {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiSuccess {Number} badge[reminder] No. of times before a reminder sent
 * @apiSuccess {String} badge[reminderMessage] Reminder message to show
 * @apiSuccess {String} badge[createdAt]
 * @apiSuccess {String} badge[updatedAt]
 * @apiSuccess {String} badge[badge_triggers][id] trigger id same as trigger string
 * @apiSuccess {String} badge[badge_triggers][name] trigger name
 * @apiSuccess {String} badge[badge_triggers][type] model instance type
 *
 */
router.post('/', requireAuth, async ctx => {
  let newBadge = ctx.request.body.badge;
  newBadge.slug = await slugGen(newBadge.name);

  const badge = await Badge.query().insertAndFetch(newBadge);
  ctx.assert(badge, 401, 'Something went wrong');

  ctx.status = 201;

  ctx.body = { badge };

});


/**
 * @api {put} /api/v1/badges/:id PUT a badge details.
 * @apiName PUT a badge details
 * @apiGroup Badge
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the badge to update
 *
 * @apiParam (Request Body) {Object} badge Top level object
 * @apiParam (Request Body) {String} [badge[name]] badge name
 *
 * @apiSuccess {Object} badge Top level object
 * @apiSuccess {String} badge[id] badge id
 * @apiSuccess {String} badge[name] name given to badge
 * @apiSuccess {String} badge[slug] path to view the badge
 * @apiSuccess {String} badge[badgeUri] image link
 * @apiSuccess {String} badge[triggerId] foreign key for badge trigger
 * @apiSuccess {String} badge[creatorId] creator id
 * @apiSuccess {Number} badge[points] points awarded to badge owner
 * @apiSuccess {String} badge[description] badge explanation
 * @apiSuccess {String} badge[expiry] date time of expiry of the badge
 * @apiSuccess {Boolean} badge[isDeleted] boolean indicating if soft deleted
 * @apiSuccess {Object} badge[metadata] JSON metadata
 * @apiSuccess {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiSuccess {Number} badge[reminder] No. of times before a reminder sent
 * @apiSuccess {String} badge[reminderMessage] Reminder message to show
 * @apiSuccess {String} badge[createdAt]
 * @apiSuccess {String} badge[updatedAt]
 * @apiSuccess {String} badge[badge_triggers][id] trigger id same as trigger string
 * @apiSuccess {String} badge[badge_triggers][name] trigger name
 * @apiSuccess {String} badge[badge_triggers][type] model instance type
 *
 */
router.put('/:id', requireAuth, async ctx => {

  const badgeChecker = await Badge.query().findById(ctx.params.id);
  ctx.assert(badgeChecker, 400, null, { errors: ['Bad Request'] });

  const badge = await badgeChecker.$query().patchAndFetchById(ctx.params.id, ctx.request.body.badge);
  ctx.status = 201;
  ctx.body = { badge };
});


/**
 * @api {delete} /api/v1/badges/:id Delete a badge.
 * @apiName DELETE a Badge
 * @apiDescription DELETE a badge using id
 * @apiGroup Badge
 * @apiPermission [admin, superadmin]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id badge id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 *
 */


router.delete('/:id', async ctx => {
  const badge = await Badge.query()
    .where({ isDeleted: false })
    .findById(ctx.params.id);
  ctx.assert(badge, 400, 'Not found');

  await badge.$query()
    // .patch({ isDeleted: true });
    .delete();

  ctx.status = 200;
  ctx.body = { badge };
});


/**
 * @api {post} /badges/:id/badge-image POST badge image.
 * @apiName Badges
 * @apiDescription upload a badge image
 * @apiGroup Badge
 *
 * @apiVersion 0.4.0
 * @apiPermission [admin, superadmin]
 * @apiHeader (Header) {String} authorization Bearer <<YOUR_API_KEY_HERE>>
 *
 * @apiSuccess {Object} badge Top level object
 * @apiSuccess {String} badge[id] badge id
 * @apiSuccess {String} badge[name] name given to badge
 * @apiSuccess {String} badge[slug] path to view the badge
 * @apiSuccess {String} badge[badgeUri] image link
 * @apiSuccess {String} badge[triggerId] foreign key for badge trigger
 * @apiSuccess {String} badge[creatorId] creator id
 * @apiSuccess {Number} badge[points] points awarded to badge owner
 * @apiSuccess {String} badge[description] badge explanation
 * @apiSuccess {String} badge[expiry] date time of expiry of the badge
 * @apiSuccess {Boolean} badge[isDeleted] boolean indicating if soft deleted
 * @apiSuccess {Object} badge[metadata] JSON metadata
 * @apiSuccess {Number} badge[frequency]  No. of times one should trigger to earn the badge
 * @apiSuccess {Number} badge[reminder] No. of times before a reminder sent
 * @apiSuccess {String} badge[reminderMessage] Reminder message to show
 * @apiSuccess {String} badge[createdAt]
 * @apiSuccess {String} badge[updatedAt]
 *
 * @apiError {String} errors Bad Request.
 */


router.post('/:id/badge-image', requireAuth, koaBody, requireAuth, async (ctx) => {

  ctx.assert(ctx.request.files.file, 400, 'No file image uploaded');

  const fileNameBase = await nanoid(11);
  const uploadPath = 'uploads/images/badges';
  const uploadDir = path.resolve(__dirname, '../public/' + uploadPath);

  const { file } = ctx.request.files;

  const fileExtension = path.extname(file.name);

  if (!['.webp', '.svg', '.png', '.jpeg', '.gif', '.avif', '.jpg'].includes(fileExtension)) {
    ctx.throw(400, { error: 'Image format not supported' });
  }

  let resizer;
  try {
    resizer = sharp(file.path)
      .resize(500, 500)
      .jpeg({ quality: 70 });
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(500, null, { errors: [e.message] });
    }
  }

  // This will execute the update hooks because here we have a model
  // instance `badge`.


  if (s3.config) {
    let buffer = await resizer.toBuffer();
    const params = {
      Bucket: s3.config.bucket, // pass your bucket name
      Key: `uploads/badges/${fileNameBase}.jpg`, // key for saving filename
      Body: buffer, //image to be uploaded
    };

    try {
      //Upload image to AWS S3 bucket
      const uploaded = await s3.s3.upload(params).promise();
      log.info('Uploaded in:', uploaded.Location);
      const badge = await Badge.query()
        .patchAndFetchById(ctx.params.id, { badgeUri: fileNameBase });

      ctx.body = {badge };
    } catch (e) {
      log.error(e);
      ctx.throw(e.statusCode, null, { message: e.message });
    }
  } else {
    try {
      await resizer.toFile(`${uploadDir}/${fileNameBase}.jpg`);
      const badge = await Badge.query()
        .patchAndFetchById(ctx.params.id, { badgeUri: `/${uploadPath}/${fileNameBase}.jpg` });

      ctx.status = 200;
      ctx.body = {badge };
    } catch (e) {
      if (e.statusCode) {
        ctx.throw(e.statusCode, null, { errors: [e.message] });
      } else {
        ctx.throw(400, null, { errors: [e.message] });
      }
    }
  }
});

module.exports = router.routes();
