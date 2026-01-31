const { query } = require('./src/database/db');

console.log('Running migration: Add client approval fields...');

try {
  // Add client approval columns to change_orders
  try {
    query.run(`ALTER TABLE change_orders ADD COLUMN client_notes TEXT`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }
  
  try {
    query.run(`ALTER TABLE change_orders ADD COLUMN approved_by TEXT`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }
  
  try {
    query.run(`ALTER TABLE change_orders ADD COLUMN rejected_at INTEGER`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }

  console.log('✓ Migration complete: client approval fields added');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
