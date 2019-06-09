const service = require('../service/project.js');

const PAGE = 1;
const SIZE = 10;

class ProjectController {
  static async create(ctx) {
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    ctx.validateBody('users').optional().toArray().isArray();

    const { id = '' } = ctx.user;
    const insertId = await service.create(ctx, id, ctx.vals);
    if (!insertId) {
      ctx.throw('项目创建失败');
    }

    ctx.body = insertId;
  }

  static async get(ctx) {
    ctx.validateParam('id').required().isString();
    const projectId = ctx.vals.id;
    const { id = '' } = ctx.user;

    const hasPerm = await service.checkPermission(ctx, id, ctx.vals.id);
    if (!hasPerm) {
      ctx.throw('用户权限不足');
    }
    const project = await service.get(ctx, id, projectId);
    if (!project || !project.id) {
      ctx.throw('项目不存在');
    }
    ctx.body = project;
  }

  static async getProjects(ctx) {
    ctx.validateBody('page').defaultTo(PAGE).toInt();
    ctx.validateBody('size').defaultTo(SIZE).toInt();
    ctx.validateBody('keyword').defaultTo('').toString();

    const { id = '' } = ctx.user;
    const projects = await service.getProjects(ctx, id, ctx.vals);
    ctx.body = projects;
  }

  static async update(ctx) {
    ctx.validateBody('id').required().isString();
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    ctx.validateBody('users').optional().toArray().isArray();

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
}

module.exports = ProjectController;
