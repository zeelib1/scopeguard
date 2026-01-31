const { query } = require('../../database/db');
const crypto = require('crypto');

class Webhook {
  // Create webhook
  static create({ user_id, project_id, url, secret, events }) {
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('Events must be a non-empty array');
    }

    const result = query.run(
      `INSERT INTO webhooks (user_id, project_id, url, secret, events, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [
        user_id,
        project_id || null,
        url,
        secret || null,
        JSON.stringify(events),
        Math.floor(Date.now() / 1000)
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    const webhook = query.get(`SELECT * FROM webhooks WHERE id = ?`, [id]);
    if (webhook && webhook.events) {
      webhook.events = JSON.parse(webhook.events);
    }
    return webhook;
  }

  // Get all webhooks for user
  static findByUserId(userId, projectId = null) {
    let sql = `SELECT * FROM webhooks WHERE user_id = ?`;
    const params = [userId];

    if (projectId) {
      sql += ` AND (project_id = ? OR project_id IS NULL)`;
      params.push(projectId);
    }

    sql += ` ORDER BY created_at DESC`;

    const webhooks = query.all(sql, params);
    return webhooks.map(w => {
      if (w.events) w.events = JSON.parse(w.events);
      return w;
    });
  }

  // Update webhook
  static update(id, { url, secret, events, status }) {
    const updates = [];
    const values = [];

    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (secret !== undefined) {
      updates.push('secret = ?');
      values.push(secret);
    }
    if (events !== undefined) {
      if (!Array.isArray(events)) {
        throw new Error('Events must be an array');
      }
      updates.push('events = ?');
      values.push(JSON.stringify(events));
    }
    if (status !== undefined) {
      const validStatuses = ['active', 'paused', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    query.run(
      `UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete webhook
  static delete(id) {
    return query.run(`DELETE FROM webhooks WHERE id = ?`, [id]);
  }

  // Trigger webhooks for an event
  static async triggerEvent(eventType, payload, userId, projectId = null) {
    // Find all webhooks that subscribe to this event
    const webhooks = this.findByUserId(userId, projectId);
    const matchingWebhooks = webhooks.filter(w => 
      w.status === 'active' && w.events.includes(eventType)
    );

    const results = [];

    for (const webhook of matchingWebhooks) {
      try {
        const result = await this.deliver(webhook.id, eventType, payload);
        results.push(result);
      } catch (err) {
        console.error(`Webhook ${webhook.id} delivery failed:`, err);
        results.push({ webhookId: webhook.id, success: false, error: err.message });
      }
    }

    return results;
  }

  // Deliver webhook
  static async deliver(webhookId, eventType, payload) {
    const webhook = this.findById(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const fullPayload = {
      event: eventType,
      timestamp: Math.floor(Date.now() / 1000),
      data: payload
    };

    const payloadJson = JSON.stringify(fullPayload);

    // Generate signature if secret is set
    let signature = null;
    if (webhook.secret) {
      signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadJson)
        .digest('hex');
    }

    try {
      // Make HTTP request (using fetch if available in Node v18+)
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ScopeGuard-Webhook/1.0',
          ...(signature && { 'X-Webhook-Signature': signature })
        },
        body: payloadJson,
        timeout: 5000
      });

      const responseBody = await response.text();

      // Log delivery
      query.run(
        `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, response_status, response_body, delivered_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [webhookId, eventType, payloadJson, response.status, responseBody, Math.floor(Date.now() / 1000)]
      );

      // Update webhook
      query.run(
        `UPDATE webhooks SET last_triggered_at = ?, failure_count = 0, last_error = NULL WHERE id = ?`,
        [Math.floor(Date.now() / 1000), webhookId]
      );

      return { success: true, status: response.status };
    } catch (err) {
      // Log failed delivery
      query.run(
        `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, error, delivered_at)
         VALUES (?, ?, ?, ?, ?)`,
        [webhookId, eventType, payloadJson, err.message, Math.floor(Date.now() / 1000)]
      );

      // Update failure count
      const failureCount = webhook.failure_count + 1;
      const newStatus = failureCount >= 5 ? 'failed' : 'active';

      query.run(
        `UPDATE webhooks SET failure_count = ?, last_error = ?, status = ? WHERE id = ?`,
        [failureCount, err.message, newStatus, webhookId]
      );

      throw err;
    }
  }

  // Get delivery history
  static getDeliveries(webhookId, limit = 50) {
    return query.all(
      `SELECT * FROM webhook_deliveries WHERE webhook_id = ? ORDER BY delivered_at DESC LIMIT ?`,
      [webhookId, limit]
    );
  }

  // Supported events
  static getSupportedEvents() {
    return [
      'request.created',
      'request.categorized',
      'request.status_changed',
      'scope_item.warning', // 80%+ usage
      'scope_item.exceeded',
      'change_order.created',
      'change_order.approved',
      'change_order.rejected',
      'project.created',
      'project.updated',
      'budget.warning', // 80%+ spent
      'budget.exceeded'
    ];
  }
}

module.exports = Webhook;
