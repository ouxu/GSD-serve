const send = require('koa-send');

module.exports = () => async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    await send(ctx, '/public/index.html');
  }
};
