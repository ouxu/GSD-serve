const squel = require('squel').useFlavour('mysql');

class ProjectModel {
  static getProject() {
    const sql = squel.select();
    sql.from('projects')
      .field('projects.*').field('users.username', 'owner')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .join('users', null, 'projects.ownerId=users.id')
      .where('projects.id=:projectId AND user_project.userId=:userId AND projects.status is null');

    return sql.toString();
  }

  static getProjectUsers() {
    const sql = squel.select();
    sql.from('users')
      .field('users.id', 'id')
      .field('users.username', 'username')
      .field('users.avatar', 'avatar')
      .join('user_project', null, 'users.id=user_project.userId')
      .where('user_project.projectId=:projectId');

    return sql.toString();
  }

  static getProjects(query) {
    const {
      limit, offset, id, keyword,
    } = query;
    const sql = squel.select();

    const where = squel.expr();

    where.and('projects.status is null')
      .and('user_project.userId=?', id);

    if (keyword) {
      where.and('projects.name LIKE ?', `%${keyword}%`);
    }

    sql.from('projects')
      .field('projects.*').field('users.username', 'owner')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .join('users', null, 'projects.ownerId=users.id')
      .where(where.toString())
      .order('updatedAt', false)
      .limit(limit)
      .offset(offset);

    return sql.toString();
  }

  static getProjectCount(query) {
    const { id, keyword } = query;

    const sql = squel.select();
    const where = squel.expr().and('user_project.userId=?', id);

    if (keyword) {
      where.and('projects.name LIKE ?', `%${keyword}%`);
    }

    sql.from('projects')
      .field('COUNT(*)', 'count')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .where(where.toString());

    return sql.toString();
  }

  static replaceUsers(query) {
    const { userId, projectId } = query;

    const sql = squel.replace();

    sql.into('user_project')
      .setFields({
        userId,
        projectId,
      });

    return sql.toString();
  }
}

module.exports = ProjectModel;
