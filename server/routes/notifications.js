const Router = require('koa-router');

const NotificationModel = require('../models/notification');
const { requireAuth } = require('../middleware/permController');


const router = new Router({
  prefix: '/notifications'
});

/**
 * @api {get} /api/v1/notifications/:id GET notification by Id
 * @apiName Get a notification by Id
 * @apiGroup Notifications
 * @apiPermission [authenticated user]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization [Bearer << JWT here>>]
 *
 * @apiParam (URI Param) {String} id notification id
 *
 *
 * @apiSuccess {Object} notification Top level object
 * @apiSuccess {String} notification[id] notification id
 * @apiSuccess {String} notification[title] Title of the notification
 * @apiSuccess {String} notification[body] Body of the notification
 * @apiSuccess {Object} [notification[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiSuccess {Object} [notification[itemId]] Id of model record
 * @apiSuccess {String} notification[eventType] Type of event. Can be used to resolve related notification model.
 * @apiSuccess {String}  notification[recipientId]  Id of the user being notified
 * @apiSuccess {Boolean} notification[read]  if user has read the notification
 * @apiSuccess {Object} [notification[metadata]]  Any metadata related to the notification
 * @apiSuccess {String} notification[createdAt] date created
 * @apiSuccess {String} notification[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "notification":{
 *                 "id": "I3ml3x-AAPE",
 *                 "title": "Your chapter has been approved",
 *                 "body": "Your recently published chapter has been approved!",
 *                 "itemId": "I3lchuEAA80",
 *                 "eventType": "chapter-approved",
 *                 "model": "chapter",
 *                 "recipientId": "user2",
 *                 "creatorId": "user1",
 *                 "read": false,
 *                 "metadata":{"sendEmail": true},
 *                 "createdAt": "2021-04-20T20:12:39.830Z",
 *                 "updatedAt": "2021-04-20T20:12:39.830Z"
 *                }
 *          }
 *
 */
router.get('/:id', requireAuth, async (ctx) => {
  const notification = await NotificationModel.query()
    .findById(ctx.params.id);

  ctx.assert(notification, 404, { message: 'Notification not found' });
  ctx.status = 200;
  ctx.body = { notification };
});

/**
 * @api {get} /api/v1/notifications GET all notifications
 * @apiName Get all notifications
 * @apiGroup Notifications
 * @apiPermission [authenticated user]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization [Bearer << JWT here>>]
 *
 * @apiParam (Query Params) {String} [id] notification id
 * @apiParam (Query Params) {String} [title] Title of the notification
 * @apiParam (Query Params) {String} [body] Body of the notification
 * @apiParam (Query Params) {String} [model] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiParam (Query Params) {Object} [notification[itemId]] Id of referenced model record
 * @apiParam (Query Params) {String} [eventType] Type of event. Can be used to resolve related notification model.
 * @apiParam (Query Params) {String} [recipientId]  Id of the user being notified
 * @apiParam (Query Params) {String} [creatorId]  Id of the user who created the notification
 * @apiParam (Query Params) {Boolean} [read]  if user has read the notification
 *
 *
 * @apiSuccess {Object} notifications Top level object
 * @apiSuccess {String} notifications[id] notification id
 * @apiSuccess {String} notifications[title] Title of the notification
 * @apiSuccess {String} notifications[body] Body of the notification
 * @apiSuccess {Object} [notifications[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiSuccess {Object} [notifications[itemId]]  Id of model record
 * @apiSuccess {String} notifications[eventType] Type of event. Can be used to resolve related notification model.
 * @apiSuccess {String}  notifications[recipientId]  Id of the user being notified
 * @apiSuccess {Boolean} notifications[read]  if user has read the notification
 * @apiSuccess {Object} [notifications[metadata]]  Any metadata related to the notification
 * @apiSuccess {String} notifications[createdAt] date created
 * @apiSuccess {String} notifications[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "notifications":[{
 *                 "id": "I3ml3x-AAPE",
 *                 "title": "Your chapter has been approved",
 *                 "body": "Your recently published chapter has been approved!",
 *                 "itemId": "I3lchuEAA80",
 *                 "eventType": "chapter-approved",
 *                 "model": "chapter",
 *                 "recipientId": "user2",
 *                 "creatorId": "user1",
 *                 "read": false,
 *                 "metadata":{"sendEmail": true},
 *                 "createdAt": "2021-04-20T20:12:39.830Z",
 *                 "updatedAt": "2021-04-20T20:12:39.830Z"
 *                }]
 *          }
 *
 */
router.get('/', requireAuth, async (ctx) => {
  const notifications = await NotificationModel.query()
    .where(ctx.query);

  ctx.status = 200;
  ctx.body = { notifications };
});

