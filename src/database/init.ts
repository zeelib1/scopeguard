import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { db } from './db';

// Read schema file
const schemaPath = path.join(__dirname, '../../schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('🔧 Initializing ScopeGuard database...');

try {
  // Execute entire schema at once (SQLite handles dependencies)
  db.exec(schema);
  console.log(`✅ Database schema created successfully`);

  console.log('✅ Database initialized successfully!');

  // Add seed data for testing
  console.log('\n🌱 Adding seed data...');

  const testPasswordHash = bcrypt.hashSync('password123', 10);

  // Create test user
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, subscription_status)
    VALUES (?, ?, ?, ?)
  `);

  const userResult = insertUser.run('test@scopeguard.app', testPasswordHash, 'Test User', 'pro');

  console.log(`✅ Created test user: test@scopeguard.app (password: password123)`);

  // Create test project
  const insertProject = db.prepare(`
    INSERT INTO projects (user_id, client_name, project_name, description, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const projectResult = insertProject.run(
    userResult.lastInsertRowid,
    'Acme Corp',
    'Website Redesign',
    'Complete website redesign with 5 pages and 3 revision rounds',
    'active'
  );

  console.log(`✅ Created test project: Website Redesign for Acme Corp`);

  // Create test scope items
  const insertScopeItem = db.prepare(`
    INSERT INTO scope_items (project_id, description, limit_value, limit_type, used_count)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertScopeItem.run(projectResult.lastInsertRowid, 'Homepage designs', 3, 'count', 2);
  insertScopeItem.run(projectResult.lastInsertRowid, 'Internal pages', 4, 'count', 1);
  insertScopeItem.run(projectResult.lastInsertRowid, 'Revision rounds', 3, 'count', 1);

  console.log(`✅ Created 3 scope items with usage tracking`);

  // Create test requests
  const insertRequest = db.prepare(`
    INSERT INTO requests (project_id, description, source, status, requested_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = Math.floor(Date.now() / 1000);
  insertRequest.run(projectResult.lastInsertRowid, 'Update homepage hero section', 'email', 'in-scope', now - 86400);
  insertRequest.run(projectResult.lastInsertRowid, 'Add contact form to about page', 'slack', 'in-scope', now - 7200);
  insertRequest.run(projectResult.lastInsertRowid, 'Create blog section (not in original scope)', 'meeting', 'out-of-scope', now - 3600);

  console.log(`✅ Created 3 test requests (2 in-scope, 1 out-of-scope)`);

  console.log('\n🎉 Database setup complete!');
  console.log('\nTest credentials:');
  console.log('  Email: test@scopeguard.app');
  console.log('  Password: password123');

} catch (err) {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
}

db.close();
