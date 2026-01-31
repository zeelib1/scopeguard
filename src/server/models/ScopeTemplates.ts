import { query } from '../../database/db';
import { ScopeTemplate as ScopeTemplateType } from '../../types';

interface CreateTemplateParams {
  user_id: number;
  name: string;
  description?: string;
  items: any[];
}

class ScopeTemplates {
  // Create template
  static create({ user_id, name, description, items }: CreateTemplateParams): ScopeTemplateType | undefined {
    const itemsJson = JSON.stringify(items);
    
    const result = query.run(
      `INSERT INTO scope_templates (user_id, name, description, items, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, name, description || null, itemsJson, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number) {
    const template = query.get<ScopeTemplateType>(`SELECT * FROM scope_templates WHERE id = ?`, [id]);
    
    if (template && template.items) {
      try {
        (template as any).items = JSON.parse(template.items);
      } catch (e) {
        (template as any).items = [];
      }
    }
    
    return template;
  }

  // Find all for user
  static findByUserId(userId: number) {
    const templates = query.all(
      `SELECT * FROM scope_templates WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    
    return templates.map((template: any) => {
      if (template.items) {
        try {
          template.items = JSON.parse(template.items);
        } catch (e) {
          template.items = [];
        }
      }
      return template;
    });
  }

  // Update template
  static update(id: number, { name, description, items }: { name?: string; description?: string; items?: any[] }) {
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (items !== undefined) {
      updates.push('items = ?');
      values.push(JSON.stringify(items));
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);

    query.run(
      `UPDATE scope_templates SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete template
  static delete(id: number) {
    return query.run(`DELETE FROM scope_templates WHERE id = ?`, [id]);
  }
}

export default ScopeTemplates;
