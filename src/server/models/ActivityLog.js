const { query } = require('../../database/db');

class ActivityLog {
  // Log an activity
  static log({ user_id, entity_type, entity_id, action, changes, ip_address, user_agent }) {
    const changesJson = changes ? JSON.stringify(changes) : null;
    
    const result = query.run(
      `INSERT INTO activity_log (user_id, entity_type, entity_id, action, changes, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null,
        entity_type,
        entity_id,
        action,
        changesJson,
        ip_address || null,
        user_agent || null,
        Math.floor(Date.now() / 1000)
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    const log = query.get(
      `SELECT al.*, u.email, u.full_name 
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.id = ?`,
      [id]
    );
    
    if (log && log.changes) {
      try {
        log.changes = JSON.parse(log.changes);
      } catch (e) {
        // Leave as string if not valid JSON
      }
    }
    
    return log;
  }

  // Get logs for a specific entity
  static findByEntity(entityType, entityId, limit = 50) {
    const logs = query.all(
      `SELECT al.*, u.email, u.full_name 
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = ? AND al.entity_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [entityType, entityId, limit]
    );
    
    return logs.map(log => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          // Leave as string if not valid JSON
        }
      }
      return log;
    });
  }

  // Get logs for a user
  static findByUser(userId, limit = 100) {
    const logs = query.all(
      `SELECT al.*, u.email, u.full_name 
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.user_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    
    return logs.map(log => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          // Leave as string if not valid JSON
        }
      }
      return log;
    });
  }

  // Get recent activity across all entities
  static getRecent(limit = 100, filters = {}) {
    let sql = `
      SELECT al.*, u.email, u.full_name 
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.entity_type) {
      sql += ` AND al.entity_type = ?`;
      params.push(filters.entity_type);
    }

    if (filters.action) {
      sql += ` AND al.action = ?`;
      params.push(filters.action);
    }

    if (filters.user_id) {
      sql += ` AND al.user_id = ?`;
      params.push(filters.user_id);
    }

    if (filters.since) {
      sql += ` AND al.created_at >= ?`;
      params.push(filters.since);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT ?`;
    params.push(limit);

    const logs = query.all(sql, params);
    
    return logs.map(log => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          // Leave as string if not valid JSON
        }
      }
      return log;
    });
  }

  // Delete old logs (cleanup)
  static deleteOlderThan(timestampSeconds) {
    return query.run(
      `DELETE FROM activity_log WHERE created_at < ?`,
      [timestampSeconds]
    );
  }

  // Helper: Log request change
  static logRequestChange(userId, requestId, action, changes, req) {
    return this.log({
      user_id: userId,
      entity_type: 'request',
      entity_id: requestId,
      action,
      changes,
      ip_address: req?.ip,
      user_agent: req?.get('user-agent')
    });
  }

  // Helper: Log project change
  static logProjectChange(userId, projectId, action, changes, req) {
    return this.log({
      user_id: userId,
      entity_type: 'project',
      entity_id: projectId,
      action,
      changes,
      ip_address: req?.ip,
      user_agent: req?.get('user-agent')
    });
  }

  // Helper: Log scope item change
  static logScopeItemChange(userId, scopeItemId, action, changes, req) {
    return this.log({
      user_id: userId,
      entity_type: 'scope_item',
      entity_id: scopeItemId,
      action,
      changes,
      ip_address: req?.ip,
      user_agent: req?.get('user-agent')
    });
  }
}

module.exports = ActivityLog;
