const { query } = require('./src/database/db');

console.log('Running migration: Add activity_log table...');

try {
  query.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      changes TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  query.run(`
    CREATE INDEX IF NOT EXISTS idx_activity_log_entity 
    ON activity_log(entity_type, entity_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_activity_log_user_id 
    ON activity_log(user_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_activity_log_created_at 
    ON activity_log(created_at)
  `);

  console.log('✓ Migration complete: activity_log table created');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
