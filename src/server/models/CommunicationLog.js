const { query } = require('../../database/db');

class CommunicationLog {
  // Create communication log entry
  static create({ project_id, user_id, communication_type, subject, notes, occurred_at }) {
    const validTypes = ['email', 'call', 'meeting', 'chat', 'other'];
    
    if (!validTypes.includes(communication_type)) {
      throw new Error(`Invalid communication type. Must be one of: ${validTypes.join(', ')}`);
    }

    const result = query.run(
      `INSERT INTO communication_logs (project_id, user_id, communication_type, subject, notes, occurred_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        user_id,
        communication_type,
        subject || null,
        notes,
        occurred_at || Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    return query.get(
      `SELECT cl.*, u.email, u.full_name 
       FROM communication_logs cl
       LEFT JOIN users u ON cl.user_id = u.id
       WHERE cl.id = ?`,
      [id]
    );
  }

  // Find all for a project
  static findByProjectId(projectId, options = {}) {
    let sql = `
      SELECT cl.*, u.email, u.full_name 
      FROM communication_logs cl
      LEFT JOIN users u ON cl.user_id = u.id
      WHERE cl.project_id = ?
    `;
    const params = [projectId];

    // Filter by communication type
    if (options.type) {
      sql += ` AND cl.communication_type = ?`;
      params.push(options.type);
    }

    // Filter by date range
    if (options.start_date) {
      sql += ` AND cl.occurred_at >= ?`;
      params.push(options.start_date);
    }
    if (options.end_date) {
      sql += ` AND cl.occurred_at <= ?`;
      params.push(options.end_date);
    }

    sql += ` ORDER BY cl.occurred_at DESC`;

    // Limit results
    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    return query.all(sql, params);
  }

  // Update communication log
  static update(id, { communication_type, subject, notes, occurred_at }) {
    const updates = [];
    const values = [];

    if (communication_type !== undefined) {
      const validTypes = ['email', 'call', 'meeting', 'chat', 'other'];
      if (!validTypes.includes(communication_type)) {
        throw new Error(`Invalid communication type. Must be one of: ${validTypes.join(', ')}`);
      }
      updates.push('communication_type = ?');
      values.push(communication_type);
    }
    if (subject !== undefined) {
      updates.push('subject = ?');
      values.push(subject);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (occurred_at !== undefined) {
      updates.push('occurred_at = ?');
      values.push(occurred_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    query.run(
      `UPDATE communication_logs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete communication log
  static delete(id) {
    return query.run(`DELETE FROM communication_logs WHERE id = ?`, [id]);
  }

  // Get statistics for a project
  static getProjectStats(projectId) {
    const stats = query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN communication_type = 'email' THEN 1 ELSE 0 END) as emails,
        SUM(CASE WHEN communication_type = 'call' THEN 1 ELSE 0 END) as calls,
        SUM(CASE WHEN communication_type = 'meeting' THEN 1 ELSE 0 END) as meetings,
        SUM(CASE WHEN communication_type = 'chat' THEN 1 ELSE 0 END) as chats,
        SUM(CASE WHEN communication_type = 'other' THEN 1 ELSE 0 END) as other
       FROM communication_logs
       WHERE project_id = ?`,
      [projectId]
    );

    return stats;
  }

  // Get recent communications across all projects for a user
  static getRecentForUser(userId, limit = 10) {
    return query.all(
      `SELECT cl.*, p.project_name, p.client_name
       FROM communication_logs cl
       JOIN projects p ON cl.project_id = p.id
       WHERE p.user_id = ?
       ORDER BY cl.occurred_at DESC
       LIMIT ?`,
      [userId, limit]
    );
  }
}

module.exports = CommunicationLog;
