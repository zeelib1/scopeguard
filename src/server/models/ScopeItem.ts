import { query } from '../../database/db';
import { ScopeItem as ScopeItemType } from '../../types';

interface CreateScopeItemParams {
  project_id: number;
  description: string;
  limit_value: number;
  limit_type?: string;
}

interface UpdateScopeItemParams {
  description?: string;
  limit_value?: number;
  limit_type?: string;
}

class ScopeItem {
  // Create scope item
  static create({ project_id, description, limit_value, limit_type }: CreateScopeItemParams): ScopeItemType | undefined {
    const result = query.run(
      `INSERT INTO scope_items (project_id, description, limit_value, limit_type, used_count)
       VALUES (?, ?, ?, ?, 0)`,
      [project_id, description, limit_value, limit_type || 'count']
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number): ScopeItemType | undefined {
    return query.get<ScopeItemType>(`SELECT * FROM scope_items WHERE id = ?`, [id]);
  }

  // Find all for a project
  static findByProjectId(projectId: number): ScopeItemType[] {
    return query.all<ScopeItemType>(
      `SELECT * FROM scope_items WHERE project_id = ? ORDER BY created_at ASC`,
      [projectId]
    );
  }

  // Update scope item
  static update(id: number, { description, limit_value, limit_type }: UpdateScopeItemParams): ScopeItemType | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (limit_value !== undefined) {
      updates.push('limit_value = ?');
      values.push(limit_value);
    }
    if (limit_type !== undefined) {
      updates.push('limit_type = ?');
      values.push(limit_type);
    }

    values.push(id);

    query.run(
      `UPDATE scope_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Increment used count
  static incrementUsed(id: number, amount: number = 1): ScopeItemType | undefined {
    query.run(
      `UPDATE scope_items SET used_count = used_count + ? WHERE id = ?`,
      [amount, id]
    );
    return this.findById(id);
  }

  // Delete scope item
  static delete(id: number) {
    return query.run(`DELETE FROM scope_items WHERE id = ?`, [id]);
  }

  // Get usage statistics
  static getUsageStats(id: number) {
    const item = this.findById(id);
    if (!item) return null;

    const remaining = item.limit_value ? item.limit_value - item.used_count : null;
    const percentage = item.limit_value ? (item.used_count / item.limit_value) * 100 : null;

    return {
      ...item,
      remaining,
      percentage: percentage ? Math.round(percentage) : null,
      is_exceeded: remaining !== null ? remaining < 0 : false,
      is_warning: percentage !== null ? percentage >= 80 : false
    };
  }

  // Get all stats for project
  static getProjectStats(projectId: number) {
    const items = this.findByProjectId(projectId);
    return items.map(item => this.getUsageStats(item.id));
  }
}

export default ScopeItem;
