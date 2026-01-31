import { query } from '../../database/db';
import { ActivityLog as ActivityLogType } from '../../types';

interface LogActivityParams {
  user_id?: number;
  entity_type: string;
  entity_id: number;
  action: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
}

class ActivityLog {
  // Log an activity
  static log({ user_id, entity_type, entity_id, action, changes, ip_address, user_agent }: LogActivityParams) {
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

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number) {
    const log = query.get(
      `SELECT al.*, u.email, u.full_name 
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.id = ?`,
      [id]
    );
    
    if (log && (log as any).changes) {
      try {
        (log as any).changes = JSON.parse((log as any).changes);
      } catch (e) {
        // Leave as string if not valid JSON
      }
    }
    
    return log;
  }

  // Find all for entity
  static findByEntity(entity_type: string, entity_id: number) {
    const logs = query.all(
      `SELECT al.*, u.email, u.full_name
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = ? AND al.entity_id = ?
       ORDER BY al.created_at DESC`,
      [entity_type, entity_id]
    );
    
    return logs.map((log: any) => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          // Leave as string
        }
      }
      return log;
    });
  }

  // Find all for user
  static findByUser(user_id: number, limit: number = 50) {
    const logs = query.all(
      `SELECT al.*, u.email, u.full_name
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.user_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [user_id, limit]
    );
    
    return logs.map((log: any) => {
      if (log.changes) {
        try {
          log.changes = JSON.parse(log.changes);
        } catch (e) {
          // Leave as string
        }
      }
      return log;
    });
  }
}

export default ActivityLog;
