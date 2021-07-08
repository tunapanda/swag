const Router = require('koa-router');

const log = require('../utils/logger');
const Rating = require('../models/rating');
const { requireAuth } = require('../middleware/permController');
const validateRating = require('../middleware/validateRoutePostSchema/validateRating');

const router = new Router({
  prefix: '/ratings'
});


/**
 * @api {get} /api/v1/ratings/:id GET chapter rating by Id
 * @apiName Get rating by Id
 * @apiGroup Ratings and Review
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id rating id
 *
 * @apiParam (Query Params) {Boolean} [isDeleted] filter by deleted status
 * @apiParam (Query Params) {String} [include] relationships to eager load (comma separated)
 *
 * @apiSuccess {Object} rating Top level object
 * @apiSuccess {String} rating[id] rating id
 * @apiSuccess {String} rating[chapterId] associated chapter Id
 * @apiSuccess {Object} rating[metadata] rating metadata
 * @apiSuccess {String} rating[userId] rating owner
 * @apiSuccess {String} rating[averageRating] average record rating
 * @apiSuccess {Boolean} rating[isDeleted]  if record was deleted
 * @apiSuccess {String} rating[createdAt] date created
 * @apiSuccess {String} rating[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "rating":{
 *           "id": "IzM6odwAASI",
 *           "chapterId": "IzMs75WAAA0",
 *           "reaction": "like",
 *           "metadata":{"language": 2, "audioQuality": 1, "contentAccuracy": 1},
 *           "userId": "user1",
 *           "averageRating": "1.33",
 *           "isDeleted": false,
 *           "createdAt": "2021-03-24T11:51:33.520Z",
 *           "updatedAt": "2021-03-24T11:51:33.520Z"
 *         }
 *      }
 *
 *
 */

router.get('/:id', requireAuth, async ctx => {

  const stateUserId = ctx.state.user.id === undefined ? ctx.state.user.data.id : ctx.state.user.id;

  const { include } = ctx.query;

  const includeReview = include ? include.toLowerCase().includes('review') : false;

  try {
    const rating = includeReview ?
      await Rating.query()
        .findById(ctx.params.id)
        .withGraphFetched('review') :
      await Rating.query()
        .findById(ctx.params.id);

    if (rating.userId !== stateUserId || stateUserId === 'anonymous') {
      log.info('Error logging  %s for %s', ctx.request.ip, ctx.path);
      ctx.throw(403, 'You do not have permissions to view that user');
    }

    ctx.status = 200;
    ctx.body = { rating };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(400, null, { errors: [e.message] });
    }
  }
});


/**
 * @api {get} /api/v1/ratings GET all chapter ratings
 * @apiName Get all ratings
 * @apiGroup Ratings and Review
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Query Params) {Boolean} [isDeleted] filter by deleted status
 * @apiParam (Query Params) {String} [include] relationships to eager load (comma separated)
 *
 * @apiSuccess {Object[]} ratings Top level object
 * @apiSuccess {String} rating[id] rating id
 * @apiSuccess {String} rating[chapterId] associated chapter Id
 * @apiSuccess {Object} rating[metadata] rating metadata
 * @apiSuccess {String} rating[userId] rating owner
 * @apiSuccess {String} rating[averageRating] average record rating
 * @apiSuccess {Boolean} rating[isDeleted]  if record was deleted
 * @apiSuccess {String} rating[createdAt] date created
 * @apiSuccess {String} rating[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *      "ratings":[{
 *         "id": "IzM6odwAASI",
 *         "chapterId": "IzMs75WAAA0",
 *         "reaction": "like",
 *         "metadata": {"language": 2, "audioQuality": 1, "contentAccuracy": 1},
 *         "userId": "user1",
 *         "averageRating": "1.33",
 *         "isDeleted": false,
 *         "createdAt": "2021-03-24T11:51:33.520Z",
 *         "updatedAt": "2021-03-24T11:51:33.520Z"
 *        }]
 *      }
 *
 *
 */

router.get('/', requireAuth, async ctx => {

  const { include } = ctx.query;
  delete ctx.query.include;

  const includeReview = include ? include.toLowerCase().includes('review') : false;

  try {
    const ratings = includeReview ?
      await Rating.query()
        .where(ctx.query)
        .withGraphFetched('review') :
      await Rating.query()
        .where(ctx.query);

    ctx.status = 200;
    ctx.body = { ratings };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(400, null, { errors: [e.message] });
    }
  }


});

/**
 * @api {post} /api/v1/ratings POST a chapter rating
 * @apiName Post a chapter rating
 * @apiGroup Ratings and Review
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Request Body) {Object} rating[metadata] rating metadata
 * @apiParam (Request Body) {String} rating[chapterId] chapter being rated
 * @apiParam (Request Body) {String} rating[reaction] chapter reaction
 * @apiParam (Request Body) {Object} [rating[review]]  related review object  (check POST review docs)
 *
 * @apiSuccess {Object} rating Top level object
 * @apiSuccess {String} rating[id] rating id
 * @apiSuccess {String} rating[chapterId] associated chapter Id
 * @apiSuccess {Object} rating[metadata] rating metadata
 * @apiSuccess {String} rating[userId] rating owner
 * @apiSuccess {String} rating[averageRating] average record rating
 * @apiSuccess {Boolean} rating[isDeleted]  if record was deleted
 * @apiSuccess {String} rating[createdAt] date created
 * @apiSuccess {String} rating[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "rating":{
 *           "id": "IzM6odwAASI",
 *           "chapterId": "IzMs75WAAA0",
 *           "reaction": "like",
 *           "metadata":{"language": 2, "audioQuality": 1, "contentAccuracy": 1},
 *           "userId": "user1",
 *           "averageRating": "1.33",
 *           "isDeleted": false,
 *           "createdAt": "2021-03-24T11:51:33.520Z",
 *           "updatedAt": "2021-03-24T11:51:33.520Z"
 *         }
 *      }
 *
 *
 */
