const path = require('path');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const bouncer = require('koa-bouncer');
const restc = require('restc');
const compose = require('koa-compose');
const koaStatic = require('koa-static');
// const mongo = require('koa-mongo');
const jwt = require('koa-jwt');
const config = require('../config');

module.exports = () => compose([
  logger(),
  koaStatic(path.resolve(process.cwd(), './public')),
  cors({ credentials: true }),
  restc.koa2({ includes: [/^\/api/] }),
  jwt({
    secret: config.jwt.secret,
    getToken(ctx) {
      return ctx.header.token || '';
    },
    isRevoked(ctx, decodeToken) {
      ctx.user = decodeToken ? decodeToken.data : {};
    },
  }).unless({ path: [/^(?!\/api)/, /^\/api\/user\/(register|login|forgetPassword)/] }),
  bodyParser(),
  bouncer.middleware(),
]);
