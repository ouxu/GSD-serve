const compose = require('koa-compose');
const spa = require('./spa.js');
const base = require('./base.js');
const errorHandler = require('./error_handler.js');
const successHandler = require('./success_handler.js');
const mysql = require('./mysql.js');

module.exports = () => compose([
  spa(),
  errorHandler(),
  successHandler(),
  mysql(),
  base(),
]);
