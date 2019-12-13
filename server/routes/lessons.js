const Router = require('koa-router');
const Lesson = require('../models/lesson');
const { validateLessons } = require('../middleware/validation/validatePostData');

const config = require('../knexfile.js')['development'];
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

async function insertType(model, collection, course_id) {
  for (let index = 0; index < collection.length; index++) {
    const element = collection[index];
    let data = {
      'module_id': element,
      'lesson_id': course_id
    };
    await knex(model).insert(data);
  }
}

router.get('/:id', async ctx => {
  const lesson = await Lesson.query().findById(ctx.params.id).eager('chapters(selectNameAndId)');

  ctx.assert(lesson, 404, 'no lesson by that ID');
  returnType(lesson);
  ctx.status = 200;
  ctx.body = { lesson };
});

router.get('/', async ctx => {
  try {
    const lesson = await Lesson.query().where(ctx.query).eager('chapters(selectNameAndId)');

    returnType(lesson);

    ctx.status = 200;
    ctx.body = { lesson };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'The query key does not exist' };

  }
});

router.post('/', validateLessons, async ctx => {

  let { modules_id, ...newLesson } = ctx.request.body.lesson;

  const lesson = await Lesson.query().insertAndFetch(newLesson).eager('chapters(selectNameAndId)');

  ctx.assert(lesson, 401, 'Something went wrong');

  insertType('module_lessons', modules_id, lesson.id);

  ctx.status = 201;
  ctx.body = { lesson };

});


router.put('/:id', async ctx => {
  let { modules_id, ...newLesson } = ctx.request.body.lesson;

  const lesson = await Lesson.query().patchAndFetchById(ctx.params.id, newLesson).eager('chapters(selectNameAndId)');

  if (!lesson) {
    ctx.throw(400, 'That lesson path does not exist');
  }

  const rookie = await knex('module_lessons').where('lesson_id', lesson.id);

  if (!modules_id == undefined) {
    let put_module = [];
    for (let index = 0; index < modules_id.length; index++) {
      put_module.push(modules_id[index]);
    }

    for (let index = 0; index < rookie.length; index++) {
      const rook = rookie[index].module_id;
      if (rook != put_module[index]) {
        await knex('module_lessons').where({ 'lesson_id': lesson.id, 'module_id': rook }).del();
        await knex('module_lessons').insert({ 'lesson_id': lesson.id, 'module_id': put_module[index] });
      }
    }
  }


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
