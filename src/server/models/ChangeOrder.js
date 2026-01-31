const { query, db } = require('../../database/db');

class ChangeOrder {
  // Create change order
  static create({ project_id, title, description, price, request_ids }) {
    // Start transaction
    const insertOrder = db.prepare(
      `INSERT INTO change_orders (project_id, title, description, price, status)
       VALUES (?, ?, ?, ?, 'pending')`
    );

    const insertLink = db.prepare(
      `INSERT INTO change_order_requests (change_order_id, request_id)
       VALUES (?, ?)`
    );

    const updateRequest = db.prepare(
      `UPDATE requests SET status = 'change-order-sent' WHERE id = ?`
    );

    try {
      // Insert change order
      const result = insertOrder.run(project_id, title, description || null, price);
      const changeOrderId = result.lastInsertRowid;

      // Link requests if provided
      if (request_ids && Array.isArray(request_ids)) {
        request_ids.forEach(requestId => {
          insertLink.run(changeOrderId, requestId);
          updateRequest.run(requestId);
        });
      }

      return this.findById(changeOrderId);
    } catch (err) {
      throw err;
    }
  }

  // Find by ID
  static findById(id) {
    const changeOrder = query.get(`SELECT * FROM change_orders WHERE id = ?`, [id]);
    
    if (!changeOrder) return null;

    // Get linked requests
    const requests = query.all(
      `SELECT r.* FROM requests r
       JOIN change_order_requests cor ON r.id = cor.request_id
       WHERE cor.change_order_id = ?`,
      [id]
    );

    return {
      ...changeOrder,
      requests
    };
  }

  // Find all for a project
  static findByProjectId(projectId, status = null) {
    if (status) {
      return query.all(
        `SELECT * FROM change_orders WHERE project_id = ? AND status = ? ORDER BY created_at DESC`,
        [projectId, status]
      );
    }
    return query.all(
      `SELECT * FROM change_orders WHERE project_id = ? ORDER BY created_at DESC`,
      [projectId]
    );
  }

  // Update change order
  static update(id, { title, description, price, status }) {
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      if (status === 'approved') {
        updates.push('approved_at = ?');
        values.push(Math.floor(Date.now() / 1000));
      }
    }

    values.push(id);

    query.run(
      `UPDATE change_orders SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Approve change order
  static approve(id) {
    return this.update(id, { status: 'approved' });
  }

  // Reject change order
  static reject(id) {
    return this.update(id, { status: 'rejected' });
  }

  // Delete change order
  static delete(id) {
    // Also unlink requests (set their status back to out-of-scope)
    const changeOrder = this.findById(id);
    
    if (changeOrder && changeOrder.requests) {
      changeOrder.requests.forEach(request => {
        query.run(
          `UPDATE requests SET status = 'out-of-scope' WHERE id = ?`,
          [request.id]
        );
      });
    }

    return query.run(`DELETE FROM change_orders WHERE id = ?`, [id]);
  }

  // Get statistics for project
  static getProjectStats(projectId) {
    const stats = query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'approved' THEN price ELSE 0 END) as approved_revenue,
        SUM(price) as total_potential_revenue
       FROM change_orders
       WHERE project_id = ?`,
      [projectId]
    );

    return stats;
  }

  // Generate change order from out-of-scope requests
  static generateFromRequests(projectId, requestIds, { title, price }) {
    const Request = require('./Request');

    // Verify all requests are out-of-scope
    const requests = requestIds.map(id => Request.findById(id)).filter(Boolean);
    
    const outOfScope = requests.filter(r => r.status === 'out-of-scope');
    
    if (outOfScope.length !== requestIds.length) {
      throw new Error('All requests must be out-of-scope');
    }

    // Auto-generate description from requests
    const description = outOfScope
      .map((r, i) => `${i + 1}. ${r.description}`)
      .join('\n');

    return this.create({
      project_id: projectId,
      title,
      description,
      price,
      request_ids: requestIds
    });
  }
}

module.exports = ChangeOrder;
