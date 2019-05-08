const path = require('path');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const bouncer = require('koa-bouncer');
const restc = require('restc');
const koaStatic = require('koa-static');
// const mongo = require('koa-mongo');
const jwt = require('koa-jwt');
const config = require('../config');

module.exports = (app) => {
  app.use(logger());
  app.use(cors({ credentials: true }));

  // jwt setting
  app.use(jwt({
    secret: config.jwt.secret,
    getToken(ctx) {
      return ctx.header.token || '';
    },
    isRevoked(ctx, decodeToken) {
      ctx.user = decodeToken ? decodeToken.data : {};
    },
  }).unless({ path: [/^\/images/, /^\/user\/register/, /^\/user\/login/, /^\/user\/forgetPassword/] }));

  app.use(bodyParser());
  app.use(bouncer.middleware());
  app.use(restc.koa2());
  app.use(koaStatic(path.resolve(process.cwd(), './public')));
};
