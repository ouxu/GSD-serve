const squel = require('squel');

class ProjectModel {
  static getProject() {
    const sql = squel.select();
    sql.from('projects')
      .field('projects.*').field('users.username', 'owner')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .join('users', null, 'projects.ownerId=users.id')
      .where('projects.id=:projectId AND users.id=:userId');

    return sql.toString();
  }

  static getProjects(query) {
    const {
      limit, offset, id, keyword,
    } = query;
    const sql = squel.select();
    let where = `user_project.userId=${id} `;
    if (keyword) {
      where += `AND projects.name LIKE '%${keyword}%'`;
    }

    sql.from('projects')
      .field('projects.*').field('users.username', 'owner')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .join('users', null, 'projects.ownerId=users.id')
      .where(where)
      .limit(limit)
      .offset(offset);

    return sql.toString();
  }

  static getProjectCount(query) {
    const {
      id, keyword,
    } = query;
    const sql = squel.select();
    let where = `user_project.userId=${id} `;
    if (keyword) {
      where += `AND projects.name LIKE '%${keyword}%'`;
    }
    sql.from('projects')
      .field('COUNT(*)', 'count')
      .join('user_project', null, 'projects.id=user_project.projectId')
      .where(where);

    return sql.toString();
  }
}

module.exports = ProjectModel;
