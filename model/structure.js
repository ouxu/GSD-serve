const squel = require('squel').useFlavour('mysql');

class StructureModel {
  static getStructure() {
    const sql = squel.select();
    sql.from('structures')
      .field('structures.*').field('users.username', 'owner')
      .join('user_structure', null, 'structures.id=user_structure.structureId')
      .join('users', null, 'structures.ownerId=users.id')
      .where('structures.id=:structureId AND user_structure.userId=:userId AND structures.status is null');

    return sql.toString();
  }

  static getStructures(query) {
    const {
      limit, offset, id, keyword, ownerId,
    } = query;
    const sql = squel.select();

    const where = squel.expr();

    where.and('structures.status is null');

    if (keyword) {
      where.and('structures.name LIKE ?', `%${keyword}%`);
    }
    if (ownerId) {
      where.and('structures.ownerId = ?', ownerId);
    }
    if (id) {
      where.and('user_structure.userId = ?', id);
    }

    sql.from('structures')
      .fields({
        'structures.id': 'id',
        'structures.name': 'name',
        'structures.description': 'description',
        'structures.ownerId': 'ownerId',
        'structures.tags': 'tags',
        'structures.open': 'open',
        'structures.createdAt': 'createdAt',
        'structures.updatedAt': 'updatedAt',
      })
      .field('users.username', 'owner')
      .join('users', null, 'structures.ownerId=users.id')
      .where(where.toString())
      .limit(limit)
      .offset(offset);

    if (id) {
      sql.join('user_structure', null, 'structures.id=user_structure.structureId');
    }
    return sql.toString();
  }

  static getStructureCount(query) {
    const { id, keyword } = query;

    const sql = squel.select();
    const where = squel.expr().and('user_project.userId=?', id);

    if (keyword) {
      where.and('projects.name LIKE ?', `%${keyword}%`);
    }

    if (id) {
      where.and('projects.name LIKE ?', `%${keyword}%`);
    }

    sql.from('projects')
      .field('COUNT(*)', 'count')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .where(where.toString());

    return sql.toString();
  }

  static replaceUsers(query) {
    const { userId, structureId } = query;

    const sql = squel.replace();

    sql.into('user_structure')
      .setFields({
        userId,
        structureId,
      });

    return sql.toString();
  }
}

module.exports = StructureModel;
