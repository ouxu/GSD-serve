const dayjs = require('dayjs');
const flush = require('just-flush');
const service = require('../service/user.js');
const regexp = require('../utils/regexp.js');

class ProjectController {
  static async getProject(ctx) {
    ctx.validateParam('id').required().isString();

    const result = await service.getUser(ctx, ctx.vals);
    if (!result) {
      ctx.throw('用户不存在');
    }

    ctx.body = result;
  }

  static async getProjects(ctx) {
    ctx.validateParam('id').required().isString();

    const result = await service.getUser(ctx, ctx.vals);

    ctx.body = result;
  }

  static async update(ctx) {
    ctx.validateBody('username').optional().isString();
    ctx.validateBody('email').optional().isString().isEmail();
    ctx.validateBody('mobile').optional().isString().match(regexp.mobile);
    ctx.validateBody('avatar').optional().isString();
    ctx.validateBody('signature').optional().isString();
    ctx.validateBody('gender').optional().isString().isIn(['男', '女'], 'Invalid gender');
    ctx.validateBody('birthday').optional().isInt().checkPred(val => dayjs(val).isValid())
      .tap(x => dayjs(x).format('YYYY-MM-DD HH:mm:ss'));

    const { id = '' } = ctx.user;
    const result = await service.update(ctx, id, flush(ctx.vals));

    ctx.body = result;
  }
}

module.exports = ProjectController;
