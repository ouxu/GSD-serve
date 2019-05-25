const Koa = require('koa');

const app = new Koa();
const middleware = require('./middleware');
const routes = require('./routes');

app.use(middleware()); // 用户自己写的中间件
app.use(routes()); // 路由

app.listen(3003, (err) => {
  if (err) throw err;

  // eslint-disable-next-line no-console
  console.log('> Ready on http://localhost:3003');
});
