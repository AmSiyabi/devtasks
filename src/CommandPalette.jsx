import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, FileText, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

export default function CommandPalette({ isOpen, onClose, onSelect, projectId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;

    const handler = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        window.api.searchAll({ projectId, searchTerm }).then(data => {
          setResults(data);
          setSelectedIndex(0);
        });
      } else {
        setResults([]);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, projectId, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelect]);


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center pt-20"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#202023] border border-[#3f3f46] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Area */}
        <div className="flex items-center gap-3 p-4 border-b border-[#3f3f46]">
          <Search size={20} className="text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tasks and subtasks..."
            className="w-full bg-transparent text-lg text-gray-200 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => onSelect(item)}
                className={clsx(
                  "flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer",
                  index === selectedIndex && "bg-blue-500/20"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.type === 'task' 
                    ? <FileText size={16} className="text-gray-500 flex-shrink-0" />
                    : <CheckSquare size={16} className="text-gray-500 flex-shrink-0" />
                  }
                  <div className="overflow-hidden">
                    <div className={clsx("truncate", index === selectedIndex ? "text-blue-300" : "text-gray-200")}>
                      {item.title}
                    </div>
                    {item.type === 'subtask' && (
                      <div className="text-xs text-gray-500 truncate">
                        in: {item.parent_title}
                      </div>
                    )}
                  </div>
                </div>

                {index === selectedIndex && <CornerDownLeft size={16} className="text-gray-500" />}
              </div>
            ))
          ) : (
             <div className="text-center text-gray-500 p-8 text-sm">
               {searchTerm.length > 1 ? "No results found." : "Start typing to search..."}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}