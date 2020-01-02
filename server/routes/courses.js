const Router = require('koa-router');
const Course = require('../models/course');
const { validateCourses } = require('../middleware/validation/validatePostData');

const environment = process.env.NODE_ENV || 'development';
const config = require('../knexfile.js')[environment];
const knex = require('knex')(config);

const router = new Router({
  prefix: '/courses'
});

async function returnType(parent) {
  if (parent.length == undefined) {
    parent.modules.forEach(lesson => {
      return lesson.type = 'modules';
    });
  } else {
    parent.forEach(mod => {
      mod.modules.forEach(lesson => {
        return lesson.type = 'modules';
      });
    });
  }
}

async function insertType(model, collection, course_id) {
  for (let index = 0; index < collection.length; index++) {
    const element = collection[index];
    let data = {
      'module_id': element,
      'course_id': course_id
    };
    knex(model).insert(data);
  }
}

router.get('/:id', async ctx => {
  const course = await Course.query().findById(ctx.params.id).eager('modules(selectNameAndId)');
  if (!course) {
    ctx.assert(course, 404, 'no lesson by that ID');
  }
  returnType(course);

  ctx.status = 200;
  ctx.body = { course };
});

router.get('/', async ctx => {
  try {
    const course = await Course.query().where(ctx.query).eager('modules(selectNameAndId)');
    returnType(course);

    ctx.status = 200;
    ctx.body = { course };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'The query key does not exist' };
  }
});

router.post('/', validateCourses, async ctx => {
  let { modules, ...newCourse } = ctx.request.body.course;

  let course;
  try {
    course = await Course.query().insertAndFetch(newCourse);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }
  ctx.assert(course, 401, 'Something went wrong');

  insertType('course_modules', modules, course.id);

  ctx.assert(course, 401, 'Something went wrong');
  ctx.status = 201;
  ctx.body = { course };
});

router.put('/:id', async ctx => {
  let { modules, ...newCourse } = ctx.request.body.course;

  let course;
  try {
    course = await Course.query().patchAndFetchById(ctx.params.id, newCourse);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: ['Bad Request'] }); }
    throw e;
  }
  if (!course) {
    ctx.throw(400, 'That course does not exist');
  }

  await knex('course_modules').where({ 'course_id': course.id }).del();
  await insertType('course_modules', modules, course.id);

  ctx.status = 201;
  ctx.body = { course };
});
router.delete('/:id', async ctx => {
  const course = await Course.query().findById(ctx.params.id);
  await Course.query().delete().where({ id: ctx.params.id });

  ctx.assert(course, 401, 'No ID was found');
  ctx.status = 200;
  ctx.body = { course };
});

module.exports = router.routes();
