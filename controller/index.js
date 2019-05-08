class IndexController {
  static async index(ctx) {
    ctx.body = 'welcome to koa2 start';
  }
}

module.exports = IndexController;
