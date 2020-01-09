const Router = require('koa-router');
const Lesson = require('../models/lesson');
const { validateLessons } = require('../middleware/validation/validatePostData');

const router = new Router({
  prefix: '/lessons'
});

async function returnType(parent) {
  if (parent.length == undefined) {
    parent.chapters.forEach(chapter => {
      return chapter.type = 'chapters';
    });
  } else {
    parent.forEach(mod => {
      mod.chapters.forEach(chapter => {
        return chapter.type = 'chapters';
      });
    });
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
    let lesson = await Lesson.query().where(ctx.query).eager('chapters(selectNameAndId)');

    returnType(lesson);

    ctx.status = 200;
    ctx.body = { lesson };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'The query key does not exist' };

  }
});

router.post('/', validateLessons, async ctx => {
  let newLesson = ctx.request.body.lesson;

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

  ctx.assert(lesson, 401, 'Something went wrong');

  ctx.status = 201;
  ctx.body = { lesson };

});


router.put('/:id', async ctx => {
  let newLesson = ctx.request.body.lesson;

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
