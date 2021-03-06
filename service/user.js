
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const squel = require('squel').useFlavour('mysql');
const { jwt } = require('../config/index.js');
const mail = require('../utils/mail.js');

class UserService {
  static async login(ctx, params) {
    const { identifier, password } = params;

    const rows = await ctx.db.query('SELECT * FROM users WHERE mobile=:identifier OR email=:identifier', { identifier });
    const result = rows && rows[0];
    if (!result) {
      ctx.throw('用户不存在');
    }
    const isMatch = await bcrypt.compare(password, result.password);

    if (!isMatch) {
      ctx.throw('密码错误');
    }

    const { username, id, role = 'user' } = result;

    const token = jsonwebtoken.sign({
      data: { username, id, role },
      // 60 seconds * 60 minutes = 1 hour, 共一个月
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
    }, jwt.secret);

    delete result.password;
    result.token = token;

    return result;
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
    const result = await ctx.db.get('users', { id }, {
      columns: ['id', 'username', 'mobile', 'email', 'avatar', 'signature', 'gender', 'birthday', 'createdAt'],
    });

    return result;
  }

  static async queryUsers(ctx, keyword) {
    const sql = squel.select();
    sql.from('users')
      .fields(['id', 'username', 'avatar'])
      .where('username LIKE ?', `%${keyword}%`)
      .limit(50);

    const result = await ctx.db.query(sql.toString());

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
      ctx.throw('密码错误');
    }

    const newPassword = await bcrypt.hash(vals.newPassword, 5);
    const result = this.update(ctx, id, { password: newPassword });
    return result;
  }

  static async forgetPassword(ctx, vals) {
    const { email } = vals;
    const user = await ctx.db.get('users', { email });
    const { username, id } = user;

    const token = jsonwebtoken.sign({
      data: { username, id },
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
