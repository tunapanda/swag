const Router = require('koa-router');

const SurveyModel = require('../models/survey');
const { requireAuth } = require('../middleware/permController');


const router = new Router({
  prefix: '/surveys'
});

/**
 * @api {get} /api/v1/surveys/:id GET survey by Id
 * @apiName Get a survey by Id
 * @apiGroup Surveys
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id survey id
 *
 *
 * @apiSuccess {Object} survey Top level object
 * @apiSuccess {String} survey[id] Survey id
 * @apiSuccess {String} survey[surveyType] Kind of the survey
 * @apiSuccess {String} survey[name] Name/title of the survey
 * @apiSuccess {String} survey[description] Short survey description/purpose
 * @apiSuccess {String} survey[expiry] When the survey will expire
 * @apiSuccess {String} survey[status] General survey status(published,draft,archive)
 * @apiSuccess {String} survey[surveyEmbed] An embed of the survey
 * @apiSuccess {String} survey[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiSuccess {Number} survey[frequency]  No. of times the trigger should happen
 * @apiSuccess {String} survey[creatorId] Lookup for the user who created the record
 * @apiSuccess {String} survey[createdAt] date created
 * @apiSuccess {String} survey[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "survey":{
 *                 "id": "I_QFVJaAAno",
 *                 "surveyType": "mne",
 *                 "name": "Wikonnect usability",
 *                 "status": "archived",
 *                 "description": "Give us feedback on how difficult on getting started on Wikonnect platform",
 *                 "expiry": "2022-04-12T18:51:51.867Z",
 *                 "surveyEmbed": "<iframe src='https://docs.google.com/forms/d/xyz?embedded=xyz'>loading…</iframe>",
 *                 "frequency": 8,
 *                 "triggerId": "I_QFVJGAAnc",
 *                 "creatorId": "user3",
 *                 "createdAt": "2021-03-22T19:25:00.075Z",
 *                 "updatedAt": "2021-06-07T05:16:54.118Z"
 *                }
 *          }
 *
 */
router.get('/:id', requireAuth, async (ctx) => {
  const survey = await SurveyModel.query()
    .findById(ctx.params.id);

  ctx.assert(survey, 404, { message: 'Survey not found' });
  ctx.status = 200;
  ctx.body = { survey: survey };
});

/**
 * @api {get} /api/v1/surveys GET all surveys
 * @apiName Get all surveys
 * @apiGroup Surveys
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Query Params) {String} [surveyType] Query surveys by category
 * @apiParam (Query Params) {String} [name] Filter surveys by survey[name]
 * @apiParam (Query Params) {String} [status] Filter surveys by survey[status]
 * @apiParam (Query Params) {Boolean} [expired] Filter survey by expiry status
 * @apiParam (Query Params) {String} [triggerId] Filter survey by survey[triggerId]
 * @apiParam (Query Params) {String} [creatorId] Filter survey by it's author
 *
 *
 * @apiSuccess {Object} surveys Top level object
 * @apiSuccess {String} surveys[id] Survey id
 * @apiSuccess {String} surveys[surveyType] Kind of the survey
 * @apiSuccess {String} surveys[name] Name/title of the survey
 * @apiSuccess {String} survey[description] Short survey description/purpose
 * @apiSuccess {String} surveys[expiry] When the survey will expire
 * @apiSuccess {String} survey[status] General survey status(published,draft,archive)
 * @apiSuccess {String} surveys[surveyEmbed] An embed of the survey
 * @apiSuccess {String} surveys[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiSuccess {Number} surveys[frequency]  No. of times the trigger should happen
 * @apiSuccess {String} surveys[creatorId] Lookup for the user who created the record
 * @apiSuccess {String} surveys[createdAt] date created
 * @apiSuccess {String} surveys[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "surveys":[{
 *                 "id": "I_QFVJaAAno",
 *                 "surveyType": "mne",
 *                 "name": "Wikonnect usability",
 *                 "status": "archived",
 *                 "description": "Give us feedback on how difficult on getting started on Wikonnect platform",
 *                 "expiry": "2022-04-12T18:51:51.867Z",
 *                 "surveyEmbed": "<iframe src='https://docs.google.com/forms/d/xyz?embedded=xyz'>loading…</iframe>",
 *                 "frequency": 8,
 *                 "triggerId": "I_QFVJGAAnc",
 *                 "creatorId": "user3",
 *                 "createdAt": "2021-03-22T19:25:00.075Z",
 *                 "updatedAt": "2021-06-07T05:16:54.118Z"
 *                }]
 *          }
 *
 */
router.get('/', requireAuth, async (ctx) => {
  let surveys;
  const queryExpired = ctx.query.expired;
  delete ctx.query.expired;

  if(queryExpired === 'true'){
    surveys=await SurveyModel.query()
      .where(ctx.query)
      .where('expiry', '<', new Date().toISOString());
  }else if(queryExpired === 'false'){
    surveys=await SurveyModel.query()
      .where(ctx.query)
      .where('expiry', '>=', new Date().toISOString());
  }else {
    surveys=await SurveyModel.query()
      .where(ctx.query);

  }

  ctx.status = 200;
  ctx.body = { surveys };
});

