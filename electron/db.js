const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs-extra');

let db;

function initDB() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'devtasks.sqlite');
  
  fs.ensureDirSync(userDataPath);
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  runMigrations();
  return db;
}

function runMigrations() {
  // 1. PROJECTS TABLE
  const createProjects = `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#ffffff',
      path TEXT UNIQUE, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(createProjects);
  
  // 2. TASKS TABLE (Updated Definition for new installs)
  const createTasks = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      category TEXT DEFAULT 'feature', -- <--- NEW
      estimated_hours REAL DEFAULT 0,  -- <--- NEW
      due_date DATETIME,
      local_path TEXT,
      timer_start DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    );
  `;
  db.exec(createTasks);
  
  // 3. OTHER TABLES
  const createSubtasks = `CREATE TABLE IF NOT EXISTS subtasks (id INTEGER PRIMARY KEY, task_id INTEGER, title TEXT, is_completed INTEGER, created_at DATETIME);`;
  db.exec(createSubtasks);
  
  const createTags = `CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE, color TEXT);`;
  db.exec(createTags);
  
  const createTaskTags = `CREATE TABLE IF NOT EXISTS task_tags (task_id INTEGER, tag_id INTEGER, PRIMARY KEY (task_id, tag_id));`;
  db.exec(createTaskTags);
  
  const createTimeLogs = `CREATE TABLE IF NOT EXISTS time_logs (id INTEGER PRIMARY KEY, task_id INTEGER, start_time DATETIME, end_time DATETIME, duration_seconds INTEGER, created_at DATETIME);`;
  db.exec(createTimeLogs);

  // 4. MIGRATIONS (Safe upgrades for existing DBs)
  // ... Previous migrations ...
  try { db.exec("ALTER TABLE projects ADD COLUMN path TEXT UNIQUE"); } catch (e) {}
  try { db.exec("ALTER TABLE tasks ADD COLUMN local_path TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE tasks ADD COLUMN timer_start DATETIME"); } catch (e) {}

  // ... NEW MIGRATIONS (For this Sprint) ...
  try { db.exec("ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'feature'"); } catch (e) {}
  try { db.exec("ALTER TABLE tasks ADD COLUMN estimated_hours REAL DEFAULT 0"); } catch (e) {}

  // 5. SEED DATA
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  if (count === 0) {
    db.prepare('INSERT INTO projects (name, color, path) VALUES (?, ?, ?)').run('Default Workspace', '#3b82f6', null);
  }
}

module.exports = { initDB };