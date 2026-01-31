const { query } = require('./src/database/db');

console.log('Running migration: Add project_members table...');

try {
  query.run(`
    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      invited_by INTEGER,
      invited_at INTEGER DEFAULT (strftime('%s', 'now')),
      accepted_at INTEGER,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(project_id, user_id)
    )
  `);

  query.run(`
    CREATE INDEX IF NOT EXISTS idx_project_members_project_id 
    ON project_members(project_id)
  `);
  
  query.run(`
    CREATE INDEX IF NOT EXISTS idx_project_members_user_id 
    ON project_members(user_id)
  `);

  // Add project owners as members
  console.log('Adding existing project owners as members...');
  const projects = query.all(`SELECT id, user_id FROM projects`);
  
  for (const project of projects) {
    try {
      query.run(
        `INSERT OR IGNORE INTO project_members (project_id, user_id, role, status, accepted_at)
         VALUES (?, ?, 'owner', 'active', strftime('%s', 'now'))`,
        [project.id, project.user_id]
      );
    } catch (e) {
      // Skip if already exists
    }
  }

  console.log(`✓ Migration complete: project_members table created, ${projects.length} owners added`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
