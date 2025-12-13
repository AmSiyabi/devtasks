import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Tag, Folder, AlignLeft } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    estimatedHours: '',
    tags: '',
    localPath: ''
  });

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // EDIT MODE: Populate fields
        setFormData({
          id: initialData.id, // Keep ID for update logic
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'feature',
          priority: initialData.priority || 'medium',
          status: initialData.status || 'todo',
          dueDate: initialData.due_date ? initialData.due_date.split('T')[0] : '', // Format date for input
          estimatedHours: initialData.estimated_hours || '',
          tags: initialData.tags ? initialData.tags.join(', ') : '', // You might need to fetch tags separately if not in task object
          localPath: initialData.local_path || ''
        });
      } else {
        // CREATE MODE: Reset
        setFormData({
          title: '', description: '', category: 'feature', priority: 'medium',
          status: 'todo', dueDate: '', estimatedHours: '', tags: '', localPath: ''
        });
      }
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Process tags
    const processedTags = formData.tags && typeof formData.tags === 'string' 
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t) 
      : [];

    onSave({
      ...formData,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      tags: processedTags
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-[#202023]">
          <h2 className="text-lg font-semibold text-gray-200">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-md hover:bg-[#27272a]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
              <input ref={titleInputRef} name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Fix login page styling" className="w-full bg-[#27272a] border border-[#3f3f46] text-white text-lg rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-600" required />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider"><AlignLeft size={12}/> Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add details..." className="w-full h-32 bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none font-sans" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none appearance-none">
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                  <option value="refactor">Refactor</option>
                  <option value="research">Research</option>
                  <option value="devops">DevOps</option>
                  <option value="testing">Testing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none appearance-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none appearance-none">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider"><Calendar size={12}/> Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider"><Clock size={12}/> Est. Hours</label>
                <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} placeholder="0.0" step="0.5" min="0" className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider"><Folder size={12}/> Git/Local Path</label>
              <input name="localPath" value={formData.localPath} onChange={handleChange} placeholder="Optional override path..." className="w-full bg-[#27272a] border border-[#3f3f46] text-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 outline-none font-mono text-sm" />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-[#27272a] bg-[#202023] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#27272a] transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">{initialData ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </div>
    </div>
  );
}