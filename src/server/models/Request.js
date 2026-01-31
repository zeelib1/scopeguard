const { query } = require('../../database/db');

class Request {
  // Create request
  static create({ project_id, description, source, status, priority, scope_item_id, notes }) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const requestPriority = priority && validPriorities.includes(priority) ? priority : 'medium';

    const result = query.run(
      `INSERT INTO requests (project_id, description, source, status, priority, scope_item_id, notes, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        description,
        source || null,
        status || 'pending',
        requestPriority,
        scope_item_id || null,
        notes || null,
        Math.floor(Date.now() / 1000)
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    return query.get(`SELECT * FROM requests WHERE id = ?`, [id]);
  }

  // Find all for a project
  static findByProjectId(projectId, status = null) {
    if (status) {
      return query.all(
        `SELECT r.*, si.description as scope_item_description
         FROM requests r
         LEFT JOIN scope_items si ON r.scope_item_id = si.id
         WHERE r.project_id = ? AND r.status = ?
         ORDER BY r.requested_at DESC`,
        [projectId, status]
      );
    }
    return query.all(
      `SELECT r.*, si.description as scope_item_description
       FROM requests r
       LEFT JOIN scope_items si ON r.scope_item_id = si.id
       WHERE r.project_id = ?
       ORDER BY r.requested_at DESC`,
      [projectId]
    );
  }

  // Update request
  static update(id, { description, source, status, priority, scope_item_id, notes }) {
    const updates = [];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (source !== undefined) {
      updates.push('source = ?');
      values.push(source);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      // If marking as reviewed, set reviewed_at
      if (status !== 'pending') {
        updates.push('reviewed_at = ?');
        values.push(Math.floor(Date.now() / 1000));
      }
    }
    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (validPriorities.includes(priority)) {
        updates.push('priority = ?');
        values.push(priority);
      }
    }
    if (scope_item_id !== undefined) {
      updates.push('scope_item_id = ?');
      values.push(scope_item_id);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    values.push(id);

    query.run(
      `UPDATE requests SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete request
  static delete(id) {
    return query.run(`DELETE FROM requests WHERE id = ?`, [id]);
  }

  // Get request statistics for project
  static getProjectStats(projectId) {
    const stats = query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in-scope' THEN 1 ELSE 0 END) as in_scope,
        SUM(CASE WHEN status = 'out-of-scope' THEN 1 ELSE 0 END) as out_of_scope,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'change-order-sent' THEN 1 ELSE 0 END) as change_order_sent
       FROM requests
       WHERE project_id = ?`,
      [projectId]
    );

    return stats;
  }

  // Mark request as categorized (in-scope or out-of-scope)
  static categorize(id, status, scopeItemId = null) {
    if (!['in-scope', 'out-of-scope'].includes(status)) {
      throw new Error('Status must be in-scope or out-of-scope');
    }

    const ScopeItem = require('./ScopeItem');

    // If marking in-scope and linking to scope item, increment usage
    if (status === 'in-scope' && scopeItemId) {
      ScopeItem.incrementUsed(scopeItemId, 1);
    }

    return this.update(id, {
      status,
      scope_item_id: scopeItemId
    });
  }
}

module.exports = Request;
