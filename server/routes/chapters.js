const Router = require('koa-router');
const path = require('path');
const unzipper = require('unzipper');
const busboy = require('async-busboy');
const { ref } = require('objection');
const { nanoid } = require('nanoid/async');
const sharp = require('sharp');
const koaBody = require('koa-body')({ multipart: true, multiples: false, keepExtensions: true });

const s3 = require('../utils/s3Util');
const log = require('../utils/logger');
const slugGen = require('../utils/slugGen');
const Chapter = require('../models/chapter');
const Rating = require('../models/rating');
const Counter = require('../models/counter');
const permController = require('../middleware/permController');
const validateGetChapter = require('../middleware/validateRequests/chapterGetValidation');
const Reaction = require('../models/reaction');
const { getProfileImage } = require('../utils/routesUtils/userRouteUtils');
const { eventEmitter } = require('./../utils/event-emitter');
const { eventCodes } = require('./../utils/events-classification');

const router = new Router({
  prefix: '/chapters'
});

/**
 * @api {get} /api/v1/chapters/ GET all chapters.
 * @apiName GetChapters
 * @apiGroup Chapters
 * @apiPermission none
 * @apiDescription Get all chapters. Filter enabled through query params using available chapter properties
 *
 * @apiParam  (Query Params) {String} [chapter[name]] Query by chapter
 * @apiParam  (Query Params) {String} [chapter[status]] Query by chapter status - published | draft
 * @apiParam  (Query Params) {String} [chapter[creatorId]] Query by author of a chapter
 * @apiParam  (Query Params) {Boolean} [chapter[approved]] Query by approval status
 * @apiParam  (Query Params) {String} [chapter[tags]] Query by tags-separated by comma
 *
 * @apiHeader {String} [Authorization] Bearer << JWT here>>
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *        "meta": {
 *            "total_pages": 20.2
 *        },
 *        "chapters": [{
 *            "id": "chapter1",
 *            "lessonId": "lesson1",
 *            "name": "A Chapter",
 *            "slug": "a-chapter",
 *            "description": "An H5P Chapter.",
 *            "status": "published",
 *            "creatorId": "user1",
 *            "metadata": null,
 *            "createdAt": "2017-12-20T16:17:10.000Z",
 *            "updatedAt": "2017-12-20T16:17:10.000Z",
 *            "contentType": "h5p",
 *            "contentUri": "/uploads/h5p/chapter1",
 *            "imageUrl": null,
 *            "tags": [ "highschool", "university" ],
 *            "contentId": null,
 *            "approved": true,
 *            "verified": true,
 *            "topics": null,
 *            "views": "3",
 *            "ratings": "3.6666666666666667",
 *            "authenticatedUser": null,
 *            "authenticatedUserReactionId": null,
 *            "reviewQuestions":["audioVideoQuality", "soundQuality", "videoQuality", "creativity"],
 *            "reaction": [{
 *                "totalLikes": "4",
 *                "likes": "3",
 *                "dislikes": "1"
 *               }],
 *            "flag": [],
 *            "author": {
 *                "username": "user1",
 *                "profileUri": null,
 *                "lastSeen": "2021-02-25T09:19:08.239Z"
 *            }
 *        }]
 *    }
 *
 * @apiSampleRequest /api/v1/chapters/
 *
 */

