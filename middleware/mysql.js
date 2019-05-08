const rds = require('ali-rds');
const config = require('../config');

module.exports = () => async (ctx, next) => {
  ctx.db = rds(config.mysql);
  await next();
};
