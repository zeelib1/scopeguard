const { query } = require('../../database/db');

class ProjectMember {
  // Add member to project
  static add({ project_id, user_id, role, invited_by }) {
    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (role && !validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const result = query.run(
      `INSERT INTO project_members (project_id, user_id, role, invited_by, invited_at, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        user_id,
        role || 'member',
        invited_by || null,
        Math.floor(Date.now() / 1000),
        'active'
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    return query.get(
      `SELECT pm.*, u.email, u.full_name, p.project_name
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       LEFT JOIN projects p ON pm.project_id = p.id
       WHERE pm.id = ?`,
      [id]
    );
  }

  // Get all members of a project
  static findByProjectId(projectId) {
    return query.all(
      `SELECT pm.*, u.email, u.full_name
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ? AND pm.status = 'active'
       ORDER BY 
         CASE pm.role
           WHEN 'owner' THEN 1
           WHEN 'admin' THEN 2
           WHEN 'member' THEN 3
           WHEN 'viewer' THEN 4
         END`,
      [projectId]
    );
  }

  // Get all projects for a user
  static findByUserId(userId) {
    return query.all(
      `SELECT pm.*, p.project_name, p.client_name, p.status, p.created_at
       FROM project_members pm
       LEFT JOIN projects p ON pm.project_id = p.id
       WHERE pm.user_id = ? AND pm.status = 'active'
       ORDER BY p.updated_at DESC`,
      [userId]
    );
  }

  // Check if user is member of project
  static isMember(projectId, userId) {
    const member = query.get(
      `SELECT * FROM project_members 
       WHERE project_id = ? AND user_id = ? AND status = 'active'`,
      [projectId, userId]
    );
    return member !== undefined;
  }

  // Get user's role in project
  static getUserRole(projectId, userId) {
    const member = query.get(
      `SELECT role FROM project_members 
       WHERE project_id = ? AND user_id = ? AND status = 'active'`,
      [projectId, userId]
    );
    return member ? member.role : null;
  }

  // Check if user has permission (owner or admin)
  static hasAdminPermission(projectId, userId) {
    const role = this.getUserRole(projectId, userId);
    return role === 'owner' || role === 'admin';
  }

  // Update member role
  static updateRole(id, role) {
    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    query.run(
      `UPDATE project_members SET role = ? WHERE id = ?`,
      [role, id]
    );

    return this.findById(id);
  }

  // Remove member from project
  static remove(id) {
    query.run(
      `UPDATE project_members SET status = 'removed' WHERE id = ?`,
      [id]
    );
  }

  // Hard delete member
  static delete(id) {
    return query.run(`DELETE FROM project_members WHERE id = ?`, [id]);
  }

  // Accept invitation
  static acceptInvitation(id) {
    query.run(
      `UPDATE project_members SET status = 'active', accepted_at = ? WHERE id = ?`,
      [Math.floor(Date.now() / 1000), id]
    );

    return this.findById(id);
  }

  // Get project statistics
  static getProjectStats(projectId) {
    const stats = query.get(
      `SELECT 
        COUNT(*) as total_members,
        SUM(CASE WHEN role = 'owner' THEN 1 ELSE 0 END) as owners,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'member' THEN 1 ELSE 0 END) as members,
        SUM(CASE WHEN role = 'viewer' THEN 1 ELSE 0 END) as viewers
       FROM project_members
       WHERE project_id = ? AND status = 'active'`,
      [projectId]
    );

    return stats;
  }
}

module.exports = ProjectMember;
