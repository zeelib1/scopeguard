const { query } = require('./src/database/db');

console.log('Running migration: Add communication_logs table...');

try {
  // Create communication_logs table
  query.run(`
    CREATE TABLE IF NOT EXISTS communication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      communication_type TEXT NOT NULL,
      subject TEXT,
      notes TEXT NOT NULL,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_communication_logs_project_id 
    ON communication_logs(project_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_communication_logs_occurred_at 
    ON communication_logs(occurred_at)
  `);

  console.log('✓ Migration complete: communication_logs table created');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
