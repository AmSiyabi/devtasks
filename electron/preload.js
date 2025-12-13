const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openProject: (path) => ipcRenderer.invoke('open-project', path),
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),
  
  getTasks: (projectId) => ipcRenderer.invoke('get-tasks', projectId),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  updateTask: (task) => ipcRenderer.invoke('update-task', task),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  
  // Subtasks
  getSubtasks: (taskId) => ipcRenderer.invoke('get-subtasks', taskId),
  addSubtask: (data) => ipcRenderer.invoke('add-subtask', data),
  toggleSubtask: (data) => ipcRenderer.invoke('toggle-subtask', data),
  deleteSubtask: (id) => ipcRenderer.invoke('delete-subtask', id),

  getTags: () => ipcRenderer.invoke('get-tags'),
  createTag: (name) => ipcRenderer.invoke('create-tag', name),
  addTaskTag: (data) => ipcRenderer.invoke('add-task-tag', data),
  removeTaskTag: (data) => ipcRenderer.invoke('remove-task-tag', data),
  getTaskTags: (taskId) => ipcRenderer.invoke('get-task-tags', taskId),

  getGitInfo: (path) => ipcRenderer.invoke('get-git-info', path),
  startTimer: (taskId) => ipcRenderer.invoke('start-timer', taskId),
  stopTimer: (taskId) => ipcRenderer.invoke('stop-timer', taskId),
  getTimeLogs: (taskId) => ipcRenderer.invoke('get-time-logs', taskId),

  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  backupDB: () => ipcRenderer.invoke('backup-db'),

  onMenuNewTask: (callback) => ipcRenderer.on('menu-new-task', callback),
  onMenuSearch: (callback) => ipcRenderer.on('menu-search', callback),
  onMenuOpenProject: (callback) => ipcRenderer.on('menu-open-project', callback),
  onMenuCloseProject: (callback) => ipcRenderer.on('menu-close-project', callback),
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),

  searchAll: (params) => ipcRenderer.invoke('search-all', params),

  submitEmail: (email) => ipcRenderer.invoke('submit-email', email),
});