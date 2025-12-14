const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { initDB } = require('./db');
const simpleGit = require('simple-git');
const fs = require('fs');

const db = initDB();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1e1e1e',
    title: 'Nodepad',
    icon: path.join(__dirname, '../build/icon.png'), // Ensure icon loads in dev
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // --- NATIVE MENU DEFINITION ---
  const isMac = process.platform === 'darwin';

  const template = [
    // { role: 'appMenu' } (Mac only standard menu)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        { 
          label: 'Open Project / Folder...', 
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu-open-project') 
        },
        { 
          label: 'Close Project', 
          click: () => win.webContents.send('menu-close-project') 
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { Custom Task Menu }
    {
      label: 'Tasks',
      submenu: [
        { 
          label: 'New Task', 
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu-new-task') 
        },
        { 
          label: 'Search Tasks', 
          accelerator: 'CmdOrCtrl+K',
          click: () => win.webContents.send('menu-search') 
        },
        { type: 'separator' },
        { 
          label: 'Export Data', 
          click: () => win.webContents.send('menu-export') 
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/devtasks')
          }
        },
        {
          label: 'Donate',
          click: async () => {
            await shell.openExternal('https://buymeacoffee.com/yourusername')
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// ==========================================
// IPC HANDLERS
// ==========================================

// --- 1. Projects ---

ipcMain.handle('select-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

ipcMain.handle('open-project', (event, folderPath) => {
  let project = db.prepare('SELECT * FROM projects WHERE path = ?').get(folderPath);
  if (!project) {
    const folderName = require('path').basename(folderPath);
    const info = db.prepare('INSERT INTO projects (name, path, color) VALUES (?, ?, ?)').run(folderName, folderPath, '#3b82f6');
    project = { id: info.lastInsertRowid, name: folderName, path: folderPath, color: '#3b82f6' };
  }
  return project;
});

ipcMain.handle('get-recent-projects', () => {
  return db.prepare('SELECT * FROM projects WHERE path IS NOT NULL ORDER BY id DESC LIMIT 5').all();
});


// --- 2. Tasks ---

ipcMain.handle('get-tasks', (event, projectId) => {
  if (!projectId) return [];
  const sql = `
    SELECT 
      tasks.*, 
      COALESCE((SELECT SUM(duration_seconds) FROM time_logs WHERE task_id = tasks.id), 0) as total_logged,
      (SELECT COUNT(*) FROM subtasks WHERE task_id = tasks.id) as total_subtasks,
      (SELECT COUNT(*) FROM subtasks WHERE task_id = tasks.id AND is_completed = 1) as completed_subtasks
    FROM tasks 
    WHERE project_id = ? 
    ORDER BY created_at DESC
  `;
  return db.prepare(sql).all(projectId);
});

ipcMain.handle('add-task', (event, data) => {
  const stmt = db.prepare(`
    INSERT INTO tasks (
      project_id, title, description, status, priority, 
      category, due_date, estimated_hours, local_path
    ) 
    VALUES (
      @projectId, @title, @description, @status, @priority, 
      @category, @dueDate, @estimatedHours, @localPath
    )
  `);
  
  const info = stmt.run({ 
    projectId: data.projectId, 
    title: data.title, 
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    category: data.category || 'feature',
    dueDate: data.dueDate || null,
    estimatedHours: data.estimatedHours || 0,
    localPath: data.localPath || null
  });

  const taskId = info.lastInsertRowid;

  if (data.tags && Array.isArray(data.tags)) {
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTagId = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)');

    for (const tagName of data.tags) {
      const cleanName = tagName.trim();
      if (!cleanName) continue;
      insertTag.run(cleanName);
      const tag = getTagId.get(cleanName);
      if (tag) {
        try { linkTag.run(taskId, tag.id); } catch(e) {}
      }
    }
  }

  return { 
    id: taskId, ...data,
    total_subtasks: 0, completed_subtasks: 0, total_logged: 0 
  };
});

ipcMain.handle('update-task', (event, task) => {
  const { id, title, description, status, priority, category, due_date, estimated_hours, local_path } = task;
  const stmt = db.prepare(`
    UPDATE tasks 
    SET title = @title, description = @description, status = @status, 
        priority = @priority, category = @category, due_date = @due_date,
        estimated_hours = @estimated_hours, local_path = @local_path
    WHERE id = @id
  `);
  stmt.run({ id, title, description, status, priority, category, due_date, estimated_hours, local_path });
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
});

ipcMain.handle('delete-task', (event, id) => {
  db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id); 
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return true;
});


// --- 3. Search ---

ipcMain.handle('search-all', (event, { projectId, searchTerm }) => {
  if (!projectId || !searchTerm) return [];
  const likeQuery = `%${searchTerm}%`;
  const sql = `
    SELECT id, title, 'task' as type, NULL as parent_title, id as task_id_to_open 
    FROM tasks WHERE project_id = ? AND LOWER(title) LIKE LOWER(?)
    UNION ALL
    SELECT s.id, s.title, 'subtask' as type, t.title as parent_title, t.id as task_id_to_open 
    FROM subtasks s JOIN tasks t ON s.task_id = t.id
    WHERE t.project_id = ? AND LOWER(s.title) LIKE LOWER(?)
    LIMIT 10
  `;
  return db.prepare(sql).all(projectId, likeQuery, projectId, likeQuery);
});


// --- 4. Subtasks ---

ipcMain.handle('get-subtasks', (event, taskId) => {
  return db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at ASC').all(taskId);
});

ipcMain.handle('add-subtask', (event, { taskId, title }) => {
  const stmt = db.prepare('INSERT INTO subtasks (task_id, title) VALUES (@taskId, @title)');
  const info = stmt.run({ taskId, title });
  return { id: info.lastInsertRowid, task_id: taskId, title, is_completed: 0 };
});

ipcMain.handle('toggle-subtask', (event, { id, isCompleted }) => {
  const val = isCompleted ? 1 : 0;
  db.prepare('UPDATE subtasks SET is_completed = ? WHERE id = ?').run(val, id);
  return true;
});

ipcMain.handle('delete-subtask', (event, id) => {
  db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
  return true;
});


// --- 5. Tags ---

ipcMain.handle('get-tags', () => {
  return db.prepare('SELECT * FROM tags').all();
});

ipcMain.handle('create-tag', (event, name) => {
  try {
    const stmt = db.prepare('INSERT INTO tags (name) VALUES (@name)');
    const info = stmt.run({ name });
    return { id: info.lastInsertRowid, name, color: '#007acc' };
  } catch (err) {
    return db.prepare('SELECT * FROM tags WHERE name = ?').get(name);
  }
});

ipcMain.handle('add-task-tag', (event, { taskId, tagId }) => {
  try {
    db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
    return true;
  } catch (e) { return false; }
});

ipcMain.handle('remove-task-tag', (event, { taskId, tagId }) => {
  db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId);
  return true;
});

ipcMain.handle('get-task-tags', (event, taskId) => {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN task_tags tt ON t.id = tt.tag_id
    WHERE tt.task_id = ?
  `).all(taskId);
});


// --- 6. Git & Timer ---

ipcMain.handle('get-git-info', async (event, folderPath) => {
  if (!folderPath) return null;
  try {
    const git = simpleGit(folderPath);
    const status = await git.status();
    const branch = await git.branch();
    return { branch: branch.current, changed: status.files.length };
  } catch (e) {
    return { error: 'Not a git repo' };
  }
});

ipcMain.handle('start-timer', (event, taskId) => {
  const now = new Date().toISOString();
  db.prepare('UPDATE tasks SET timer_start = ? WHERE id = ?').run(now, taskId);
  return now;
});

ipcMain.handle('stop-timer', (event, taskId) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!task || !task.timer_start) return null;
  const end = new Date();
  const start = new Date(task.timer_start);
  const duration = Math.round((end - start) / 1000);
  db.prepare(`
    INSERT INTO time_logs (task_id, start_time, end_time, duration_seconds)
    VALUES (?, ?, ?, ?)
  `).run(taskId, task.timer_start, end.toISOString(), duration);
  db.prepare('UPDATE tasks SET timer_start = NULL WHERE id = ?').run(taskId);
  return true;
});

ipcMain.handle('get-time-logs', (event, taskId) => {
  return db.prepare('SELECT * FROM time_logs WHERE task_id = ? ORDER BY start_time DESC').all(taskId);
});


// --- 7. Data Management ---

ipcMain.handle('export-data', async () => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Export Data', defaultPath: 'devtasks-export.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (!filePath) return false;
  const data = {
    version: 1, date: new Date().toISOString(),
    projects: db.prepare('SELECT * FROM projects').all(),
    tasks: db.prepare('SELECT * FROM tasks').all(),
    subtasks: db.prepare('SELECT * FROM subtasks').all(),
    tags: db.prepare('SELECT * FROM tags').all(),
    task_tags: db.prepare('SELECT * FROM task_tags').all(),
    time_logs: db.prepare('SELECT * FROM time_logs').all()
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return true;
});

ipcMain.handle('import-data', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Import Data', filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (!filePaths || filePaths.length === 0) return false;
  const raw = fs.readFileSync(filePaths[0], 'utf-8');
  const data = JSON.parse(raw);
  const importTransaction = db.transaction((data) => {
    db.prepare('DELETE FROM task_tags').run();
    db.prepare('DELETE FROM subtasks').run();
    db.prepare('DELETE FROM time_logs').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM projects').run();
    db.prepare('DELETE FROM tags').run();
    const insertProject = db.prepare('INSERT INTO projects (id, name, color, created_at) VALUES (@id, @name, @color, @created_at)');
    (data.projects || []).forEach(p => insertProject.run(p));
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, status, priority, category, due_date, estimated_hours, created_at, local_path, timer_start) 
      VALUES (@id, @project_id, @title, @description, @status, @priority, @category, @due_date, @estimated_hours, @created_at, @local_path, @timer_start)
    `);
    (data.tasks || []).forEach(t => insertTask.run(t));
    const insertSub = db.prepare('INSERT INTO subtasks (id, task_id, title, is_completed, created_at) VALUES (@id, @task_id, @title, @is_completed, @created_at)');
    (data.subtasks || []).forEach(s => insertSub.run(s));
    const insertTag = db.prepare('INSERT INTO tags (id, name, color) VALUES (@id, @name, @color)');
    (data.tags || []).forEach(t => insertTag.run(t));
    const insertTaskTag = db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (@task_id, @tag_id)');
    (data.task_tags || []).forEach(tt => insertTaskTag.run(tt));
    const insertLog = db.prepare('INSERT INTO time_logs (id, task_id, start_time, end_time, duration_seconds, created_at) VALUES (@id, @task_id, @start_time, @end_time, @duration_seconds, @created_at)');
    (data.time_logs || []).forEach(l => insertLog.run(l));
  });
  try {
    importTransaction(data);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('backup-db', async () => {
  const userDataPath = app.getPath('userData');
  const dbPath = require('path').join(userDataPath, 'devtasks.sqlite');
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Database Backup', defaultPath: 'devtasks-backup.sqlite',
    filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }]
  });
  if (!filePath) return false;
  try {
    await db.backup(filePath);
    return true;
  } catch (err) {
    return false;
  }
});

// --- 8. Email / Community ---
ipcMain.handle('submit-email', async (event, email) => {
  const axios = require('axios');
  const ENDPOINT = 'https://formspree.io/f/YOUR_ID_HERE'; // <--- Put your ID here
  try {
    await axios.post(ENDPOINT, { email, source: 'desktop-app' });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});