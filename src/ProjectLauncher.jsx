import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Clock, Terminal, ArrowRight } from 'lucide-react';

export default function ProjectLauncher({ onProjectSelect }) {
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    const data = await window.api.getRecentProjects();
    setRecents(data);
  };

  const handleOpenFolder = async () => {
    const path = await window.api.selectFolder();
    if (path) {
      const project = await window.api.openProject(path);
      onProjectSelect(project);
    }
  };

  const handleSelectRecent = async (path) => {
    const project = await window.api.openProject(path);
    onProjectSelect(project);
  };

  return (
    <div className="h-screen bg-[#18181b] text-gray-300 flex items-center justify-center p-8 font-sans">
      <div className="max-w-2xl w-full grid grid-cols-2 gap-12">
        
        {/* Left Col: Actions */}
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-white mb-2 flex items-center gap-3">
              <Terminal size={32} className="text-blue-500"/> DevTasks
            </h1>
            <p className="text-gray-500 text-lg">Project-based task management</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Start</h2>
            
            <button 
              onClick={handleOpenFolder}
              className="w-full text-left group flex items-center gap-3 p-3 -ml-3 rounded-lg hover:bg-[#27272a] transition-colors"
            >
              <div className="text-blue-400 group-hover:scale-110 transition-transform"><FolderOpen size={24}/></div>
              <div>
                <div className="text-blue-400 group-hover:text-blue-300 font-medium">Open Folder</div>
                <div className="text-xs text-gray-500">Open an existing project directory</div>
              </div>
            </button>

            <button 
              onClick={handleOpenFolder} // Same logic for now, creates new entry
              className="w-full text-left group flex items-center gap-3 p-3 -ml-3 rounded-lg hover:bg-[#27272a] transition-colors"
            >
              <div className="text-gray-400 group-hover:scale-110 transition-transform"><Plus size={24}/></div>
              <div>
                <div className="text-gray-300 group-hover:text-white font-medium">Create New Project</div>
                <div className="text-xs text-gray-500">Initialize tracking for a folder</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Col: Recent */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Recent</h2>
          <div className="space-y-1">
            {recents.length > 0 ? (
              recents.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectRecent(p.path)}
                  className="w-full text-left group flex items-center justify-between p-2 -ml-2 rounded hover:bg-[#27272a] text-sm transition-colors"
                >
                  <span className="text-gray-400 group-hover:text-blue-400 truncate w-48">{p.name}</span>
                  <span className="text-[10px] text-gray-600 font-mono truncate max-w-[120px]">{p.path}</span>
                </button>
              ))
            ) : (
              <div className="text-gray-600 italic text-sm py-2">No recent projects</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}