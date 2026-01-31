import { query } from '../../database/db';
import { ProjectMember as ProjectMemberType } from '../../types';

interface AddMemberParams {
  project_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

class ProjectMember {
  // Add member to project
  static add({ project_id, user_id, role }: AddMemberParams): ProjectMemberType | undefined {
    const result = query.run(
      `INSERT INTO project_members (project_id, user_id, role, added_at)
       VALUES (?, ?, ?, ?)`,
      [project_id, user_id, role, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number): ProjectMemberType | undefined {
    return query.get<ProjectMemberType>(`SELECT * FROM project_members WHERE id = ?`, [id]);
  }

  // Find all for project
  static findByProjectId(projectId: number) {
    return query.all(
      `SELECT pm.*, u.email, u.full_name
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.added_at ASC`,
      [projectId]
    );
  }

  // Check if user is member of project
  static isMember(project_id: number, user_id: number): boolean {
    const member = query.get(
      `SELECT id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [project_id, user_id]
    );
    return !!member;
  }

  // Update member role
  static updateRole(id: number, role: string) {
    query.run(
      `UPDATE project_members SET role = ? WHERE id = ?`,
      [role, id]
    );
    return this.findById(id);
  }

  // Remove member from project
  static remove(id: number) {
    return query.run(`DELETE FROM project_members WHERE id = ?`, [id]);
  }
}

export default ProjectMember;
