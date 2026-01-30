const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Get database path from env or default
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/scopeguard.db');

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper functions
const query = {
  get: (sql, params = []) => db.prepare(sql).get(params),
  all: (sql, params = []) => db.prepare(sql).all(params),
  run: (sql, params = []) => db.prepare(sql).run(params),
};

module.exports = { db, query };
