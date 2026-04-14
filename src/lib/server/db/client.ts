import Database from 'better-sqlite3';
import { runMigrations } from './migrations.js';

const dbPath = process.env.NOVELLUM_DB_PATH ?? './novellum.db';

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
runMigrations(db);

export { db };
