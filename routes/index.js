const compose = require('koa-compose');

const routes = require('require-all')({
  dirname: `${__dirname}/`,
  filter: /^((?!index).)/,
});

module.exports = () => compose(Object.values(routes).map(e => e.prefix('/api').routes()));
