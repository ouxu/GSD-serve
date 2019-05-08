
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwt } = require('../config/index.js');
const mail = require('../utils/mail.js');

class UserService {
  static async login(ctx, params) {
    const { identifier, password } = params;

    const rows = await ctx.db.query('SELECT * FROM users WHERE mobile=:identifier OR email=:identifier', { identifier });
    const result = rows && rows[0];
    const isMatch = await bcrypt.compare(password, result.password);

    if (!isMatch) {
      throw new Error('密码错误');
    }

    const { nickname, id } = result;

    const token = jsonwebtoken.sign({
      data: { nickname, id },
      // 60 seconds * 60 minutes = 1 hour, 共一个月
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
    }, jwt.secret);

    return token;
  }

  static async register(ctx, vals) {
    const password = await bcrypt.hash(vals.password, 5);
    const row = {
      ...vals,
      password,
      createdAt: ctx.db.literals.now,
    };

    const result = await ctx.db.insert('users', row);
    const { insertId } = result;

    return insertId;
  }

  static async getUser(ctx, id) {
    const result = await ctx.db.get('users', { id });

    return result;
  }

  static async update(ctx, id, vals) {
    await ctx.db.update('users', { id, ...vals, updatedAt: ctx.db.literals.now });
    return true;
  }

  static async modifyPassword(ctx, id, vals) {
    const { password } = vals;
    const user = await ctx.db.get('users', { id });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('密码错误');
    }

    const newPassword = await bcrypt.hash(vals.newPassword, 5);
    const result = this.update(ctx, id, { password: newPassword });
    return result;
  }

  static async forgetPassword(ctx, vals) {
    const { email } = vals;
    const user = await ctx.db.get('users', { email });
    const { nickname, id } = user;

    const token = jsonwebtoken.sign({
      data: { nickname, id },
      // 60 seconds * 60 minutes = 1 hour, 共一个月
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),
    }, jwt.secret);

    await mail({
      email,
      subject: '找回密码',
      content: token,
    });

    return true;
  }

  static async resetPassword(ctx, id, vals) {
    const newPassword = await bcrypt.hash(vals.password, 5);
    const result = this.update(ctx, id, { password: newPassword });
    return result;
  }
}

module.exports = UserService;
