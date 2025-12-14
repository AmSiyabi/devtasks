import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, CheckSquare, Square, List, Layout,
  Tag, X, Play, Square as StopSquare, GitBranch, Folder,
  Settings as SettingsIcon, ChevronRight, PanelLeft, PanelLeftClose,
  ArrowLeft, Search, Filter, BarChart2, Edit3, Calendar, Clock, ChevronDown,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import KanbanBoard from './KanbanBoard';
import Settings from './Settings';
import ProjectLauncher from './ProjectLauncher';
import CommandPalette from './CommandPalette';
import FilterPanel from './FilterPanel';
import TaskModal from './TaskModal';
import Dashboard from './Dashboard';
import ShortcutsModal from './ShortcutsModal';
import WelcomeScreen from './WelcomeScreen';
import Editor from './Editor'; // <--- NEW IMPORT

function App() {
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('onboardingComplete'));
  const [currentProject, setCurrentProject] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('devtasks-theme') || 'dark');

  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [taskTags, setTaskTags] = useState([]);
  const [gitInfo, setGitInfo] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const timerRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (theme === 'light') { document.body.classList.add('light-mode'); } 
    else { document.body.classList.remove('light-mode'); }
    localStorage.setItem('devtasks-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentProject) {
      loadTasks();
      checkGitInfo(currentProject.path);
    }
  }, [currentProject]);

  useEffect(() => {
    if (activeTaskId) {
      loadSubtasks(activeTaskId);
      loadTaskTags(activeTaskId);
      if (activeTask?.local_path) checkGitInfo(activeTask.local_path);
      calculateElapsed(activeTask);
    } else if (currentProject) {
      checkGitInfo(currentProject.path);
    }
  }, [activeTaskId]);

  useEffect(() => {
    if (activeTask?.timer_start) {
      timerRef.current = setInterval(() => calculateElapsed(activeTask), 1000);
    } else if (activeTask) {
      setElapsed(activeTask.total_logged || 0);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeTask?.timer_start, activeTask?.total_logged]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      // Allow shortcuts even in editor, but carefully
      if (document.querySelector('.ProseMirror-focused') && e.key !== 'Escape') {
         // If typing in editor, usually ignore general shortcuts unless ctrl modifiers
         if (!e.ctrlKey && !e.metaKey) return; 
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleCreateTask(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); setShowSettings(true); return; }
      if (isInput) return;
      if (e.key === '?') { e.preventDefault(); setIsShortcutsOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- HELPERS ---
  const loadTasks = async () => { if (!currentProject) return; setTasks(await window.api.getTasks(currentProject.id)); };
  const loadSubtasks = async (taskId) => setSubtasks(await window.api.getSubtasks(taskId));
  const loadTaskTags = async (taskId) => setTaskTags(await window.api.getTaskTags(taskId));
  const checkGitInfo = async (path) => { setGitInfo(null); if (path) setGitInfo(await window.api.getGitInfo(path)); };
  
  const calculateElapsed = (task) => {
    if (!task) return;
    const base = task.total_logged || 0;
    setElapsed(task.timer_start ? base + Math.floor((new Date() - new Date(task.timer_start)) / 1000) : base);
  };
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date().setHours(0,0,0,0);
  };
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'bug': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'feature': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'refactor': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'devops': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'testing': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]';
    }
  };

  const getFilteredTasks = () => {
    let result = [...tasks];
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter);
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'priority') {
        const weight = { critical: 4, high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      return 0;
    });
    return result;
  };
  const filteredTasks = getFilteredTasks();

  // --- HANDLERS ---
  const handleOnboardingComplete = () => { localStorage.setItem('onboardingComplete', 'true'); setShowWelcome(false); };
  const handleCreateTask = () => { setTaskToEdit(null); setIsTaskModalOpen(true); };
  const handleEditTask = () => { if(activeTask) { setTaskToEdit(activeTask); setIsTaskModalOpen(true); } };
  
  const handleSaveTask = async (taskData) => {
    if (!currentProject) return;
    if (taskData.id) {
        const updatedTask = await window.api.updateTask({ ...taskData, due_date: taskData.dueDate, estimated_hours: taskData.estimatedHours, local_path: taskData.localPath });
        setTasks(tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
        if (activeTaskId === updatedTask.id) loadTaskTags(updatedTask.id);
    } else {
        const newTask = await window.api.addTask({ projectId: currentProject.id, ...taskData, localPath: taskData.localPath || currentProject.path });
        setTasks([newTask, ...tasks]);
        setActiveTaskId(newTask.id);
        if (newTask.id) loadTaskTags(newTask.id);
    }
  };

  const handleUpdateTask = async (field, value) => {
    if (!activeTask) return;
    const updated = { ...activeTask, [field]: value };
    setTasks(tasks.map(t => t.id === activeTaskId ? updated : t));
    await window.api.updateTask(updated);
  };
  const handleDeleteTask = async (e, id) => { e.stopPropagation(); await window.api.deleteTask(id); if (activeTaskId === id) setActiveTaskId(null); loadTasks(); };
  const handleTaskMove = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      const updated = { ...task, status: newStatus };
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      await window.api.updateTask(updated);
      loadTasks();
    }
  };
  const handleToggleTimer = async () => {
    if (activeTask.timer_start) await window.api.stopTimer(activeTask.id);
    else await window.api.startTimer(activeTask.id);
    loadTasks();
  };
  const handleAddTag = async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const tag = await window.api.createTag(e.target.value.trim());
      await window.api.addTaskTag({ taskId: activeTaskId, tagId: tag.id });
      loadTaskTags(activeTaskId);
      e.target.value = '';
    }
  };
  const handleRemoveTag = async (tagId) => { await window.api.removeTaskTag({ taskId: activeTaskId, tagId }); loadTaskTags(activeTaskId); };
  const handleAddSubtask = async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      await window.api.addSubtask({ taskId: activeTaskId, title: e.target.value.trim() });
      loadSubtasks(activeTaskId); loadTasks(); e.target.value = '';
    }
  };
  const handleToggleSubtask = async (sub) => { await window.api.toggleSubtask({ id: sub.id, isCompleted: !sub.is_completed }); loadSubtasks(activeTaskId); loadTasks(); };
  const handleDeleteSubtask = async (id) => { await window.api.deleteSubtask(id); loadSubtasks(activeTaskId); loadTasks(); };
  const handleUpdatePath = async (e) => { const path = e.target.value; handleUpdateTask('local_path', path); checkGitInfo(path); };
  const handleSearchResultSelect = (result) => { setActiveTaskId(result.task_id_to_open); setIsCommandPaletteOpen(false); setViewMode('list'); };

  if (showWelcome) return <WelcomeScreen onComplete={handleOnboardingComplete} />;
  if (!currentProject) return <ProjectLauncher onProjectSelect={setCurrentProject} />;

  return (
    <div className="flex h-screen text-sm font-sans bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300">
      
      {/* 1. ACTIVITY BAR */}
      <div className="w-[50px] bg-[var(--bg-main)] border-r border-[var(--border-color)] flex flex-col items-center py-4 z-20 flex-none">
        <div className="flex flex-col gap-4">
          <button onClick={() => setCurrentProject(null)} className="p-2 rounded-lg text-blue-400 hover:bg-[var(--bg-secondary)] mb-2"><ArrowLeft size={20} /></button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"><PanelLeftClose size={20} /></button>
          <div className="w-8 h-[1px] bg-[var(--border-color)]" />
          <button onClick={() => setViewMode('list')} className={clsx("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-[var(--bg-secondary)] text-blue-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]")}><List size={20} /></button>
          <button onClick={() => setViewMode('board')} className={clsx("p-2 rounded-lg transition-all", viewMode === 'board' ? "bg-[var(--bg-secondary)] text-blue-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]")}><Layout size={20} /></button>
          <button onClick={() => setViewMode('dashboard')} className={clsx("p-2 rounded-lg transition-all", viewMode === 'dashboard' ? "bg-[var(--bg-secondary)] text-blue-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]")}><BarChart2 size={20} /></button>
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowSettings(true)} className="p-2 mb-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"><SettingsIcon size={20} /></button>
      </div>

      {/* VIEW SWITCHER */}
      {viewMode === 'dashboard' ? (
        <Dashboard tasks={tasks} project={currentProject} />
      ) : (
        <>
          {/* SIDEBAR TASK LIST */}
          <div className={clsx("flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-300 overflow-hidden", isSidebarOpen ? (viewMode === 'list' ? "w-80 flex-none" : "flex-1 min-w-0") : "w-0 border-r-0")}>
            {viewMode === 'list' ? (
              <>
                <div className="h-14 px-4 border-b border-[var(--border-color)] flex items-center justify-between flex-none min-w-[320px]">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-[var(--text-primary)] tracking-wide truncate">{currentProject.name}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono truncate">{currentProject.path}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={clsx("p-1.5 rounded-md transition-colors", (isFilterOpen || priorityFilter !== 'all' || categoryFilter !== 'all') ? "text-blue-400 bg-blue-400/10" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-blue-400")}><Filter size={16} /></button>
                    <button onClick={() => setIsCommandPaletteOpen(true)} className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-blue-400 transition-colors"><Search size={16} /></button>
                    <button onClick={handleCreateTask} className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-blue-400 transition-colors flex-shrink-0"><Plus size={18} /></button>
                  </div>
                </div>

                {isFilterOpen && (
                  <FilterPanel 
                    priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                    categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                    sortBy={sortBy} setSortBy={setSortBy} onClose={() => setIsFilterOpen(false)}
                  />
                )}
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-w-[320px]">
                  {filteredTasks.length === 0 && (
                    <div className="p-4 text-center text-[var(--text-secondary)] text-xs mt-10">
                      {tasks.length === 0 ? "No tasks in this project." : "No tasks match your filters."}
                    </div>
                  )}
                  {filteredTasks.map(task => {
                    const progress = task.total_subtasks > 0 ? Math.round((task.completed_subtasks / task.total_subtasks) * 100) : 0;
                    return (
                      <div key={task.id} onClick={() => setActiveTaskId(task.id)} className={clsx("px-3 py-3 rounded-md cursor-pointer flex flex-col gap-2 group transition-all duration-150 border border-transparent", activeTaskId === task.id ? "bg-[var(--bg-tertiary)] border-[var(--border-color)] shadow-sm" : "hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", task.status === 'done' ? "bg-green-500" : task.status === 'in-progress' ? "bg-blue-500" : "bg-zinc-600")} />
                            <span className={clsx("truncate text-sm font-medium", activeTaskId === task.id ? "text-[var(--text-primary)]" : "")}>{task.title || "Untitled Task"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.timer_start && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                            <ChevronRight size={14} className={clsx("opacity-0 transition-opacity", activeTaskId === task.id ? "opacity-100 text-[var(--text-secondary)]" : "group-hover:opacity-50")} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={clsx("text-[10px] px-1.5 py-0.5 rounded border capitalize font-medium", getCategoryColor(task.category))}>{task.category || 'Feature'}</span>
                            {isOverdue(task) && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                <AlertTriangle size={10} /> OVERDUE
                              </span>
                            )}
                            {task.priority === 'high' && <span className="text-[10px] text-orange-400 font-bold">HIGH</span>}
                            {task.priority === 'critical' && <span className="text-[10px] text-red-500 font-bold">CRITICAL</span>}
                        </div>
                        {task.total_subtasks > 0 && (
                          <div className="w-full flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-[var(--border-color)] rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
                            <span className="text-[10px] text-[var(--text-secondary)] font-mono">{progress}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <button onClick={handleCreateTask} className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all group">
                    <Plus size={16} className="group-hover:scale-110 transition-transform"/>
                    <span className="text-xs font-medium">Create New Task</span>
                  </button>
                </div>
              </>
            ) : (
              <KanbanBoard tasks={filteredTasks} activeTaskId={activeTaskId} onTaskMove={handleTaskMove} onTaskClick={setActiveTaskId} />
            )}
          </div>

          {/* DETAILS PANE */}
          {(activeTask) ? (
            <div className={clsx("flex flex-col bg-[var(--bg-main)] border-l border-[var(--border-color)] shadow-2xl z-10", (viewMode === 'list' || !isSidebarOpen) ? "flex-1 min-w-0" : "w-[600px] flex-none")}>
              
              <div className="h-14 px-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-main)]/95 backdrop-blur flex-none">
                <div className="flex items-center gap-4">
                  <button onClick={handleToggleTimer} className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-all border", activeTask.timer_start ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]")}>
                    {activeTask.timer_start ? <StopSquare size={14} className="animate-pulse" /> : <Play size={14} />}
                    {formatTime(elapsed)}
                  </button>
                  <div className="h-5 w-[1px] bg-[var(--border-color)]"></div>
                  
                  <div className="relative group">
                    <div className="relative flex items-center">
                      <select 
                        value={activeTask.priority} 
                        onChange={(e) => handleUpdateTask('priority', e.target.value)} 
                        className="appearance-none bg-transparent text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer outline-none pr-5 text-right transition-colors"
                      >
                        <option value="low" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Low Priority</option>
                        <option value="medium" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Medium Priority</option>
                        <option value="high" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">High Priority</option>
                        <option value="critical" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Critical</option>
                      </select>
                      {/* Custom Chevron Icon */}
                      <ChevronDown size={12} className="absolute right-0 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)]" title="Toggle Sidebar"><PanelLeft size={18} /></button>
                  <button onClick={handleEditTask} className="p-2 text-[var(--text-secondary)] hover:text-blue-400 rounded-md hover:bg-[var(--bg-secondary)]" title="Edit Details"><Edit3 size={18} /></button>
                  <button onClick={(e) => handleDeleteTask(e, activeTask.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                
                <div className="px-8 pt-6 pb-2 flex-none space-y-4">
                   <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] overflow-x-auto pb-2 scrollbar-hide">
                      <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border-color)]">
                         <Tag size={12} /> <span className="capitalize">{activeTask.category || 'Feature'}</span>
                      </div>
                      
                      {activeTask.due_date && (
                        <div className={clsx("flex items-center gap-1.5 px-2 py-1 rounded border transition-colors", isOverdue(activeTask) ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-[var(--bg-secondary)] border-[var(--border-color)]")}>
                           <Calendar size={12} /> 
                           <span>{new Date(activeTask.due_date).toLocaleDateString()}{isOverdue(activeTask) && " (Overdue)"}</span>
                        </div>
                      )}

                      {activeTask.estimated_hours > 0 && (
                        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border-color)]">
                           <Clock size={12} /> <span>{activeTask.estimated_hours}h</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 group cursor-text">
                         <Folder size={12} className="group-hover:text-blue-400"/> 
                         <input value={activeTask.local_path || ''} onChange={handleUpdatePath} placeholder="Link local folder..." className="bg-transparent outline-none w-32 focus:w-64 transition-all" />
                      </div>
                   </div>

                   {gitInfo && !gitInfo.error && (
                    <div className="inline-flex items-center gap-4 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs">
                      <span className="flex items-center gap-1.5 text-blue-400 font-medium"><GitBranch size={12} /> {gitInfo.branch}</span>
                      <span className="w-[1px] h-3 bg-[var(--text-secondary)] opacity-30"></span>
                      <span className={clsx(gitInfo.changed > 0 ? "text-yellow-500" : "text-gray-400")}>{gitInfo.changed} changes</span>
                    </div>
                  )}
                </div>

                <div className="px-8 pb-6 border-b border-[var(--border-color)] flex-none">
                  <input value={activeTask.title} onChange={(e) => handleUpdateTask('title', e.target.value)} className="text-3xl font-bold bg-transparent outline-none w-full text-[var(--text-primary)] placeholder-[var(--text-secondary)] mb-4 leading-tight" placeholder="Task Title..." />
                  <div className="flex flex-wrap gap-2 items-center">
                    {taskTags.map(tag => (
                      <span key={tag.id} className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/20 flex items-center gap-1.5 transition-colors hover:bg-blue-500/20">
                        {tag.name}
                        <button onClick={() => handleRemoveTag(tag.id)} className="hover:text-[var(--text-primary)]"><X size={12} /></button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-dashed border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors">
                      <Tag size={12} className="text-[var(--text-secondary)]" />
                      <input placeholder="Add tag..." className="bg-transparent outline-none text-xs w-20 text-[var(--text-primary)] placeholder-[var(--text-secondary)]" onKeyDown={handleAddTag} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex min-h-0">
                  <div className="flex-1 border-r border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden">
                      {/* TRUE WYSIWYG EDITOR */}
                      <Editor 
                        content={activeTask.description} 
                        onChange={(val) => handleUpdateTask('description', val)}
                      />
                  </div>
                  
                  <div className="w-72 bg-[var(--bg-secondary)] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-color)] flex-none">
                      <h3 className="font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider flex items-center gap-2"><CheckSquare size={14} /> Subtasks</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {subtasks.map(sub => (
                        <div key={sub.id} className="flex items-start gap-3 p-2 rounded hover:bg-[var(--bg-tertiary)] group transition-colors">
                          <button onClick={() => handleToggleSubtask(sub)} className={clsx("mt-0.5 transition-colors", sub.is_completed ? "text-[var(--text-secondary)]" : "text-blue-500 hover:text-blue-400")}>{sub.is_completed ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                          <span className={clsx("flex-1 text-sm break-words leading-snug", sub.is_completed ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]")}>{sub.title}</span>
                          <button onClick={() => handleDeleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-[var(--border-color)] flex-none bg-[var(--bg-main)]">
                      <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-2 rounded-lg border border-[var(--border-color)] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                         <Plus size={14} className="text-[var(--text-secondary)]" />
                         <input onKeyDown={handleAddSubtask} placeholder="Add step..." className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--bg-tertiary)]">
              <Layout size={64} className="mb-4 opacity-20 text-[var(--text-secondary)]" />
              <p className="text-[var(--text-secondary)] font-medium">Select a task or create a new one</p>
              <button onClick={handleCreateTask} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg">Create New Task</button>
            </div>
          )}
        </>
      )}

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={taskToEdit}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelect={handleSearchResultSelect}
        projectId={currentProject?.id}
      />

      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          theme={theme} 
          setTheme={setTheme} 
          onOpenShortcuts={() => { setShowSettings(false); setIsShortcutsOpen(true); }} 
        />
      )}
      
      {isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}
    </div>
  );
}

export default App;