const indexRouter = require('koa-router')();
const indexController = require('../controller/index');

const user = require('./user');

indexRouter.get('/', indexController.index);

module.exports = [
  indexRouter,
  user,
];
