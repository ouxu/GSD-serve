const bouncer = require('koa-bouncer');

module.exports = async (ctx, next) => {
  const token = new bouncer.Validator({
    ctx,
    key: 'token',
    val: ctx.header.token,
    values: ctx.values,
  });
  token.required('请登录');
  await next();
};
