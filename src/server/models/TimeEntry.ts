import { query } from '../../database/db';
import { TimeEntry as TimeEntryType } from '../../types';

interface CreateTimeEntryParams {
  request_id: number;
  user_id: number;
  description?: string;
}

class TimeEntry {
  // Start timer for a request
  static start({ request_id, user_id, description }: CreateTimeEntryParams): TimeEntryType | undefined {
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

    return this.findById(Number(result.lastInsertRowid));
  }

  // Stop timer
  static stop(id: number, user_id: number): TimeEntryType | undefined {
    const entry = this.findById(id);
    
    if (!entry) {
      throw new Error('Time entry not found');
    }

    if (entry.user_id !== user_id) {
      throw new Error('Access denied');
    }

    if ((entry as any).ended_at) {
      throw new Error('Timer already stopped');
    }

    const now = Math.floor(Date.now() / 1000);
    const duration = now - Number((entry as any).started_at);

    query.run(
      `UPDATE time_entries SET ended_at = ?, duration_seconds = ? WHERE id = ?`,
      [now, duration, id]
    );

    return this.findById(id);
  }

  // Get active timer for a user
  static getActiveTimer(user_id: number): TimeEntryType | undefined {
    return query.get<TimeEntryType>(
      `SELECT * FROM time_entries WHERE user_id = ? AND ended_at IS NULL`,
      [user_id]
    );
  }

  // Find by ID
  static findById(id: number): TimeEntryType | undefined {
    return query.get<TimeEntryType>(`SELECT * FROM time_entries WHERE id = ?`, [id]);
  }

  // Find all for a project
  static findByProjectId(projectId: number): TimeEntryType[] {
    return query.all<TimeEntryType>(
      `SELECT te.*, r.description as request_description
       FROM time_entries te
       LEFT JOIN requests r ON te.request_id = r.id
       WHERE r.project_id = ?
       ORDER BY te.started_at DESC`,
      [projectId]
    );
  }

  // Get total time for project
  static getProjectTotalTime(projectId: number): number {
    const result = query.get(
      `SELECT SUM(duration_seconds) as total
       FROM time_entries te
       LEFT JOIN requests r ON te.request_id = r.id
       WHERE r.project_id = ?`,
      [projectId]
    );

    return (result as any)?.total || 0;
  }

  // Delete time entry
  static delete(id: number) {
    return query.run(`DELETE FROM time_entries WHERE id = ?`, [id]);
  }
}

export default TimeEntry;
