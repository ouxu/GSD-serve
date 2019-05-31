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
    const sql = `
      SELECT projects.*, users.username
      FROM projects
      JOIN user_project ON projects.id=user_project.projectId
      JOIN users ON projects.ownerId=users.id
      WHERE projects.id=:projectId AND users.id=:userId;
    `;
    const rows = await ctx.db.query(sql, { projectId, userId });

    if (rows && rows[0]) {
      return rows[0];
    }
    return ctx.throw('项目获取失败，用户权限不足或项目不存在');
  }

  static async getProjects(ctx, id, params) {
    const { page = 1, size = 2 } = params;
    const sql = `
      SELECT projects.*, users.username
      FROM projects
      JOIN users ON projects.ownerId=users.id
      WHERE users.id=:id
      LIMIT :offset,:limit;
    `;
    const list = await ctx.db.query(sql, {
      id,
      ...params,
      limit: size,
      offset: (page - 1) * size,
    });

    delete params.page;
    delete params.size;

    const total = await ctx.db.count('projects', {
      id,
      ...params,
    });

    return {
      list, page, size, total,
    };
  }
}

module.exports = ProjectService;
