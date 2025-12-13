import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys: ['Ctrl', 'N'], label: 'Create new task' },
    { keys: ['Ctrl', 'K'], label: 'Open command palette' },
    { keys: ['Ctrl', ','], label: 'Open settings' },
    { keys: ['?'], label: 'Show this help menu' },
    { keys: ['Esc'], label: 'Close modal / Clear selection' },
    { keys: ['↑', '↓'], label: 'Navigate search results' },
    { keys: ['Enter'], label: 'Select search result' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="p-2">
          {shortcuts.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group"
            >
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                {item.label}
              </span>
              <div className="flex gap-1.5">
                {item.keys.map((key, kIndex) => (
                  <kbd 
                    key={kIndex}
                    className="min-w-[24px] px-2 py-1 flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-[4px] text-[11px] font-sans font-semibold text-[var(--text-primary)] shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            Pro Tip: You can double-click a task description to edit it instantly.
          </p>
        </div>

      </div>
    </div>
  );
}