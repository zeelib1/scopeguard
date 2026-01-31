import { query } from '../../database/db';
import { PortalToken as PortalTokenType } from '../../types';
import crypto from 'crypto';

class PortalToken {
  // Generate new portal token
  static generate(project_id: number, expiresInDays: number = 30): PortalTokenType | undefined {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);

    const result = query.run(
      `INSERT INTO portal_tokens (project_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
      [project_id, token, expiresAt, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number): PortalTokenType | undefined {
    return query.get<PortalTokenType>(`SELECT * FROM portal_tokens WHERE id = ?`, [id]);
  }

  // Find by token
  static findByToken(token: string): PortalTokenType | undefined {
    return query.get<PortalTokenType>(`SELECT * FROM portal_tokens WHERE token = ?`, [token]);
  }

  // Verify token is valid and not expired
  static verify(token: string): PortalTokenType | null {
    const portalToken = this.findByToken(token);
    
    if (!portalToken) return null;
    
    const now = Math.floor(Date.now() / 1000);
    if (Number(portalToken.expires_at) < now) {
      return null;
    }

    return portalToken;
  }

  // Find all for project
  static findByProjectId(projectId: number): PortalTokenType[] {
    return query.all<PortalTokenType>(
      `SELECT * FROM portal_tokens WHERE project_id = ? ORDER BY created_at DESC`,
      [projectId]
    );
  }

  // Revoke token
  static revoke(id: number) {
    return query.run(`DELETE FROM portal_tokens WHERE id = ?`, [id]);
  }
}

export default PortalToken;
