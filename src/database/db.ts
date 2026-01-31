import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseRow } from '../types';

// Get database path from env or default
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/scopeguard.db');

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper functions with proper typing
const query = {
  get: <T = DatabaseRow>(sql: string, params: any[] = []): T | undefined => {
    return db.prepare(sql).get(params) as T | undefined;
  },
  all: <T = DatabaseRow>(sql: string, params: any[] = []): T[] => {
    return db.prepare(sql).all(params) as T[];
  },
  run: (sql: string, params: any[] = []): Database.RunResult => {
    return db.prepare(sql).run(params);
  },
};

export { db, query };
