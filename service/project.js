const model = require('../model/project');

const PAGE = 1;
const SIZE = 2;

class ProjectService {
  static async createProject(ctx, userId, vals) {
    const rows = {
      ...vals,
      ownerId: userId,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();

    try {
      const res = await tran.insert('projects', rows);
      const projectId = res.insertId;
      await tran.insert('user_project', {
        userId,
        projectId,
      });
      await tran.commit();
      return projectId;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }

  static async getProject(ctx, userId, projectId) {
    const rows = await ctx.db.query(model.getProject(), { projectId, userId });

    if (rows && rows[0]) {
      return rows[0];
    }
    return ctx.throw('项目获取失败，用户权限不足或项目不存在');
  }

  static async getProjects(ctx, id, params) {
    const { page = 1, size = 2, keyword } = params;
    const offset = (page - 1) * size;
    const list = await ctx.db.query(model.getProjects({
      id, keyword, limit: size, offset,
    }));

    const totalRow = await ctx.db.query(model.getProjectCount({ keyword, id }));

    const total = totalRow && totalRow[0] ? totalRow[0].count : 0;

    return {
      list, page, size, total,
    };
  }
}

module.exports = ProjectService;
