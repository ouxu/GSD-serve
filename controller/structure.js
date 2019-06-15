const service = require('../service/structure');

const PAGE = 1;
const SIZE = 10;

class StructureController {
  static async create(ctx) {
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    ctx.validateBody('users').optional().toArray().isArray();
    ctx.validateBody('open').defaultTo(true).toBoolean();
    ctx.validateBody('tags').optional().toArray().isArray()
      .tap(x => x.join(','));

    const { id = '' } = ctx.user;

    const insertId = await service.create(ctx, id, ctx.vals);
    if (!insertId) {
      ctx.throw('结构创建失败');
    }

    ctx.body = insertId;
  }

  static async get(ctx) {
    ctx.validateParam('id').required().isString();
    const structureId = ctx.vals.id;
    const { id = '' } = ctx.user;

    const hasPerm = await service.checkPermission(ctx, id, structureId);
    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const structure = await service.get(ctx, id, structureId);
    if (!structure || !structure.id) {
      ctx.throw('结构不存在');
    }
    ctx.body = structure;
  }

  static async getStructures(ctx) {
    ctx.validateQuery('page').defaultTo(PAGE).toInt();
    ctx.validateQuery('size').defaultTo(SIZE).toInt();
    ctx.validateQuery('keyword').defaultTo('').toString();

    const { id = '' } = ctx.user;
    const projects = await service.getStructures(ctx, id, ctx.vals);
    ctx.body = projects;
  }

  static async update(ctx) {
    ctx.validateBody('id').required().isString();
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    ctx.validateBody('users').optional().toArray().isArray();
    ctx.validateBody('open').defaultTo(true).toBoolean();
    ctx.validateBody('tags').optional().toArray().isArray()
      .tap(x => x.join(','));

    const { id = '' } = ctx.user;
    const hasPerm = await service.checkPermission(ctx, id, ctx.vals.id);

    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const result = await service.update(ctx, id, ctx.vals);

    ctx.body = result;
  }

  static async delete(ctx) {
    ctx.validateBody('id').required().isString();

    const { id = '' } = ctx.user;

    const hasPerm = await service.checkOwner(ctx, id, ctx.vals.id);
    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const result = await service.delete(ctx, ctx.vals.id);

    ctx.body = result;
  }

  static async migrateOwner(ctx) {
    ctx.validateBody('id').required().isString();
    ctx.validateBody('ownerId').required().isString();

    const { id = '' } = ctx.user;

    const hasPerm = await service.checkOwner(ctx, id, ctx.vals.id);
    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const result = await service.migrateOwner(ctx, ctx.vals);

    ctx.body = result;
  }

  static async updateItem(ctx) {
    ctx.validateBody('id').required().isString();
    ctx.validateBody('item').required().isJson();
    ctx.validateBody('version').required().isString();
    ctx.validateBody('versionComment').required().isString();

    const { id = '' } = ctx.user;
    const hasPerm = await service.checkPermission(ctx, id, ctx.vals.id);

    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const result = await service.updateItem(ctx, ctx.vals);

    ctx.body = result;
  }
}

module.exports = StructureController;