router.get('/', permController.requireAuth, validateGetChapter, async ctx => {
  let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;

  let { page, per_page } = ctx.query;
  delete ctx.query.page;
  delete ctx.query.per_page;
  let chapter;
  let queryTags = [];
  try {
    if (ctx.query.tags) {
      queryTags = ctx.query.tags.split(',');
      delete ctx.query.tags;
    }
    // View counter for each chapter
    chapter = await Chapter.query()
      .select([
        'chapters.*',
        Counter.query()
          .where({ 'chapterId': ref('chapters.id'), 'trigger': 'timerDelay' })
          .count()
          .as('views'),
        Rating.query()
          .where('chapterId', ref('chapters.id'))
          .where('isDeleted', false)
          .avg('ratings.average_rating')
          .as('ratings'),
        Reaction.query()
          .select('reaction')
          .where('userId', stateUserId)
          .andWhere('chapterId', ref('chapters.id'))
          .as('authenticated_user'),
        Reaction.query()
          .select('id')
          .where('userId', stateUserId)
          .andWhere('chapterId', ref('chapters.id'))
          .as('authenticated_user_reaction_id')
      ])
      .where(ctx.query)
      .where((builder)=>{
        if (queryTags.length > 0) {
          builder.where('tags', '@>', queryTags);
        }
      })
      .page(page, per_page)
      .withGraphFetched(
        '[reaction(reactionAggregate), flag(selectFlag),author()]'
      )
      .orderBy('createdAt', 'desc');

    /**retrieve correct user image**/
    //so not to re-fetch the profile, remove duplicates (handy if network requests to S3 are being done ),
    const authors = [];
    let authorIds = {};
    for (let i = 0; i < chapter.results.length; i++) {
      if (!chapter.results[i].author) {
        continue;
      }
      if (!authorIds[chapter.results[i].author.id]) {
        authors.push(chapter.results[i].author);
        authorIds[chapter.results[i].author.id] = true;
      }

    }
    const promises = authors.map(async (author) => {
      return {
        id: author.id,
        name: author.name,
        username: author.username,
        profileUri: await getProfileImage(author)
      };
    });
    const authorProfiles = await Promise.all(promises);
    //now map above profiles
    chapter.results = chapter.results.map((chap) => {
      if (!chap.author) {
        //just in case 😁
        chap.author = { name: 'Private', username: 'Private', id: 'Private', profileUri: 'anonymous' };
        return chap;
      }
      const profile = authorProfiles.find((p) => p.id === chap.author.id);
      if (profile) {
        chap.author = profile;
      } else {
        //just in case 👽
        chap.author = { name: 'Private', username: 'Private', id: 'Private', profileUri: 'anonymous' };
      }
      return chap;
    });

  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: [e.message] }); }
    throw e;
  }

  chapter = {
    meta: {
      total_pages: chapter.total / per_page
    },
    chapters: chapter.results,
  };

  ctx.assert(chapter, 404, 'No chapter by that ID');
  ctx.status = 200;
  ctx.body = chapter;

});

/**
 * @api {get} /api/v1/chapters/:id GET single chapter.
 * @apiName GetAChapter
 * @apiGroup Chapters
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} [Authorization] Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the chapter to update
 *
 * @apiSuccess {Object} chapter[object] Chapter data
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "chapter": {
 *            "id": "chapter1",
 *            "lessonId": "lesson1",
 *            "name": "A Chapter",
 *            "slug": "a-chapter",
 *            "description": "An H5P Chapter.",
 *            "status": "published",
 *            "creatorId": "user1",
 *            "createdAt": "2017-12-20T16:17:10.000Z",
 *            "updatedAt": "2017-12-20T16:17:10.000Z",
 *            "contentType": "h5p",
 *            "contentUri": "/uploads/h5p/chapter1",
 *            "imageUrl": "/uploads/images/content/chapters/chapter1.jpeg",
 *            "contentId": null,
 *            "tags": [],
 *            "likes": "0",
 *            "dislikes": "0",
 *            "rating": null,
 *            "verified": true,
 *            "reviewQuestions":["audioVideoQuality", "soundQuality", "videoQuality", "creativity"],
 *            "author": {
 *              "username": "user1",
 *              "profileUri": null,
 *              "lastSeen": "2021-02-22T11:57:10.468Z"
 *            },
 *            "reaction": [{
 *              "likes": 3,
 *              "authenticated_user": "like",
 *              "reaction.id": "",
 *              "dislikes": 1
 *            }]
 *         }
 *      }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.get('/:id', permController.requireAuth, async ctx => {

  let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;
  try {
    let results = await Chapter.query()
      .select([
        'chapters.*',
        Counter.query()
          .where({ 'chapterId': ref('chapters.id'), 'trigger': 'timerDelay' })
          .count()
          .as('views'),
        Rating.query()
          .where('chapterId', ref('chapters.id'))
          .avg('ratings.average_rating')
          .as('ratings'),
        Reaction.query()
          .select('reaction')
          .where('userId', stateUserId)
          .andWhere('chapterId', ref('chapters.id'))
          .as('authenticated_user')

      ])
      .where({ 'chapters.id': ctx.params.id })
      .withGraphFetched(
        '[reaction(reactionAggregate), flag(selectFlag),author()]'
      );
    ctx.assert(results[0], 404, 'Chapter not found');
    const chapter = results[0];
    //retrieve correct user image
    if (chapter.author) {
      chapter.author = {
        id: chapter.author.id,
        name: chapter.author.name,
        username: chapter.author.username,
        profileUri: await getProfileImage(chapter.author)
      };
    }
    ctx.status = 200;
    ctx.body = { chapter };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }


});


/**
 * @api {post} /api/v1/chapters POST single chapter.
 * @apiName PostAChapter
 * @apiGroup Chapters
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiSampleRequest off
 *
 * @apiParam (Request Body) {String} chapter[name] Name of the chapter.
 * @apiParam (Request Body) {String} chapter[description] Description of the chapter.
 * @apiParam (Request Body) {String} chapter[status] Chapter status - published | draft
 * @apiParam (Request Body) {Boolean} [chapter[approved]] If chapter has been approved: Default is false
 * @apiParam (Request Body) {Object[]} [chapter[tags]] Tags list.
 * @apiParam (Request Body) {Object[]} [chapter[reviewQuestions]] An array of review question categories.
 *
 * @apiSampleRequest off
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "chapter": {
 *        "id": "chapter4",
 *        "lessonId": "lesson2",
 *        "name": "A Chapter4",
 *        "slug": "a-chapter4",
 *        "description": "An H5P Chapter.",
 *        "status": "published",
 *        "creatorId": "user1",
 *        "createdAt": "2017-12-20T16:17:10.000Z",
 *        "updatedAt": "2017-12-20T16:17:10.000Z",
 *        "contentType": "h5p",
 *        "contentUri": "/uploads/h5p/chapter4",
 *        "imageUrl": null,
 *        "contentId": null,
 *        "reviewQuestions":["audioVideoQuality", "soundQuality", "videoQuality", "creativity"],
 *        "tags": [],
 *        "approved": false
 *      }
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */
router.post('/', permController.requireAuth, async ctx => {
  let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;
  let newChapter = ctx.request.body.chapter;

  // Server side slug generator
  newChapter.slug = await slugGen(newChapter.name);
  newChapter.creatorId = stateUserId;
  if (newChapter.approved === undefined) {
    newChapter.approved = false;
  }

  let chapter;
  try {
    chapter = await Chapter.query().insertAndFetch(newChapter);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }
  ctx.assert(chapter, 401, 'Something went wrong');

  ctx.status = 201;
  ctx.body = { chapter };

});


