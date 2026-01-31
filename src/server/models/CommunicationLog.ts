import { query } from '../../database/db';
import { CommunicationLog as CommunicationLogType } from '../../types';

interface CreateCommunicationParams {
  project_id: number;
  user_id: number;
  communication_type: string;
  subject?: string;
  notes: string;
  occurred_at?: number;
}

class CommunicationLog {
  // Create communication log entry
  static create({ project_id, user_id, communication_type, subject, notes, occurred_at }: CreateCommunicationParams) {
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

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number) {
    return query.get(
      `SELECT cl.*, u.email, u.full_name 
       FROM communication_logs cl
       LEFT JOIN users u ON cl.user_id = u.id
       WHERE cl.id = ?`,
      [id]
    );
  }

  // Find all for a project
  static findByProjectId(projectId: number) {
    return query.all(
      `SELECT cl.*, u.email, u.full_name
       FROM communication_logs cl
       LEFT JOIN users u ON cl.user_id = u.id
       WHERE cl.project_id = ?
       ORDER BY cl.occurred_at DESC`,
      [projectId]
    );
  }

  // Delete communication log
  static delete(id: number) {
    return query.run(`DELETE FROM communication_logs WHERE id = ?`, [id]);
  }
}

export default CommunicationLog;
