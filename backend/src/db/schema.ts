import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DB_PATH ?? "./data/magasinier.db";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS search_history (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      oem_ref    TEXT NOT NULL,
      searched_at TEXT NOT NULL DEFAULT (datetime('now')),
      result_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      oem_ref  TEXT NOT NULL UNIQUE,
      label    TEXT,
      added_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_history_ref ON search_history(oem_ref);
  `);
}
