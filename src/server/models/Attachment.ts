import { query } from '../../database/db';
import { Attachment as AttachmentType } from '../../types';

interface CreateAttachmentParams {
  project_id: number;
  entity_type: 'request' | 'change_order' | 'communication' | 'project';
  entity_id: number;
  filename: string;
  filepath: string;
  filesize: number;
  mimetype: string;
}

class Attachment {
  // Create attachment record
  static create({ project_id, entity_type, entity_id, filename, filepath, filesize, mimetype }: CreateAttachmentParams): AttachmentType | undefined {
    const result = query.run(
      `INSERT INTO attachments (project_id, entity_type, entity_id, filename, filepath, filesize, mimetype, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, entity_type, entity_id, filename, filepath, filesize, mimetype, Math.floor(Date.now() / 1000)]
    );

    return this.findById(Number(result.lastInsertRowid));
  }

  // Find by ID
  static findById(id: number): AttachmentType | undefined {
    return query.get<AttachmentType>(`SELECT * FROM attachments WHERE id = ?`, [id]);
  }

  // Find all for entity
  static findByEntity(entity_type: string, entity_id: number): AttachmentType[] {
    return query.all<AttachmentType>(
      `SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ? ORDER BY uploaded_at DESC`,
      [entity_type, entity_id]
    );
  }

  // Find all for project
  static findByProjectId(projectId: number): AttachmentType[] {
    return query.all<AttachmentType>(
      `SELECT * FROM attachments WHERE project_id = ? ORDER BY uploaded_at DESC`,
      [projectId]
    );
  }

  // Delete attachment
  static delete(id: number) {
    return query.run(`DELETE FROM attachments WHERE id = ?`, [id]);
  }
}

export default Attachment;
