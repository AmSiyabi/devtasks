import React from 'react';
import { 
  X, Moon, Sun, Download, Upload, Database, 
  Heart, Github, Keyboard, Mail
} from 'lucide-react';
import clsx from 'clsx';

export default function Settings({ onClose, theme, setTheme, onOpenShortcuts }) {
  
  const handleExport = async () => {
    await window.api.exportData();
    alert('Data exported successfully!');
  };

  const handleImport = async () => {
    if (!confirm('WARNING: This will overwrite all current data. Continue?')) return;
    const res = await window.api.importData();
    if (res.success) window.location.reload();
  };

  const handleBackup = async () => {
    await window.api.backupDB();
    alert('Database backup saved!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Appearance Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Appearance</h3>
            <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              {['light', 'dark'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                    theme === mode 
                      ? "bg-[var(--bg-main)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {mode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </section>

          {/* General Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">General</h3>
            <div 
              onClick={onOpenShortcuts}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-md"><Keyboard size={18}/></div>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">Keyboard Shortcuts</div>
                  <div className="text-xs text-[var(--text-secondary)]">View list of hotkeys</div>
                </div>
              </div>
              <span className="text-xs font-mono bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 py-1 rounded text-[var(--text-secondary)]">?</span>
            </div>
          </section>

          {/* Data Management Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Data Management</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md"><Download size={18}/></div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Export Data</div>
                    <div className="text-xs text-[var(--text-secondary)]">Save tasks to JSON</div>
                  </div>
                </div>
                <button onClick={handleExport} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md hover:border-blue-500 transition-colors">Export</button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-md"><Upload size={18}/></div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Import Data</div>
                    <div className="text-xs text-[var(--text-secondary)]">Restore from JSON</div>
                  </div>
                </div>
                <button onClick={handleImport} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md hover:border-purple-500 transition-colors">Import</button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-md"><Database size={18}/></div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">Backup Database</div>
                    <div className="text-xs text-[var(--text-secondary)]">Save raw .sqlite file</div>
                  </div>
                </div>
                <button onClick={handleBackup} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md hover:border-green-500 transition-colors">Backup</button>
              </div>
            </div>
          </section>

          {/* Community Section (NEW) */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Community</h3>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md"><Mail size={20}/></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Stay Updated</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">
                    Get the latest changelogs, tips, and exclusive offers for the upcoming Premium version.
                  </p>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const email = e.target.elements.email.value;
                      if(!email) return;
                      const res = await window.api.submitEmail(email);
                      if(res.success) alert("Thanks for subscribing!");
                      else alert("Error subscribing. Please try again.");
                      e.target.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      name="email"
                      type="email" 
                      placeholder="your@email.com" 
                      className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-blue-500 outline-none"
                    />
                    <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors">
                      Join
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Support & About</h3>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://github.com/your-repo" 
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group"
              >
                <Github size={24} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] mb-2"/>
                <span className="text-sm font-medium text-[var(--text-primary)]">GitHub</span>
              </a>
              <a 
                href="https://buymeacoffee.com/aiasiyabi" 
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--border-color)] bg-pink-500/5 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all cursor-pointer group"
              >
                <Heart size={24} className="text-pink-500 mb-2"/>
                <span className="text-sm font-medium text-[var(--text-primary)]">Donate</span>
              </a>
            </div>
            <div className="mt-6 text-center">
               <p className="text-xs text-[var(--text-secondary)]">DevTasks v1.0.0 • Built for Developers</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}