/**
 * @api {post} /api/v1/surveys POST a survey
 * @apiName Post a survey
 * @apiGroup Surveys
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {String} [surveyType[surveyType]=mne] Kind of the survey.
 * @apiParam (Request Body) {String} survey[name] Name/title of the survey
 * @apiParam (Request Body) {String} survey[description] Short survey description/purpose
 * @apiParam (Request Body) {String} survey[expiry] When the survey will expire
 * @apiParam (Request Body) {String} [survey[status]=published] Survey status(published,draft,archive).
 * @apiParam (Request Body) {String} survey[surveyEmbed] An embed of the survey
 * @apiParam (Request Body) {String} survey[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiParam (Request Body) {Number} [survey[frequency]=1]  No. of times the trigger should happen.
 *
 * @apiSuccess {Object} survey Top level object
 * @apiSuccess {String} survey[id] Survey id
 * @apiSuccess {String} survey[surveyType] Kind of the survey
 * @apiSuccess {String} survey[name] Name/title of the survey
 * @apiSuccess {String} survey[description] Short survey description/purpose
 * @apiSuccess {String} survey[status] General survey status(published,draft,archive)
 * @apiSuccess {String} survey[expiry] When the survey will expire
 * @apiSuccess {String} survey[surveyEmbed] An embed of the survey
 * @apiSuccess {String} survey[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiSuccess {Number} survey[frequency]  No. of times the trigger should happen
 * @apiSuccess {String} survey[creatorId] Lookup for the user who created the record
 * @apiSuccess {String} survey[createdAt] date created
 * @apiSuccess {String} survey[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "survey":{
 *                 "id": "I_QFVJaAAno",
 *                 "surveyType": "mne",
 *                 "name": "Wikonnect usability",
 *                 "status": "archived",
 *                 "description": "Give us feedback on how difficult on getting started on Wikonnect platform",
 *                 "expiry": "2022-04-12T18:51:51.867Z",
 *                 "surveyEmbed": "<iframe src='https://docs.google.com/forms/d/xyz?embedded=xyz'>loading…</iframe>",
 *                 "frequency": 8,
 *                 "triggerId": "I_QFVJGAAnc",
 *                 "creatorId": "user3",
 *                 "createdAt": "2021-03-22T19:25:00.075Z",
 *                 "updatedAt": "2021-06-07T05:16:54.118Z"
 *                }
 *          }
 *
 */
router.post('/', requireAuth, async ctx => {

  const obj = ctx.request.body.survey;
  const creatorId = ctx.state.user.data.id;

  const survey = await SurveyModel.query()
    .insertAndFetch({ ...obj, creatorId });

  ctx.status = 201;
  ctx.body = { survey };

});

/**
 * @api {put} /api/v1/survey/:id PUT a survey
 * @apiName PUT a survey by Id
 * @apiGroup Surveys
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id survey Id to update
 *
 * @apiParam (Request Body) {String} [survey[surveyType]=mne] Kind of the survey.
 * @apiParam (Request Body) {String} survey[name] Name/title of the survey
 * @apiParam (Request Body) {String} survey[description] Short survey description/purpose
 * @apiParam (Request Body) {String} survey[expiry] When the survey will expire
 * @apiParam (Request Body) {String} [survey[status]=published] Survey status(published,draft,archive).
 * @apiParam (Request Body) {String} survey[surveyEmbed] An embed of the survey
 * @apiParam (Request Body) {String} survey[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiParam (Request Body) {Number} [survey[frequency]=1]  No. of times the trigger should happen.
 *
 * @apiSuccess {Object} survey Top level object
 * @apiSuccess {String} survey[id] Survey id
 * @apiSuccess {String} survey[surveyType] Kind of the survey
 * @apiSuccess {String} survey[name] Name/title of the survey
 * @apiSuccess {String} survey[description] Short survey description/purpose
 * @apiSuccess {String} survey[status] General survey status(published,draft,archive)
 * @apiSuccess {String} survey[expiry] When the survey will expire
 * @apiSuccess {String} survey[surveyEmbed] An embed of the survey
 * @apiSuccess {String} survey[triggerId] Lookup for the action that should trigger issuing of the survey
 * @apiSuccess {Number} survey[frequency]  No. of times the trigger should happen
 * @apiSuccess {String} survey[creatorId] Lookup for the user who created the record
 * @apiSuccess {String} survey[createdAt] date created
 * @apiSuccess {String} survey[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *          {
 *             "survey":{
 *                 "id": "I_QFVJaAAno",
 *                 "surveyType": "mne",
 *                 "name": "Wikonnect usability",
 *                 "status": "archived",
 *                 "description": "Give us feedback on how difficult on getting started on Wikonnect platform",
 *                 "expiry": "2022-04-12T18:51:51.867Z",
 *                 "surveyEmbed": "<iframe src='https://docs.google.com/forms/d/xyz?embedded=xyz'>loading…</iframe>",
 *                 "frequency": 8,
 *                 "triggerId": "I_QFVJGAAnc",
 *                 "creatorId": "user3",
 *                 "createdAt": "2021-03-22T19:25:00.075Z",
 *                 "updatedAt": "2021-06-07T05:16:54.118Z"
 *                }
 *          }
 *
 */
router.put('/:id', requireAuth, async ctx => {
  let obj = ctx.request.body.survey;
  delete obj.id;

  const old = await SurveyModel.query()
    .findById(ctx.params.id);
  ctx.assert(old, 404, 'Survey does not exist');

  const survey = await old.$query()
    .patchAndFetch(obj);

  ctx.status = 200;
  ctx.body = { survey };

});

/**
 * @api {delete} /api/v1/surveys/:id Delete a survey
 * @apiName DELETE a survey by Id
 * @apiGroup Surveys
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the survey to delete
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 *
 */
router.delete('/:id', requireAuth, async ctx => {
  const survey = await SurveyModel.query()
    .findById(ctx.params.id);

  ctx.assert(survey, 404, 'No survey with that Id exist');

  await survey.$query().delete();

  ctx.status = 200;
  ctx.body = {};

});


module.exports = router.routes();
