const Router = require('koa-router');
const { requireAuth } = require('../middleware/permController');
const validateReaction = require('../middleware/validateRoutePostSchema/validateReaction');
const Reaction = require('../models/reaction');
const log = require('../utils/logger');

const router = new Router({
  prefix: '/reactions'
});


/**
 * @api {get} /api/v1/reactions/ GET all reactions.
 * @apiName GetReactions
 * @apiGroup Reactions
 * @apiPermission none
 *
 * @apiParam (Query Params) {String} [reaction] Reaction type (like|dislike).
 * @apiParam (Query Params) {String} [chapterId] Chapter id.
 * @apiParam (Query Params) {String} [userId] Authenticated user id
 *
 * @apiSuccess {Object[]} reaction list
 * @apiSuccess {String} reaction.id Reaction id
 * @apiSuccess {Object[]} Reaction[object] Reaction object data
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "reaction": [{
 *             "reaction": "like|dislike|whatever",
 *             "chapter": "chapter_id",
 *             "user": "authenticated_user_id"
 *         }]
 *      }
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/', requireAuth, async ctx => {
  try {
    let reaction = await Reaction.query().where(ctx.query);
    ctx.status = 200;
    ctx.body = { reaction };
  } catch (e) {
    ctx.throw(400, null, { errors: [e.message] });
  }
});

/**
 * @api {get} /api/v1/reactions/:id GET a reaction by ID.
 * @apiName GetAReAction
 * @apiGroup Reactions
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 *
 * @apiParam {String} id Reaction Id
 *
 * @apiSuccess {Object[]} reaction list
 * @apiSuccess {String} reaction.id Reaction id
 * @apiSuccess {Object[]} reaction[object] Object data
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      reaction: {
 *          userId: 'user44',
 *          chapterId: 'chapter2',
 *          reaction: 'like',
 *          createdAt: '2020-11-25T12:56:52.895Z',
 *          updatedAt: '2020-11-25T12:56:52.895Z',
 *          id: 'IgDuJuUAAvo'
 *        }
 *     }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/:id', requireAuth, async ctx => {
  const reaction = await Reaction.query().findById(ctx.params.id);
  ctx.assert(reaction, 404, 'no reaction by that ID');
  ctx.status = 200;
  ctx.body = { reaction };
});



/**
 * @api {post} /api/v1/reactions/ POST a reaction.
 * @apiName PostAReaction
 * @apiGroup Reactions
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiSampleRequest off
 *
 *
 * @apiSampleRequest off
 *
* @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        reaction: {
 *          userId: 'user44',
 *          chapterId: 'chapter2',
 *          reaction: 'like',
 *          createdAt: '2020-11-25T12:56:52.895Z',
 *          updatedAt: '2020-11-25T12:56:52.895Z',
 *          id: 'IgDuJuUAAvo'
 *        }
 *     }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 *
 */



router.post('/', validateReaction, requireAuth, async ctx => {
  let newReaction = ctx.request.body.reaction;
  newReaction.userId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;

  // const check_reaction = await Reaction.query().findOne({ chapterId: newReaction.chapterId, userId: newReaction.userId });
  let reaction;
  try {

    // Check if record already exists in database
    const check_reaction = await Reaction.query().findOne({ chapterId: newReaction.chapterId, userId: newReaction.userId });

    // If record already exists and the reaction object is not equal to the post reaction object, update the current record and skip creating a new record
    // If record does not exists in database, then create a new record entry
    // Return the new record
    if (check_reaction && check_reaction.reaction != newReaction.reaction) {
      log.info('Updating reaction status');
      reaction = await Reaction.query().patchAndFetchById(check_reaction.id, { reaction: newReaction.reaction });
    } else if (!check_reaction) {
      reaction = await Reaction.query().insertAndFetch(newReaction);
    } else {
      reaction = check_reaction;
    }
  } catch (error) {
    if (error instanceof TypeError) {
      log.error(error);
    }
  }
  ctx.status = 201;
  ctx.body = { reaction };
});



/**
 * @api {put} /api/v1/reactions/:id PUT using Id.
 * @apiName PutAReAction
 * @apiGroup Reactions
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 *
 * @apiParam {String} id Reaction Id
 *
 * @apiSuccess {Object[]} reaction list
 * @apiSuccess {String} reaction.id Reaction id
 * @apiSuccess {String} reaction.chapterId Chapter id.
 * @apiSuccess {String} reaction.userId Authenticated user id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      reaction: {
 *          userId: 'user44',
 *          chapterId: 'chapter2',
 *          reaction: 'like',
 *          createdAt: '2020-11-25T12:56:52.895Z',
 *          updatedAt: '2020-11-25T12:56:52.895Z',
 *          id: 'IgDuJuUAAvo'
 *        }
 *     }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.put('/:id', requireAuth, async ctx => {
  let putReaction = ctx.request.body.reaction;
  let reaction = await Reaction.query().patchAndFetchById(ctx.params.id, putReaction);
  if (!reaction) {
    this.throw(405, `Unable to update record with id ${ctx.params.id}`);
  }

  ctx.status = 201;
  ctx.body = { reaction };
});

/**
 * @api {delete} /api/v1/reactions/:id DELETE using Id.
 * @apiName DeleteARection
 * @apiGroup Reactions
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 *
 * @apiParam {String} id Reaction Id
 *
 * @apiSuccess {Object[]} reaction list
 * @apiSuccess {String} reaction.id Reaction id
 * @apiSuccess {String} reaction.chapterId Chapter id.
 * @apiSuccess {String} reaction.userId Authenticated user id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      reaction: {
 *          userId: 'user44',
 *          chapterId: 'chapter2',
 *          reaction: 'like',
 *          createdAt: '2020-11-25T12:56:52.895Z',
 *          updatedAt: '2020-11-25T12:56:52.895Z',
 *          id: 'IgDuJuUAAvo'
 *        }
 *     }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.delete('/:id', requireAuth, async ctx => {
  const reaction = await Reaction.query().delete().where({ id: ctx.params.id });
  if (!reaction) {
    ctx.assert(reaction, 401, 'Unable to delete');
  }

  ctx.status = 200;
  ctx.body = { reaction };
});


module.exports = router.routes();