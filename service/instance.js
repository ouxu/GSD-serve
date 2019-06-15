const uuid = require('uuid');
const model = require('../model/structure');

class InstanceService {
  static async create(ctx, user, vals) {
    const { id, username } = user;
    const { data } = vals;
    const item = uuid();
    await ctx.oss.pPutObject({
      Bucket: 'gsd-open-1252586963',
      Region: 'ap-beijing',
      ContentType: 'application/json; charset=utf-8',
      Key: item,
      Body: data,
    });
    const row = {
      ...vals,
      item,
      version: '0.0.1',
      versionComment: '初始化',
      versionAuthor: username,
      authorId: id,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
    delete row.data;
    const result = await ctx.db.insert('instances', row);
    const { insertId } = result;
    return insertId;
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

  static async queryAllByPid(ctx, params) {
    const { page, size, projectId } = params;
    const offset = (page - 1) * size;
    const rows = await ctx.db.select('instances', {
      where: { projectId },
      limit: size,
      orders: [['updatedAt', 'desc']],
      offset,
    });
    const count = await ctx.db.count('instances', { projectId });

    return {
      list: rows,
      count,
      page,
      size,
    };
  }

  static async update(ctx, userId, vals) {
    const { data } = vals;
    await ctx.oss.pPutObject({
      Bucket: 'gsd-open-1252586963',
      Region: 'ap-beijing',
      ContentType: 'application/json; charset=utf-8',
      Key: item,
      Body: data,
    });
    const row = {
      ...vals,
      item,
      authorId: userId,
      createdAt: ctx.db.literals.now,
      updatedAt: ctx.db.literals.now,
    };
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

  static async updateItem(ctx, user, vals) {
    const { username } = user;
    const {
      id, item = '', data, version, versionComment,
    } = vals;
    await ctx.oss.pPutObject({
      Bucket: 'gsd-open-1252586963',
      Region: 'ap-beijing',
      ContentType: 'application/json; charset=utf-8',
      Key: item,
      Body: data,
    });

    const row = {
      id,
      version,
      versionComment,
      versionAuthor: username,
      updatedAt: ctx.db.literals.now,
    };

    await ctx.db.update('instances', row);

    return true;
  }
}

module.exports = InstanceService;
