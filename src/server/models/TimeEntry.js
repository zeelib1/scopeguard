const { query } = require('../../database/db');

class TimeEntry {
  // Start timer for a request
  static start({ request_id, user_id, description }) {
    const now = Math.floor(Date.now() / 1000);
    
    // Check if there's already an active timer for this user
    const activeTimer = this.getActiveTimer(user_id);
    if (activeTimer) {
      throw new Error('You already have an active timer running');
    }

    const result = query.run(
      `INSERT INTO time_entries (request_id, user_id, description, started_at)
       VALUES (?, ?, ?, ?)`,
      [request_id, user_id, description || null, now]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Stop timer
  static stop(id, user_id) {
    const entry = this.findById(id);
    
    if (!entry) {
      throw new Error('Time entry not found');
    }

    if (entry.user_id !== user_id) {
      throw new Error('Access denied');
    }

    if (entry.ended_at) {
      throw new Error('Timer already stopped');
    }

    const now = Math.floor(Date.now() / 1000);
    const duration = now - entry.started_at;

    query.run(
      `UPDATE time_entries SET ended_at = ?, duration_seconds = ? WHERE id = ?`,
      [now, duration, id]
    );

    return this.findById(id);
  }

  // Get active timer for a user
  static getActiveTimer(userId) {
    return query.get(
      `SELECT * FROM time_entries WHERE user_id = ? AND ended_at IS NULL`,
      [userId]
    );
  }

  // Find by ID
  static findById(id) {
    return query.get(`SELECT * FROM time_entries WHERE id = ?`, [id]);
  }

  // Find all for a request
  static findByRequestId(requestId) {
    return query.all(
      `SELECT te.*, u.email, u.full_name 
       FROM time_entries te
       LEFT JOIN users u ON te.user_id = u.id
       WHERE te.request_id = ? 
       ORDER BY te.started_at DESC`,
      [requestId]
    );
  }

  // Get total time for a request
  static getTotalTime(requestId) {
    const result = query.get(
      `SELECT SUM(duration_seconds) as total_seconds
       FROM time_entries 
       WHERE request_id = ? AND ended_at IS NOT NULL`,
      [requestId]
    );
    return result.total_seconds || 0;
  }

  // Get total time for a project
  static getProjectTotalTime(projectId) {
    const result = query.get(
      `SELECT SUM(te.duration_seconds) as total_seconds
       FROM time_entries te
       JOIN requests r ON te.request_id = r.id
       WHERE r.project_id = ? AND te.ended_at IS NOT NULL`,
      [projectId]
    );
    return result.total_seconds || 0;
  }

  // Update time entry
  static update(id, { description, started_at, ended_at }) {
    const updates = [];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (started_at !== undefined) {
      updates.push('started_at = ?');
      values.push(started_at);
    }
    if (ended_at !== undefined) {
      updates.push('ended_at = ?');
      values.push(ended_at);
      
      const entry = this.findById(id);
      if (entry) {
        const duration = ended_at - (started_at || entry.started_at);
        updates.push('duration_seconds = ?');
        values.push(duration);
      }
    }

    values.push(id);

    query.run(
      `UPDATE time_entries SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete time entry
  static delete(id) {
    return query.run(`DELETE FROM time_entries WHERE id = ?`, [id]);
  }
}

module.exports = TimeEntry;
