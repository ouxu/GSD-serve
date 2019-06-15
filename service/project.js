const model = require('../model/project');

class ProjectService {
  static async create(ctx, userId, vals) {
    const { name, description, users = [] } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));
    const row = {
      name,
      description,
      ownerId: userId,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      const res = await tran.insert('projects', row);
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

  static async checkOwner(ctx, ownerId, id) {
    const row = await ctx.db.get('projects', {
      id,
      ownerId,
    });
    return !!row;
  }

  static async get(ctx, userId, projectId) {
    const rows = await ctx.db.query(model.getProject(), { projectId, userId });
    const users = await this.getUsers(ctx, projectId);
    if (rows && rows[0]) {
      rows[0].users = users;
      return rows[0];
    }
    return {};
  }

  static async getUsers(ctx, projectId) {
    const rows = await ctx.db.query(model.getProjectUsers(), { projectId });
    return rows || [];
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

  static async update(ctx, userId, vals) {
    const {
      id, name, description, users = [],
    } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));

    const row = {
      id,
      name,
      description,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      await tran.update('projects', row);
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

  static async delete(ctx, id) {
    const row = {
      id,
      status: 'delete',
      updatedAt: ctx.db.literals.now,
    };
    await ctx.db.update('projects', row);
    return true;
  }

  static async migrateOwner(ctx, vals) {
    const { id, ownerId } = vals;
    const row = {
      id,
      ownerId,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();

    try {
      await ctx.db.update('projects', row);
      await ctx.db.query(model.replaceUsers({ projectId: id, userId: ownerId }));
      await tran.commit();
      return true;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }
}

module.exports = ProjectService;
