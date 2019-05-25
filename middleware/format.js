module.exports = () => async (ctx, next) => {
  try {
    await next();
    // 自定义成功时返回格式
    if (ctx.type === 'application/json' && ctx.status === 200) {
      ctx.body = {
        success: true,
        data: ctx.body,
      };
    }
  } catch (err) {
    // 自定义错误时异常返回的格式
    ctx.body = {
      success: false,
      message: err.message,
    };
  }
};
