
const Joi = require('joi');

const schemaGet = Joi.object({
  status: Joi.string(),
  approved: Joi.boolean(),
  id: Joi.string(),
  slug: Joi.string(),
  creatorId: Joi.string(),
  q: Joi.string(),
  name: Joi.string(),
  tags: Joi.string(),
  page: Joi.number(),
  per_page: Joi.number()
});

module.exports =  async (ctx, next) => {
  try {
    await schemaGet.validateAsync(ctx.query);
  } catch (e) {
    if (e.statusCode) {
      ctx.throw(e.statusCode, null, { errors: [e.message] });
    } else { ctx.throw(400, null, { errors: [e.message] }); }
    throw e;
  }
  await next();
};

