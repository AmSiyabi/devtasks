import React from 'react';
import { X } from 'lucide-react';

export default function FilterPanel({ 
  priorityFilter, setPriorityFilter, 
  categoryFilter, setCategoryFilter, // <--- NEW PROPS
  sortBy, setSortBy, 
  onClose 
}) {
  return (
    <div className="bg-[#202023] border-b border-[#27272a] p-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">View Options</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={12}/></button>
      </div>
      
      <div className="flex gap-2">
        {/* Category Filter (NEW) */}
        <div className="flex-1">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#18181b] border border-[#3f3f46] text-gray-300 text-xs rounded px-2 py-1.5 focus:border-blue-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="refactor">Refactor</option>
            <option value="devops">DevOps</option>
            <option value="research">Research</option>
            <option value="testing">Testing</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex-1">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-[#18181b] border border-[#3f3f46] text-gray-300 text-xs rounded px-2 py-1.5 focus:border-blue-500 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex-1">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#18181b] border border-[#3f3f46] text-gray-300 text-xs rounded px-2 py-1.5 focus:border-blue-500 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}