const model = require('../model/project');

class ProjectService {
  static async createProject(ctx, userId, vals) {
    const { name, description, users = [] } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));
    const rows = {
      name,
      description,
      ownerId: userId,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      const res = await tran.insert('projects', rows);
      const projectId = res.insertId;

      const usersRows = formatUsers.map(e => ({
        userId: e,
        projectId,
      }));
      await tran.insert('user_project', usersRows);
      await tran.commit();
      return projectId;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }

  static async checkPermission(ctx, userId, projectId) {
    const row = await ctx.db.get('user_project', {
      userId,
      projectId,
    });
    return !!row;
  }

  static async getProject(ctx, userId, projectId) {
    const rows = await ctx.db.query(model.getProject(), { projectId, userId });

    if (rows && rows[0]) {
      return rows[0];
    }
    return {};
  }

  static async getProjects(ctx, id, params) {
    const { page, size, keyword } = params;
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

  static async updateProject(ctx, userId, vals) {
    const {
      id, name, description, users = [],
    } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));

    const rows = {
      id,
      name,
      description,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      await tran.update('projects', rows);
      await tran.delete('user_project', {
        projectId: id,
      });
      const usersRows = formatUsers.map(e => ({
        userId: e,
        projectId: id,
      }));
      await tran.insert('user_project', usersRows);
      await tran.commit();
      return true;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }
}

module.exports = ProjectService;
