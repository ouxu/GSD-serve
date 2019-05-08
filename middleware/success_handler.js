module.exports = () => async (ctx, next) => {
  await next();
  if (ctx.type === 'application/json' && ctx.status === 200) {
    ctx.body = {
      success: true,
      data: ctx.body,
    };
  }
};
