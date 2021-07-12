const Router = require('koa-router');
const User = require('../models/user');
const { requireAuth, grantAccess} = require('../middleware/permController');

const router = new Router({
  prefix: '/user_badges'
});
router.get('/', requireAuth, grantAccess('readAny', 'private'), async ctx => {

  let leaders = await User.query()
    .where(ctx.query)
    .withGraphFetched(
      '[leaderboard()]'
    );

  ctx.assert(leaders, 401, 'Something went wrong');

  ctx.status = 200;
  ctx.body = { leaders };
});

router.get('/:id', async ctx => {
  const leader = await User.query()
    .findById(ctx.params.id)
    .where(ctx.query)
    .withGraphFetched(
      '[leaderboard()]'
    );

  ctx.assert(leader, 401, 'Something went wrong');

  ctx.status = 200;
  ctx.body = { leader };
});




module.exports = router.routes();
