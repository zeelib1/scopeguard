const { query } = require('./src/database/db');

console.log('Running migration: Add request_attachments table...');

try {
  // Create attachments table
  query.run(`
    CREATE TABLE IF NOT EXISTS request_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    )
  `);

  // Create index
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_request_attachments_request_id 
    ON request_attachments(request_id)
  `);

  console.log('✓ Migration complete: request_attachments table created');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
