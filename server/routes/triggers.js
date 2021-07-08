const Router = require('koa-router');
const Trigger = require('../models/triggers');

const { requireAuth, grantAccess } = require('../middleware/permController');

const router = new Router({
  prefix: '/triggers'
});

/**
 * @api {get} /api/v1/triggers/:id GET a trigger details.
 * @apiName GET a trigger details
 * @apiGroup Trigger
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the trigger to update
 *
 * @apiSuccess {Object} trigger Top level object
 * @apiSuccess {String} trigger[id] trigger id
 * @apiSuccess {String} trigger[name] name given to trigger
 * @apiSuccess {String} trigger[description] trigger explanation
 *
 */
router.get('/:id', requireAuth, grantAccess('readAny', 'private'), async ctx => {
  const trigger = await Trigger.query().findById(ctx.params.id).withGraphFetched('trigger_triggers(selectNameAndId)');

  // ctx.assert(trigger, 404, 'Not found', { errors: ['Bad Request'] } );
  ctx.assert(trigger, 404, null, { errors: ['Bad Request'] });

  ctx.status = 200;
  ctx.body = { trigger };
});

/**
 * @api {get} /api/v1/triggers GET all trigger details.
 * @apiName GET all trigger details
 * @apiGroup Trigger
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 *
 * @apiSuccess {Object[]} trigger Top level object
 * @apiSuccess {String} trigger[id] trigger id
 * @apiSuccess {String} trigger[name] name given to trigger
 * @apiSuccess {String} trigger[description] trigger explanation
 *
 */

router.get('/', requireAuth, async ctx => {
  const trigger = await Trigger.query().where(ctx.query);
  ctx.assert(trigger, 404);
  ctx.status = 200;
  ctx.body = { trigger };
});



/**
 * @api {post} /api/v1/triggers/ POST a new trigger.
 * @apiName POST a trigger details
 * @apiGroup Trigger
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {Object} trigger[id] trigger id
 * @apiParam (Request Body) {Object} trigger[name] name given to trigger
 * @apiParam (Request Body) {Object} trigger[description] trigger explanation
 *
 * @apiSuccess {Object} trigger Top level object
 * @apiSuccess {String} trigger[id] trigger id
 * @apiSuccess {String} trigger[name] name given to trigger
 * @apiSuccess {String} trigger[description] trigger explanation
 *
 */
router.post('/', requireAuth, async ctx => {
  let newTrigger = ctx.request.body.trigger;

  const trigger = await Trigger.query().insertAndFetch(newTrigger);
  ctx.assert(trigger, 401, 'Something went wrong');

  ctx.status = 201;

  ctx.body = { trigger };

});


/**
 * @api {put} /api/v1/triggers/:id PUT a trigger details.
 * @apiName PUT a trigger details
 * @apiGroup Trigger
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the trigger to update
  * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {Object} trigger[id] trigger id
 * @apiParam (Request Body) {Object} trigger[name] name given to trigger
 * @apiParam (Request Body) {Object} trigger[description] trigger explanation
 *
 * @apiSuccess {Object} trigger Top level object
 * @apiSuccess {String} trigger[id] trigger id
 * @apiSuccess {String} trigger[name] name given to trigger
 * @apiSuccess {String} trigger[description] trigger explanation
 *
 */
router.put('/:id', requireAuth, async ctx => {

  const triggerChecker = await Trigger.query().findById(ctx.params.id);
  ctx.assert(triggerChecker, 400, null, { errors: ['Bad Request'] });

  const trigger = await triggerChecker.$query().patchAndFetchById(ctx.params.id, ctx.request.body.trigger);
  ctx.status = 201;
  ctx.body = { trigger };
});


/**
 * @api {delete} /api/v1/triggers/:id Delete a trigger.
 * @apiName DELETE a trigger
 * @apiDescription DELETE a trigger using id
 * @apiGroup Trigger
 * @apiPermission [admin, superadmin]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id trigger id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 *
 */


router.delete('/:id', async ctx => {
  const trigger = await Trigger.query()
    .where({ isDeleted: false })
    .findById(ctx.params.id);
  ctx.assert(trigger, 400, 'Not found');

  await Trigger.$query()
    // .patch({ isDeleted: true });
    .delete();

  ctx.status = 200;
  ctx.body = { trigger };
});



module.exports = router.routes();
