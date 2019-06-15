const COS = require('cos-nodejs-sdk-v5');
const { promisify } = require('util');
const config = require('../config');

module.exports = () => async (ctx, next) => {
  const oss = new COS(config.cos);
  oss.pPutObject = promisify(oss.putObject);
  oss.pDeleteObject = promisify(oss.deleteObject);
  ctx.oss = oss;
  await next();
};
