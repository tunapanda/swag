const Router = require('koa-router');
const Lesson = require('../models/lesson');
const { validateLessons } = require('../middleware/validation/validatePostData');

const environment = process.env.NODE_ENV || 'development';
const config = require('../knexfile.js')[environment];
const knex = require('knex')(config);


const router = new Router({
  prefix: '/lessons'
});

async function returnType(parent) {
  if (parent.length == undefined) {
    parent.chapters.forEach(lesson => {
      return lesson.type = 'chapters';
    });
  } else {
    parent.forEach(mod => {
      mod.chapters.forEach(lesson => {
        return lesson.type = 'chapters';
      });
    });
  }
}

async function insertType(model, collection, parent_id) {
  try {
    for (let index = 0; index < collection.length; index++) {
      const element = collection[index];
      let data = {
        'chapters_id': element,
        'lesson_id': parent_id
      };
      knex(model).insert(data);
    }
  } catch (error) {
    // handle rejection
    console.log(error.message);

  }
}


router.get('/:id', async ctx => {
  const lesson = await Lesson.query().findById(ctx.params.id).eager('chapters(selectId)');

  ctx.assert(lesson, 404, 'no lesson by that ID');
  returnType(lesson);
  ctx.status = 200;
  ctx.body = { lesson };
});

router.get('/', async ctx => {
  try {
    const lesson = await Lesson.query().where(ctx.query).eager('chapters(selectId)');

    returnType(lesson);

    ctx.status = 200;
    ctx.body = { lesson };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'The query key does not exist' };

  }
});

router.post('/', validateLessons, async ctx => {
  let { chapters, ...newLesson}  = ctx.request.body.lesson;

  newLesson.slug = newLesson.name.replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-*|-*$/g, '')
    .toLowerCase();

  let lesson;
  try {
    lesson = await Lesson.query().insertAndFetch(newLesson);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }

  insertType('lesson_chapters', chapters, lesson.id);

  ctx.assert(lesson, 401, 'Something went wrong');

  ctx.status = 201;
  ctx.body = { lesson };

});


router.put('/:id', async ctx => {
  let { chapters, ...newLesson } = ctx.request.body.lesson;

  const checkLesson = await Lesson.query().findById(ctx.params.id);

  if (!checkLesson) {
    ctx.throw(400, 'That lesson path does not exist');
  }

  let lesson;
  try {
    lesson = await Lesson.query().patchAndFetchById(ctx.params.id, newLesson);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }


  await knex('lesson_chapters').where({ 'lesson_id': lesson.id }).del();
  insertType('lesson_chapters', chapters, lesson.id);

  ctx.status = 201;
  ctx.body = { lesson };

});
router.delete('/:id', async ctx => {
  const lesson = await Lesson.query().findById(ctx.params.id);

  if (!lesson) {
    ctx.throw(lesson, 401, 'No record with id');
  }
  await Lesson.query().delete().where({ id: ctx.params.id });

  ctx.status = 200;
  ctx.body = { lesson };
});

module.exports = router.routes();
