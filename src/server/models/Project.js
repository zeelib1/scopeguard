const { query } = require('../../database/db');

class Project {
  // Create new project
  static create({ user_id, client_name, project_name, description }) {
    const result = query.run(
      `INSERT INTO projects (user_id, client_name, project_name, description, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [user_id, client_name, project_name, description || null]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find project by ID
  static findById(id) {
    return query.get(`SELECT * FROM projects WHERE id = ?`, [id]);
  }

  // Find all projects for a user
  static findByUserId(userId, status = null) {
    if (status) {
      return query.all(
        `SELECT * FROM projects WHERE user_id = ? AND status = ? ORDER BY updated_at DESC`,
        [userId, status]
      );
    }
    return query.all(
      `SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );
  }

  // Update project
  static update(id, { client_name, project_name, description, status }) {
    const updates = [];
    const values = [];

    if (client_name !== undefined) {
      updates.push('client_name = ?');
      values.push(client_name);
    }
    if (project_name !== undefined) {
      updates.push('project_name = ?');
      values.push(project_name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));

    values.push(id);

    query.run(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete project
  static delete(id) {
    return query.run(`DELETE FROM projects WHERE id = ?`, [id]);
  }

  // Get project overview with stats
  static getOverview(projectId) {
    return query.get(`SELECT * FROM v_project_overview WHERE id = ?`, [projectId]);
  }

  // Verify project belongs to user
  static belongsToUser(projectId, userId) {
    const project = query.get(
      `SELECT id FROM projects WHERE id = ? AND user_id = ?`,
      [projectId, userId]
    );
    return !!project;
  }
}

module.exports = Project;
