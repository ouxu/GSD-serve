const Koa = require('koa');

const app = new Koa();

const baseConfig = require('./middleware/base');
const middleware = require('./middleware/index');
const routes = require('./routes');

app.use(middleware()); // 用户自己写的中间件

baseConfig(app);

routes.map(e => app.use(e.routes()));

app.listen(3003, (err) => {
  if (err) throw err;

  // eslint-disable-next-line no-console
  console.log('> Ready on http://localhost:3003');
});
