const Router = require('koa-router');

const Comment = require('../models/comment');
const { requireAuth, grantAccess } = require('../middleware/permController');
const profaneCheck = require('../utils/profaneCheck');

const router = new Router({
  prefix: '/comments'
});

/**
 * @api {get} / GET a comment
 * @apiName GetChapterComment
 * @apiGroup ChapterComments
 * @apiPermission authenticated user
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *      "comment": [{
 *           "id": "IwAfzOoAAIE",
 *           "chapterId": "chapter5",
 *           "creatorId": "user3",
 *           "comment": "Eligendi inventore placeat repellendus reiciendis sint nesciunt fuga.",
 *           "metadata": null,
 *           "createdAt": "2020-06-15T09:45:18.031Z",
 *           "updatedAt": "2021-03-03T15:46:34.456Z",
 *           "replies": [{
 *               "id": "IwAfzOwAANc",
 *               "chapterId": "chapter2",
 *               "creatorId": "user1",
 *               "comment": "Quo aut eum qui omnis id.",
 *               "metadata": null,
 *               "createdAt": "2020-08-29T02:40:56.161Z",
 *               "updatedAt": "2021-03-04T01:56:56.855Z",
 *               "type": "comment"
 *             },
 *             {
 *               "id": "IwAfzOuAALw",
 *               "chapterId": "chapter2",
 *               "creatorId": "user1",
 *               "comment": "Excepturi modi qui qui.",
 *               "metadata": null,
 *               "createdAt": "2020-10-24T21:09:29.287Z",
 *                "updatedAt": "2021-03-04T11:58:38.484Z",
 *               "type": "comment"
 *             }],
 *             "type": "comment"
 *           }]
 *     }
 *
 */
router.get('/', requireAuth, async ctx => {

  try {
    const comment = await Comment.query()
      .where(ctx.query);

    ctx.assert(comment, 401, 'Something went wrong');
    ctx.status = 201;
    ctx.body = { comment };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e] });
    } else { ctx.throw(400, null, { errors: [e] }); }
    throw e;
  }


});




/**
 * @api {get} /:comment_id GET a comment
 * @apiName GetAChapterComment
 * @apiGroup ChapterComments
 * @apiPermission authenticated user
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *      {
 *        "comment": {
 *           "id": "IwAfzOoAAIE",
 *           "chapterId": "chapter5",
 *           "creatorId": "user3",
 *           "comment": "Eligendi inventore placeat repellendus reiciendis sint nesciunt fuga.",
 *           "metadata": null,
 *           "createdAt": "2020-06-15T09:45:18.031Z",
 *           "updatedAt": "2021-03-03T15:46:34.456Z",
 *           "replies": [{
 *               "id": "IwAfzOwAANc",
 *               "chapterId": "chapter2",
 *               "creatorId": "user1",
 *               "comment": "Quo aut eum qui omnis id.",
 *               "metadata": null,
 *               "createdAt": "2020-08-29T02:40:56.161Z",
 *               "updatedAt": "2021-03-04T01:56:56.855Z",
 *               "type": "comment"
 *             },
 *             {
 *               "id": "IwAfzOuAALw",
 *               "chapterId": "chapter2",
 *               "creatorId": "user1",
 *               "comment": "Excepturi modi qui qui.",
 *               "metadata": null,
 *               "createdAt": "2020-10-24T21:09:29.287Z",
 *                "updatedAt": "2021-03-04T11:58:38.484Z",
 *               "type": "comment"
 *             }],
 *             "type": "comment"
 *           }
 *        }
 *
 *
 */
router.get('/:id', requireAuth, async ctx => {
  let comment;
  try {
    comment = await Comment.query()
      .where({ id: ctx.params.id })
      .andWhere(ctx.query);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e] });
    } else { ctx.throw(400, null, { errors: [e] }); }
    throw e;
  }

  ctx.assert(comment, 401, 'Something went wrong');
  ctx.status = 201;
  ctx.body = { comment };

});

/**
 * @api {post} / POST comment
 * @apiName PostAChapterComment
 * @apiGroup ChapterComments
 * @apiPermission authenticated user
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *      "comment": {
 *        "creatorId": { type: String },
 *        "comment": { type: String },
 *        "metadata": { type: JSON },
 *        "chapterId": { type: String }
 *      }
 *    }
 * @apiSampleRequest off
 */


router.post('/', requireAuth, async ctx => {
  let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;
  let newChapterComment = ctx.request.body.comment;
  newChapterComment.creatorId = stateUserId;

  const checked = await profaneCheck(newChapterComment.comment);

  if (typeof checked != 'undefined' && checked) {
    ctx.throw(400, null, { errors: [checked] });
  }

  let comment;
  try {
    comment = await Comment.query().insertAndFetch(newChapterComment);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.data] });
    } else { ctx.throw(400, null, { errors: [e.nativeError] }); }
    throw e;
  }
  ctx.assert(comment, 401, 'Something went wrong');
  ctx.status = 201;
  ctx.body = { comment };

});


/**
 * @api {put} /:comment_id PUT comment
 * @apiName PutAChapterComment
 * @apiGroup ChapterComments
 * @apiPermission authenticated user
 * @apiSampleRequest off
 *
 */

router.put('/:id', requireAuth, grantAccess('updateOwn', 'path'), async ctx => {
  const comment_record = await Comment.query().findById(ctx.params.id);
  let commentData = ctx.request.body.comment;

  if (!comment_record) {
    ctx.throw(400, 'No chapter with that ID');
  }

  let comment;
  try {
    comment = await Comment.query().patchAndFetchById(ctx.params.id, commentData);
  } catch (e) {
    console.log(e);
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }
  ctx.status = 201;
  ctx.body = { comment };

});

module.exports = router.routes();
