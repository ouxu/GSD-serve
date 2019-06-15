const uuid = require('uuid');
const service = require('../service/instance');

const PAGE = 1;
const SIZE = 20;

class InstanceController {
  static async create(ctx) {
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    ctx.validateBody('structureId').required().toInt();
    ctx.validateBody('projectId').required().toInt();
    ctx.validateBody('data').required().isJson().tap(e => JSON.stringify(JSON.parse(e)));

    // const { id = '', nickname = '' } = ctx.user;

    const insertId = await service.create(ctx, ctx.user, ctx.vals);
    if (!insertId) {
      ctx.throw('结构创建失败');
    }

    ctx.body = insertId;
  }

  static async get(ctx) {
    ctx.validateParam('id').required().isString();
    const structureId = ctx.vals.id;
    // const { id = '' } = ctx.user;
    const structure = await ctx.db.get('instances', { id: structureId });
    if (!structure || !structure.id) {
      ctx.throw('数据实例不存在');
    }
    ctx.body = structure;
  }

  static async queryAllByPid(ctx) {
    ctx.validateQuery('page').defaultTo(PAGE).toInt();
    ctx.validateQuery('size').defaultTo(SIZE).toInt();
    ctx.validateQuery('projectId').required('').toInt();

    const projects = await service.queryAllByPid(ctx, ctx.vals);
    ctx.body = projects;
  }

  static async update(ctx) {
    ctx.body = ctx.request.body;
  }

  static async delete(ctx) {
    ctx.body = ctx.request.body;
  }

  static async migrateOwner(ctx) {
    ctx.body = ctx.request.body;
  }

  static async updateItem(ctx) {
    ctx.validateBody('id').required().isInt();
    ctx.validateBody('item').required().isString();
    ctx.validateBody('version').required().isString();
    ctx.validateBody('versionComment').required().isString();
    ctx.validateBody('data').required().isJson().tap(e => JSON.stringify(JSON.parse(e)));

    const result = await service.updateItem(ctx, ctx.user, ctx.vals);

    ctx.body = result;
  }
}

module.exports = InstanceController;
