const { query } = require('../../database/db');

class Attachment {
  // Create attachment
  static create({ request_id, filename, original_filename, mime_type, file_size, file_path }) {
    const result = query.run(
      `INSERT INTO request_attachments (request_id, filename, original_filename, mime_type, file_size, file_path, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        request_id,
        filename,
        original_filename,
        mime_type,
        file_size,
        file_path,
        Math.floor(Date.now() / 1000)
      ]
    );

    return this.findById(result.lastInsertRowid);
  }

  // Find by ID
  static findById(id) {
    return query.get(`SELECT * FROM request_attachments WHERE id = ?`, [id]);
  }

  // Find all for a request
  static findByRequestId(requestId) {
    return query.all(
      `SELECT * FROM request_attachments WHERE request_id = ? ORDER BY uploaded_at DESC`,
      [requestId]
    );
  }

  // Delete attachment
  static delete(id) {
    return query.run(`DELETE FROM request_attachments WHERE id = ?`, [id]);
  }

  // Get total file size for a request
  static getTotalSize(requestId) {
    const result = query.get(
      `SELECT SUM(file_size) as total_size FROM request_attachments WHERE request_id = ?`,
      [requestId]
    );
    return result.total_size || 0;
  }
}

module.exports = Attachment;