router.post('/', requireAuth, validateRating, async ctx => {

  const obj = ctx.request.body.rating;
  const userId = ctx.state.user.data.id;

  //check they don't have existing rating
  const selectedRatings = await Rating.query().where({ isDeleted: false, userId, chapterId: obj.chapterId });
  if (selectedRatings.length > 0) {
    ctx.throw(400, 'You have already rated the chapter');
  }


  const ratings = Object.values(obj.metadata);
  const totalRating = ratings.reduce((acc, val) => {
    if (val > 5) {
      ctx.throw(400, 'Rating cannot be greater than 5');
    }
    acc += +val;
    return acc;
  }, 0);

  const averageRating = totalRating / ratings.length;

  try {
    const review = obj.review;
    delete obj.review;

    let rating;
    if (review) {

      review.chapterId = obj.chapterId;
      review.reaction = obj.reaction;

      rating = await Rating.query().insertGraphAndFetch({
        ...obj, userId, averageRating,
        review: { ...review, userId },
      });
    } else {
      rating = await Rating.query()
        .insertAndFetch({ ...obj, userId, averageRating });
    }

    ctx.assert(rating, 500, 'Something went wrong');

    ctx.status = 201;
    ctx.body = { rating };

  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(400, null, { errors: [e.message] });
    }
  }
});


/**
 * @api {put} /api/v1/ratings/:id PUT a chapter rating
 * @apiName PUT a chapter rating
 * @apiGroup Ratings and Review
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the rating to update
 *
 * @apiParam (Request Body) {String} [rating[id]] rating id
 * @apiParam (Request Body) {String} [rating[chapterId]] associated chapter Id
 * @apiParam (Request Body) {Object} [rating[metadata]] rating metadata
 * @apiParam (Request Body) {Object} [rating[review]] related review object (check POST review docs)
 *
 * @apiSuccess {Object} rating Top level object
 * @apiSuccess {String} rating[id] rating id
 * @apiSuccess {String} rating[chapterId] associated chapter Id
 * @apiSuccess {Object} rating[metadata] rating metadata
 * @apiSuccess {String} rating[userId] rating owner
 * @apiSuccess {String} rating[averageRating] average record rating
 * @apiSuccess {Boolean} rating[isDeleted] if record was deleted
 * @apiSuccess {String} rating[createdAt] date created
 * @apiSuccess {String} rating[updatedAt] date updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "rating":{
 *           "id": "IzM6odwAASI",
 *           "chapterId": "IzMs75WAAA0",
 *           "reaction": "like",
 *           "metadata":{"language": 2, "audioQuality": 1, "contentAccuracy": 1},
 *           "userId": "user1",
 *           "averageRating": "1.33",
 *           "isDeleted": false,
 *           "createdAt": "2021-03-24T11:51:33.520Z",
 *           "updatedAt": "2021-03-24T11:51:33.520Z"
 *         }
 *      }
 *
 *
 */
router.put('/:id', requireAuth, async ctx => {
  const userId = ctx.state.user.data.id;

  //check if the rating exist
  const currentRating = await Rating.query()
    .where({ isDeleted: false, id: ctx.params.id, userId });

  ctx.assert(currentRating, 404, 'Rating does not exist');

  let obj = ctx.request.body.rating;

  if (obj.metadata) {
    const ratings = Object.values(obj.metadata);
    const totalRating = ratings.reduce((acc, val) => {
      if (val > 5) {
        ctx.throw(400, 'Rating cannot be greater than 5');
      }
      acc += +val;
      return acc;
    }, 0);

    const averageRating = totalRating / ratings.length;

    obj = { ...obj, averageRating };
  }

  try {
    const review = obj.review;
    delete obj.review;

    let rating = await Rating.query()
      .patchAndFetchById(ctx.params.id, obj);

    if (review) {
      /*Update related review*/
      await rating.$relatedQuery('review')
        .patch(review);
      rating = await rating.$query().withGraphFetched('review');

    }

    ctx.status = 200;
    ctx.body = { rating };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(400, null, { errors: ['Bad Request'] });
    }
  }

});

/**
 * @api {delete} /api/v1/ratings/:id Delete a chapter rating and review
 * @apiName DELETE ratings and review by Id
 * @apiGroup Ratings and Review
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id rating id
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 *
 */
router.delete('/:id', requireAuth, async ctx => {
  const rating = await Rating.query()
    .where({ isDeleted: false })
    .findById(ctx.params.id);

  if (!rating) {
    ctx.throw(400, 'No record with id');
  }

  try {
    const rating = await Rating.query()
      .patchAndFetchById(ctx.params.id, { isDeleted: true });

    /*Update related review*/
    await rating.$relatedQuery('review')
      .patch({ isDeleted: true });

    ctx.status = 200;
    ctx.body = {};
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(400, null, { errors: ['Bad Request'] });
    }
  }
});

module.exports = router.routes();
