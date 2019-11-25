const Router = require('koa-router');
const Chapter = require('../models/chapter');
const validateChapter = require('../middleware/validation/validateChapter');
const queryStringSearch = require('../middleware/queryStringSearch');

const router = new Router({
  prefix: '/chapters'
});


async function returnType(parent) {
  try {
    if (parent.length == undefined) {
      parent.lesson.forEach(lesson => {
        return lesson.type = 'lessons';
      });
    } else {
      parent.forEach(mod => {
        mod.lesson.forEach(lesson => {
          return lesson.type = 'lessons';
        });
      });
    }
  } catch (error) {
    null;
  }
}

router.get('/', queryStringSearch, async ctx => {
  try {
    const chapter = await Chapter.query().where(ctx.query).eager('lesson(selectNameAndId)');
    returnType(chapter);
    ctx.status = 200;
    ctx.body = { chapter };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'The query key does not exist' };
  }
});

router.get('/:id', async ctx => {
  const chapter = await Chapter.query().findById(ctx.params.id).eager('lesson(selectNameAndId)');

  if (!chapter) {
    ctx.assert(chapter, 404, 'no lesson by that ID');
  }

  returnType(chapter);

  ctx.status = 200;
  ctx.body = { chapter };
});

router.post('/', validateChapter, async ctx => {
  let newChapter = ctx.request.body;

  const chapter = await Chapter.query().insertAndFetch(newChapter);
  if (!chapter) {
    ctx.assert(module, 401, 'Something went wrong');
  }
  ctx.status = 201;

  ctx.body = { chapter };

});
router.put('/:id', async ctx => {
  const chapter_record = await Chapter.query().findById(ctx.params.id);

  if (!chapter_record) {
    ctx.throw(400, 'No chapter with that ID');
  }
  const chapter = await Chapter.query().patchAndFetchById(ctx.params.id, ctx.request.body);

  ctx.status = 201;
  ctx.body = { chapter };
});
router.delete('/:id', async ctx => {
  const chapter = await Chapter.query().findById(ctx.params.id);

  if (!chapter) {
    ctx.assert(chapter, 401, 'No ID was found');
  }
  await Chapter.query().delete().where({ id: ctx.params.id });

  ctx.status = 200;
  ctx.body = { chapter };
});

module.exports = router.routes();
