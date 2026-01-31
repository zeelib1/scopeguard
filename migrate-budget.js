const { query } = require('./src/database/db');

console.log('Running migration: Add budget tracking columns...');

try {
  // Add budget columns to projects
  try {
    query.run(`ALTER TABLE projects ADD COLUMN budget_amount REAL`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }
  
  try {
    query.run(`ALTER TABLE projects ADD COLUMN budget_currency TEXT DEFAULT 'USD'`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }
  
  try {
    query.run(`ALTER TABLE projects ADD COLUMN hourly_rate REAL`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }

  // Add cost columns to requests
  try {
    query.run(`ALTER TABLE requests ADD COLUMN estimated_cost REAL`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }
  
  try {
    query.run(`ALTER TABLE requests ADD COLUMN actual_cost REAL`);
  } catch (e) {
    if (!e.message.includes('duplicate column')) throw e;
  }

  console.log('✓ Migration complete: budget tracking columns added');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
