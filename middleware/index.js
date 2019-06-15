const compose = require('koa-compose');
const spa = require('./spa.js');
const base = require('./base.js');
const format = require('./format.js');
const mysql = require('./mysql.js');
const oss = require('./oss.js');

module.exports = () => compose([
  spa(),
  format(),
  mysql(),
  oss(),
  base(),
]);
