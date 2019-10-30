/**
 * enforce auth for protected views
 * @param {*} ctx 
 * @param {*} next 
 */
async function requireAuth(ctx, next) {
    ctx.assert(ctx.state.user, 401, 'stuuuuuuuUnauthorized');
    await next();
}


module.exports = {
    requireAuth
};