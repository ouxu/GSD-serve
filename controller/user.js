const dayjs = require('dayjs');
const flush = require('just-flush');
const service = require('../service/user.js');
const regexp = require('../utils/regexp.js');

class UserController {
  static async login(ctx) {
    ctx.validateBody('identifier').required().isLength(6, 100, 'identifier must be 6-100 chars');
    ctx.validateBody('password').required().isString().match(regexp.password);
    const user = await service.login(ctx, ctx.vals);

    ctx.body = user;
  }

  static async register(ctx) {
    ctx.validateBody('username').required().isString();
    ctx.validateBody('email').optional().isString().isEmail();
    ctx.validateBody('mobile').optional().isString().match(regexp.mobile);
    ctx.validateBody('password').required().isString().match(regexp.password);
    ctx.validateBody('passwordConfirm').required().isString().match(regexp.password)
      .checkPred(val => val === ctx.vals.password);

    if (!ctx.vals.email && !ctx.vals.mobile) {
      ctx.throw('email || password is required');
    }

    delete ctx.vals.passwordConfirm;

    const id = await service.register(ctx, ctx.vals);

    ctx.body = {
      id,
    };
  }

  static async getUser(ctx) {
    ctx.validateParam('id').required().isString();

    const result = await service.getUser(ctx, ctx.vals.id);

    if (!result) {
      ctx.throw('用户不存在');
    }
    ctx.body = result;
  }

  static async queryUsers(ctx) {
    ctx.validateQuery('keyword').defaultTo('').toString();

    const result = await service.queryUsers(ctx, ctx.vals.keyword);

    if (!result) {
      ctx.body = [];
    } else {
      ctx.body = result;
    }
  }

  static async getMe(ctx) {
    const { id = '' } = ctx.user;
    const result = await service.getUser(ctx, id);
    if (!result) {
      ctx.throw('用户不存在');
    }
    ctx.body = result;
  }

  static async update(ctx) {
    ctx.validateBody('username').optional().isString();
    ctx.validateBody('email').optional().isString().isEmail();
    ctx.validateBody('mobile').optional().isString().match(regexp.mobile);
    ctx.validateBody('avatar').optional().isString();
    ctx.validateBody('signature').optional().isString();
    ctx.validateBody('gender').optional().isString().isIn(['男', '女'], 'Invalid gender');
    ctx.validateBody('birthday').optional().checkPred(val => dayjs(val).isValid())
      .tap(x => dayjs(x).format('YYYY-MM-DD HH:mm:ss'));

    const { id = '' } = ctx.user;
    const result = await service.update(ctx, id, flush(ctx.vals));

    ctx.body = result;
  }

  static async modifyPassword(ctx) {
    ctx.validateBody('password').required().isString().match(regexp.password);
    ctx.validateBody('newPassword').required().isString().match(regexp.password);
    ctx.validateBody('newPasswordConfirm').required().isString().match(regexp.password)
      .checkPred(val => val === ctx.vals.newPassword);

    const { id = '' } = ctx.user;

    const result = await service.modifyPassword(ctx, id, ctx.vals);

    ctx.body = result;
  }

  static async forgetPassword(ctx) {
    ctx.validateBody('email').required().isString().isEmail();

    const result = await service.forgetPassword(ctx, ctx.vals);

    ctx.body = result;
  }

  static async resetPassword(ctx) {
    ctx.validateBody('password').required().isString().match(regexp.password);
    ctx.validateBody('passwordConfirm').required().isString().match(regexp.password)
      .checkPred(val => val === ctx.vals.password);

    const { id = '' } = ctx.user;

    const result = await service.resetPassword(ctx, id, ctx.vals);

    ctx.body = result;
  }
}

module.exports = UserController;
