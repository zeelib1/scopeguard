const { query } = require('./src/database/db');

console.log('Running migration: Add webhooks tables...');

try {
  query.run(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER,
      url TEXT NOT NULL,
      secret TEXT,
      events TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      last_triggered_at INTEGER,
      last_error TEXT,
      failure_count INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  query.run(`
    CREATE TABLE IF NOT EXISTS webhook_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      webhook_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      response_status INTEGER,
      response_body TEXT,
      error TEXT,
      delivered_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
    )
  `);

  query.run(`
    CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_webhooks_project_id ON webhooks(project_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id 
    ON webhook_deliveries(webhook_id)
  `);

  console.log('✓ Migration complete: webhooks tables created');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
