const crypto = require('crypto');
const { query } = require('../../database/db');

class PortalToken {
  // Generate new portal token for project
  static generate(projectId, expiresInDays = null) {
    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry if specified
    const expires_at = expiresInDays 
      ? Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60)
      : null;

    const result = query.run(
      `INSERT INTO portal_tokens (project_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [projectId, token, expires_at]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    return query.get(`SELECT * FROM portal_tokens WHERE id = ?`, [id]);
  }

  // Find by token
  static findByToken(token) {
    return query.get(`SELECT * FROM portal_tokens WHERE token = ?`, [token]);
  }

  // Find all for a project
  static findByProjectId(projectId) {
    return query.all(
      `SELECT * FROM portal_tokens WHERE project_id = ? ORDER BY created_at DESC`,
      [projectId]
    );
  }

  // Verify token is valid
  static verify(token) {
    const portalToken = this.findByToken(token);
    
    if (!portalToken) {
      return { valid: false, reason: 'Token not found' };
    }

    // Check expiry
    if (portalToken.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now > portalToken.expires_at) {
        return { valid: false, reason: 'Token expired' };
      }
    }

    return { valid: true, projectId: portalToken.project_id };
  }

  // Update last accessed timestamp
  static updateAccessed(token) {
    query.run(
      `UPDATE portal_tokens SET last_accessed_at = ? WHERE token = ?`,
      [Math.floor(Date.now() / 1000), token]
    );
  }

  // Revoke token
  static revoke(id) {
    return query.run(`DELETE FROM portal_tokens WHERE id = ?`, [id]);
  }

  // Revoke all tokens for a project
  static revokeAll(projectId) {
    return query.run(`DELETE FROM portal_tokens WHERE project_id = ?`, [projectId]);
  }
}

module.exports = PortalToken;
