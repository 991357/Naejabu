import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'naejabu-app', 'db.sqlite');

const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

// Gracefully close the database connection on exit
// This is important for SQLite to prevent database corruption
process.on('beforeExit', () => db.close());
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db;
