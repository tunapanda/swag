const Router = require('koa-router');
const Lesson = require('../models/lesson');
const validateNewLearningPath = require('../middleware/validateLearningPath');


const router = new Router({
    prefix: '/lesson'
});

router.get('/', async ctx => {
    const lesson = await Lesson.query();
    ctx.status = 200;
    ctx.body = { lesson };
});
router.post('/', async ctx => {
    let newLesson = ctx.request.body;

    const lesson = await Lesson.query().insertAndFetch(newLesson);

    ctx.assert(lesson, 401, 'Something went wrong');

    ctx.status = 201;

    ctx.body = { lesson };

});
router.put('/:id', async ctx => {
    const lesson = await Lesson.query().patchAndFetchById(ctx.params.id, ctx.request.body);

    if (!lesson) {
        ctx.throw(400, 'That learning path does not exist');
    }

    ctx.status = 201;
    ctx.body = { lesson };
});
router.delete('/:id', async ctx => {
    const lesson = await Lesson.query().findById(ctx.params.id);
    await Lesson.query().delete().where({ id: ctx.params.id });
    ctx.status = 200;
    ctx.assert(lesson, 401, 'No ID was provided');
    ctx.body = { lesson };
});

module.exports = router.routes();
