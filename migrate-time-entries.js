const { query } = require('./src/database/db');

console.log('Running migration: Add time_entries table...');

try {
  // Create time_entries table
  query.run(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      description TEXT,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      duration_seconds INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_time_entries_request_id 
    ON time_entries(request_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_time_entries_user_id 
    ON time_entries(user_id)
  `);

  console.log('✓ Migration complete: time_entries table created');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
