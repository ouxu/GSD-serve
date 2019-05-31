const service = require('../service/project.js');

class ProjectController {
  static async createProject(ctx) {
    ctx.validateBody('name').required().isString();
    ctx.validateBody('description').required().isString();
    const { id = '' } = ctx.user;
    const insertId = await service.createProject(ctx, id, ctx.vals);
    if (!insertId) {
      ctx.throw('项目创建失败');
    }

    ctx.body = insertId;
  }

  static async getProject(ctx) {
    ctx.validateParam('id').required().isString();
    const projectId = ctx.vals.id;
    const { id = '' } = ctx.user;
    const project = await service.getProject(ctx, id, projectId);
    if (!project) {
      ctx.throw('项目不存在');
    }
    ctx.body = project;
  }

  static async getProjects(ctx) {
    ctx.validateBody('page').optional().toInt().defaultTo(1);
    ctx.validateBody('size').optional().toInt().defaultTo(2);
    const { id = '' } = ctx.user;
    const projects = await service.getProjects(ctx, id, ctx.vals);
    ctx.body = projects;
  }
}

module.exports = ProjectController;
