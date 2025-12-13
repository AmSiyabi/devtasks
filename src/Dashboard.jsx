import React from 'react';
import { CheckCircle2, AlertCircle, Clock, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ tasks, project }) {
  // Stats Calculations
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const categories = ['feature', 'bug', 'refactor', 'devops'];
  const catStats = categories.map(c => ({
    name: c, count: tasks.filter(t => t.category === c).length
  }));
  const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;

  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-xl flex flex-col items-center justify-center text-center transition-colors">
      <div className={clsx("p-3 rounded-full mb-3 bg-opacity-10", color)}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('/10', '')} />
      </div>
      <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
      <div className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider">{label}</div>
      {subtext && <div className="text-xs text-[var(--text-secondary)] mt-2 opacity-80">{subtext}</div>}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] p-8 custom-scrollbar transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Project Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Overview for <span className="text-blue-400 font-mono">{project.name}</span></p>
        </div>

        {/* Top Row: Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard icon={BarChart3} label="Total Tasks" value={total} color="bg-blue-500/10 text-blue-500" />
          <StatCard icon={Clock} label="In Progress" value={inProgress} color="bg-yellow-500/10 text-yellow-500" />
          <StatCard icon={CheckCircle2} label="Completed" value={done} color="bg-green-500/10 text-green-500" />
          <StatCard icon={AlertCircle} label="High Priority" value={highPriority} color="bg-red-500/10 text-red-500" subtext={`${Math.round((highPriority/total)*100 || 0)}% of workload`} />
        </div>

        {/* Progress Bar */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 mb-8 transition-colors">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Overall Progress</h3>
              <p className="text-sm text-[var(--text-secondary)]">Based on task status</p>
            </div>
            <div className="text-4xl font-bold text-blue-500">{progress}%</div>
          </div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Split Row */}
        <div className="grid grid-cols-2 gap-8">
          {/* Categories */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 transition-colors">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-6">Task Categories</h3>
            <div className="space-y-4">
              {catStats.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-[var(--text-primary)]">{cat.name}</span>
                    <span className="text-[var(--text-secondary)]">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--text-secondary)] opacity-50" style={{ width: `${(cat.count / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Text Stat */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors">
             <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
               <CheckCircle2 size={32} />
             </div>
             <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
               {todo === 0 && total > 0 ? "All Clear!" : `${todo} Tasks Remaining`}
             </h3>
             <p className="text-[var(--text-secondary)] text-sm max-w-xs">
               {todo === 0 && total > 0 ? "Great job! You've completed all tasks." : "Keep pushing. Focus on high priority items first."}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}