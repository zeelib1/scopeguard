const { query } = require('./src/database/db');

console.log('Running migration: Add priority column to requests...');

try {
  // Add priority column (SQLite doesn't support adding columns with constraints easily)
  query.run(`
    ALTER TABLE requests ADD COLUMN priority TEXT DEFAULT 'medium'
  `);

  console.log('✓ Migration complete: priority column added to requests');
} catch (err) {
  if (err.message.includes('duplicate column')) {
    console.log('✓ Column already exists, skipping');
  } else {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
