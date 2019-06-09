const model = require('../model/structure');

class StructureService {
  static async create(ctx, userId, vals) {
    const {
      name, description, users = [], tags = '', open,
    } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));
    const row = {
      name,
      description,
      tags,
      open,
      ownerId: userId,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      const res = await tran.insert('structures', row);
      const structureId = res.insertId;

      const usersRows = formatUsers.map(e => ({
        userId: e,
        structureId,
      }));
      await tran.insert('user_structure', usersRows);
      await tran.commit();
      return structureId;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }

  static async checkPermission(ctx, userId, structureId) {
    const row = await ctx.db.get('user_structure', {
      userId,
      structureId,
    });
    return !!row;
  }

  static async checkOwner(ctx, ownerId, id) {
    const row = await ctx.db.get('structures', {
      id,
      ownerId,
    });
    return !!row;
  }

  static async get(ctx, userId, structureId) {
    const rows = await ctx.db.query(model.getStructure(), { structureId, userId });

    if (rows && rows[0]) {
      return rows[0];
    }
    return {};
  }

  static async getStructures(ctx, id, params) {
    const { page, size, keyword } = params;
    const offset = (page - 1) * size;
    const list = await ctx.db.query(model.getStructures({
      id, keyword, limit: size, offset,
    }));

    // const totalRow = await ctx.db.query(model.getStructureCount({ keyword, id }));

    // const total = totalRow && totalRow[0] ? totalRow[0].count : 0;

    return {
      list, page, size,
    };
  }

  static async update(ctx, userId, vals) {
    const {
      id, name, description, users = [], tags = '', open,
    } = vals;
    const formatUsers = Array.from(new Set([...users, userId].map(e => +e)));
    const row = {
      id,
      name,
      description,
      tags,
      open,
      ownerId: userId,
      updatedAt: ctx.db.literals.now,
    };
    const tran = await ctx.db.beginTransaction();
    try {
      await tran.update('structures', row);
      await tran.delete('user_structure', {
        structureId: id,
      });
      const usersRows = formatUsers.map(e => ({
        userId: e,
        structureId: id,
      }));
      await tran.insert('user_structure', usersRows);
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
    await ctx.db.update('structures', row);
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
      await tran.update('structures', row);
      await tran.query(model.replaceUsers({ structureId: id, userId: ownerId }));
      await tran.commit();
      return true;
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  }
}

module.exports = StructureService;