/**
 * @api {put} /api/v1/chapters/:id PUT single chapter.
 * @apiName PutAChapter
 * @apiGroup Chapters
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiSampleRequest off
 *
 * @apiParam (URI Param) {String} id Id of the chapter to update
 *
 * @apiParam (Request Body) {String} [chapter[name]] Name of the chapter.
 * @apiParam (Request Body) {String} [chapter[description]] Description of the chapter.
 * @apiParam (Request Body) {String} [chapter[status]] Chapter status - published | draft
 * @apiParam (Request Body) {Boolean} [chapter[approved]] If chapter has been approved: Default is false
 * @apiParam (Request Body) {Object[]} [chapter[tags]] Tags list.
 * @apiParam (Request Body) {Object[]} [chapter[reviewQuestions]] An array of review question categories.
 *
 * @apiSampleRequest /api/v1/chapters/:id
 *
 * @apiSuccess {Object[]} chapter[object] Object data
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */
router.put('/:id', permController.requireAuth, async ctx => {
  let chapterData = ctx.request.body.chapter;
  if (chapterData.id) delete chapterData.id;
  //TODO: enable permissions checking so only allowed users can approve and verify

  const chapterCheck = await Chapter.query().findById(ctx.params.id);
  ctx.assert(chapterCheck, 404, 'Invalid data provided');

  const justPublished = chapterCheck.status !== 'published' && chapterData.status === 'published';
  const justApproved = (!chapterCheck.approved || chapterCheck.approved !== true) && chapterData.approved === true;
  try {
    const chapter = await chapterCheck.$query().patchAndFetchById(ctx.params.id, chapterData);

    // emit a Node event if it has just been published
    if (justPublished) {
      eventEmitter.emit(eventCodes.chapter.published, chapter);
    }

    // emit a Node event if it has just been approved
    if (justApproved) {
      eventEmitter.emit(eventCodes.chapter.approved, chapter);
    }

    ctx.status = 201;
    ctx.body = { chapter };
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: [e.message] }); }
    throw e;
  }
});


