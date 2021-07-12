const Koa = require('koa');
const path = require('path');
const koaQs = require('koa-qs');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('./middleware/error');
const logger = require('./middleware/logger');
const jwt = require('./middleware/jwt');
const cors = require('@koa/cors');
const app = new Koa();
const log = require('./utils/logger');

const router = new Router({
  prefix: '/api/v1'
});

koaQs(app);

app.use(cors({
  origin: '*',
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'mojaHeader', 'achievements'],
}));

app.use(errorHandler);

app.use(logger);

app.use(bodyParser());

app.use(require('koa-static')(path.resolve(__dirname, './public')));

router.use(require('./routes/auth'));

router.use(require('./routes/users'));

router.use(require('./routes/oauth2s'));

router.use(jwt.authenticate, require('./routes/user_badges'));

router.use(jwt.authenticate, require('./routes/chapters'));

router.use(jwt.authenticate, require('./routes/comments'));

router.use(jwt.authenticate, require('./routes/counter'));

router.use(jwt.authenticate, require('./routes/oembed'));

router.use(jwt.authenticate, require('./routes/activity'));

router.use(jwt.authenticate, require('./routes/enrollments'));

router.use(jwt.authenticate, require('./routes/achievements'));

router.use(jwt.authenticate, require('./routes/flags'));

router.use(jwt.authenticate, require('./routes/badges'));

router.use(jwt.authenticate, require('./routes/triggers'));

router.use(jwt.authenticate, require('./routes/ratings'));

router.use(jwt.authenticate, require('./routes/reactions'));

router.use(jwt.authenticate, require('./routes/dashboard'));

router.use(jwt.authenticate, require('./routes/user_role'));

router.use(jwt.authenticate, require('./routes/achievement_awards'));

router.use(jwt.authenticate, require('./routes/h5p'));

router.use(jwt.authenticate, require('./routes/reviews'));

router.use(jwt.authenticate, require('./routes/review-questions'));

router.use(jwt.authenticate, require('./routes/notifications'));

router.use(jwt.authenticate, require('./routes/groups'));

router.use(require('./routes/chapter-tags'));

router.use(require('./routes/search'));


router.get('/hello', async ctx => {
  log.info('Got a request from %s for %s', ctx.request.ip, ctx.path);
  ctx.body = { user: 'You have access to view this route' };
});

app.use(router.routes());

module.exports = app;
