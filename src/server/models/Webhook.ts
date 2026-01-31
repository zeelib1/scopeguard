import { query } from '../../database/db';
import { Webhook as WebhookType } from '../../types';

interface CreateWebhookParams {
  project_id: number;
  url: string;
  events: string[];
}

class Webhook {
  // Create webhook
  static create({ project_id, url, events }: CreateWebhookParams): WebhookType | undefined {
    const eventsJson = JSON.stringify(events);
    
    const result = query.run(
      `INSERT INTO webhooks (project_id, url, events, active, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      [project_id, url, eventsJson, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number) {
    const webhook = query.get<WebhookType>(`SELECT * FROM webhooks WHERE id = ?`, [id]);
    
    if (webhook && webhook.events) {
      try {
        (webhook as any).events = JSON.parse(webhook.events);
      } catch (e) {
        (webhook as any).events = [];
      }
    }
    
    return webhook;
  }

  // Find all for project
  static findByProjectId(projectId: number) {
    const webhooks = query.all(
      `SELECT * FROM webhooks WHERE project_id = ? ORDER BY created_at DESC`,
      [projectId]
    );
    
    return webhooks.map((webhook: any) => {
      if (webhook.events) {
        try {
          webhook.events = JSON.parse(webhook.events);
        } catch (e) {
          webhook.events = [];
        }
      }
      return webhook;
    });
  }

  // Update webhook
  static update(id: number, { url, events, active }: { url?: string; events?: string[]; active?: number }) {
    const updates: string[] = [];
    const values: any[] = [];

    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (events !== undefined) {
      updates.push('events = ?');
      values.push(JSON.stringify(events));
    }
    if (active !== undefined) {
      updates.push('active = ?');
      values.push(active);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);

    query.run(
      `UPDATE webhooks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete webhook
  static delete(id: number) {
    return query.run(`DELETE FROM webhooks WHERE id = ?`, [id]);
  }

  // Find active webhooks for project and event
  static findActiveForEvent(project_id: number, eventName: string) {
    const webhooks = this.findByProjectId(project_id);
    
    return webhooks.filter((webhook: any) => 
      webhook.active === 1 && 
      webhook.events && 
      Array.isArray(webhook.events) && 
      webhook.events.includes(eventName)
    );
  }
}

export default Webhook;