/**
 * @api {delete} /api/v1/review/:id Delete a chapter
 * @apiName DELETE a chapter by Id
 * @apiGroup Chapters
 * @apiPermission authenticated user
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} id Id of the chapter to delete
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     { }
 *
 */
router.delete('/:id', permController.requireAuth, async ctx => {
  const chapter = await Chapter.query().findById(ctx.params.id);
  ctx.assert(chapter, 404, 'No chapter with that identifier was found');

  await Chapter.query()
    .delete()
    .where({ id: ctx.params.id });

  if (chapter.approved && chapter.approved === true) {
    eventEmitter.emit(eventCodes.approvedChapter.deleted, chapter);
  }
  ctx.status = 200;
  ctx.body = { chapter };
});


/**
 * @api {post} /api/v1/chapters/:id/chapter-image POST chapter banner image.
 * @apiName PostBannerImage
 * @apiGroup Chapters
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "host": hostname of where the image has been uploaded
 *      "path": image path
 *    }
 *
 * @apiSuccess {String} host
 * @apiSuccess {String} path
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */
router.post('/:id/chapter-image', permController.requireAuth, koaBody, async (ctx) => {
  const chapter_id = ctx.params.id;

  ctx.assert(ctx.request.files.file, 400, 'No file image uploaded');

  const fileNameBase = await nanoid(11);
  const uploadPath = '/uploads/chapters';
  const uploadDir = path.resolve(__dirname, '../public/' + uploadPath);

  const { file } = ctx.request.files;

  const fileExtension = path.extname(file.name);

  if (!['.webp', '.svg', '.png', '.jpeg', '.gif', '.avif', '.jpg'].includes(fileExtension)) {
    ctx.throw(400, { error: 'Image format not supported' });
  }

  let resizer;
  try {
    resizer = await sharp(file.path)
      .resize(328, 200)
      .jpeg({ quality: 70 });
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else {
      ctx.throw(500, null, { errors: [e.message] });
    }
  }

  if (s3.config) {
    let buffer = await resizer.toBuffer();
    const params = {
      Bucket: s3.config.bucket, // pass your bucket name
      Key: `/uploads/chapters/${fileNameBase}.jpg`, // key for saving filename
      Body: buffer, //image to be uploaded
      ACL: 'public-read'
    };

    try {
      //Upload image to AWS S3 bucket
      const uploaded = await s3.s3.upload(params).promise();
      log.info('Uploaded in:', uploaded.Location);
      await Chapter.query().patchAndFetchById(chapter_id, { imageUrl: uploaded.Location });

      ctx.body = {
        host: `${params.Bucket}.s3.amazonaws.com/uploads/chapters`,
        path: `${fileNameBase}.jpg`
      };
    } catch (e) {
      log.error(e);
      ctx.throw(e.statusCode, null, { message: e.message });
    }

  } else {

    await resizer.toFile(`${uploadDir}/${fileNameBase}.jpg`);


    await Chapter.query()
      .findById(chapter_id)
      .patch({
        imageUrl: `${uploadPath}/${fileNameBase}.jpg`
      });

    ctx.body = {
      host: ctx.host,
      path: `${uploadPath}/${fileNameBase}.jpg`
    };
  }
});



/**
 * @apiDeprecated use now (#HP5:Save H5P).
 * @api {post} /api/v1/chapters/:id/upload upload H5P chapter
 * @apiName PostAH5PChapter
 * @apiGroup Chapters
 * @apiPermission none
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        host: ctx.host,
 *        path: uploadPath
 *      }
 * @apiSuccess {String} host
 * @apiSuccess {String} path
 *
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error
 */

router.post('/:id/upload', async ctx => {
  const dirName = ctx.params.id;
  const uploadPath = `/uploads/h5p/${dirName}`;
  const uploadDir = path.resolve(__dirname, '../public' + uploadPath);

  await Chapter.query()
    .findById(dirName)
    .patch({
      content_uri: uploadPath
    });


  await busboy(ctx.req, {
    onFile: function (fieldname, file) {
      file.pipe(unzipper.Extract({ path: uploadDir }));
    }
  });
  // ctx.assert(files.length, 400, 'No files sent.');
  // ctx.assert(files.length === 1, 400, 'Too many files sent.');

  ctx.body = {
    host: ctx.host,
    path: uploadPath
  };
});

module.exports = router.routes();