/**
 * @api {post} /api/v1/notifications POST a notification
 * @apiName Post a notification
 * @apiGroup Notifications
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {String} notification[title] Title of the notification
 * @apiParam (Request Body) {String} notification[body] Body of the notification
 * @apiParam (Request Body) {Object} [notification[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiParam (Request Body) {Object} [notification[itemId]] Id of model record
 * @apiParam (Request Body) {String} notification[eventType] Type of event. Can be used to resolve related notification model.
 * @apiParam (Request Body) {String}  notification[recipientId]  Id of the user being notified
 * @apiParam (Request Body) {Boolean} notification[read]  if user has read the notification
 * @apiParam (Request Body) {Object} [notification[metadata]]  Any metadata related to the notification
 *
 *
 * @apiSuccess {Object} notification Top level object
 * @apiSuccess {String} notification[id] notification id
 * @apiSuccess {String} notification[title] Title of the notification
 * @apiSuccess {String} notification[body] Body of the notification
 * @apiSuccess {Object} [notification[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiSuccess {Object} [notification[itemId]] Id of model record
 * @apiSuccess {String} notification[eventType] Type of event. Can be used to resolve related notification model.
 * @apiSuccess {String}  notification[recipientId]  Id of the user being notified
 * @apiSuccess {Boolean} notification[read]  if user has read the notification
 * @apiSuccess {Object} [notification[metadata]]  Any metadata related to the notification
 * @apiSuccess {String} notification[createdAt] date created
 * @apiSuccess {String} notification[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *          {
 *             "notifications":[{
 *                 "id": "I3ml3x-AAPE",
 *                 "title": "Your chapter has been approved",
 *                 "body": "Your recently published chapter has been approved!",
 *                 "itemId": "I3lchuEAA80",
 *                 "eventType": "chapter-approved",
 *                 "model": "chapter",
 *                 "recipientId": "user2",
 *                 "creatorId": "user1",
 *                 "read": false,
 *                 "metadata":{"sendEmail": true},
 *                 "createdAt": "2021-04-20T20:12:39.830Z",
 *                 "updatedAt": "2021-04-20T20:12:39.830Z"
 *                }]
 *          }
 *
 *
 */
router.post('/', requireAuth, async ctx => {

  const obj = ctx.request.body.notification;
  const creatorId = ctx.state.user.data.id;

  const notification = await NotificationModel.query()
    .insertAndFetch({ ...obj, creatorId });

  ctx.status = 201;
  ctx.body = { notification };

});

/**
 * @api {put} /api/v1/notification PUT a notification
 * @apiName PUT a notification by Id
 * @apiGroup Notifications
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Notification Id to update
 *
 * @apiParam (Request Body) {String} [notification[title]] Title of the notification
 * @apiParam (Request Body) {String} [notification[body]] Body of the notification
 * @apiParam (Request Body) {Object} [notification[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiParam (Request Body) {Object} [notification[itemId]] Id of model record
 * @apiParam (Request Body) {String} [notification[eventType]] Type of event. Can be used to resolve related notification model.
 * @apiParam (Request Body) {String}  [notification[recipientId]]  Id of the user being notified
 * @apiParam (Request Body) {Boolean} [notification[read]]  if user has read the notification
 * @apiParam (Request Body) {Object} [notification[metadata]]  Any metadata related to the notification
 *
 *
 * @apiSuccess {Object} notification Top level object
 * @apiSuccess {String} notification[id] notification id
 * @apiSuccess {String} notification[title] Title of the notification
 * @apiSuccess {String} notification[body] Body of the notification
 * @apiSuccess {Object} [notification[model]] Model name related to notification (refer <a target="_blank" href="https://github.com/tunapanda/wikonnect/tree/master/frontend/app/models"> here </a>)
 * @apiSuccess {Object} [notification[itemId]] Id of model record
 * @apiSuccess {String} notification[eventType] Type of event. Can be used to resolve related notification model.
 * @apiSuccess {String}  notification[recipientId]  Id of the user being notified
 * @apiSuccess {Boolean} notification[read]  if user has read the notification
 * @apiSuccess {Object} [notification[metadata]]  Any metadata related to the notification
 * @apiSuccess {String} notification[createdAt] Date record was created
 * @apiSuccess {String} notification[updatedAt] Date record was updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "notification":{
 *                 "id": "I3ml3x-AAPE",
 *                 "title": "You have a new chapter comment",
 *                 "body": "Your recently approved chapter has received a comment!",
 *                 "itemId": "I3lchuEAA80",
 *                 "eventType": "chapter-comment",
 *                 "model": "chapter",
 *                 "recipientId": "user2",
 *                 "creatorId": "user1",
 *                 "read": false,
 *                 "metadata":{"sendEmail": false},
 *                 "createdAt": "2021-04-20T20:12:39.830Z",
 *                 "updatedAt": "2021-04-20T20:12:39.830Z"
 *                }
 *          }
 *
 */
router.put('/:id', requireAuth, async ctx => {
  let obj = ctx.request.body.notification;
  delete obj.id;

  const currentNotification = await NotificationModel.query()
    .findById(ctx.params.id);
  ctx.assert(currentNotification, 404, 'Notification does not exist');

  const notification = await currentNotification.$query()
    .patchAndFetch(obj);

  ctx.status = 200;
  ctx.body = { notification };

});

/**
 * @api {delete} /api/v1/notification/:id Delete a notification
 * @apiName DELETE a notification by Id
 * @apiGroup Notifications
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the notification to delete
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 *
 */
router.delete('/:id', requireAuth, async ctx => {
  const notification = await NotificationModel.query()
    .findById(ctx.params.id);

  ctx.assert(notification, 404, 'No notification with that Id exist');

  await notification.$query().delete();

  ctx.status = 200;
  ctx.body = {};

});


module.exports = router.routes();
