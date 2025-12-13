import React from 'react';
import { Bold, Italic, List, Hash, Code, Type, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export default function MarkdownToolbar({ editorView, isPreview, onTogglePreview }) {
  if (!editorView && !isPreview) return null; // Only render if we have a target or are in preview

  const insertSyntax = (prefix, suffix = '') => {
    if (isPreview || !editorView) return;
    const { state, dispatch } = editorView;
    const range = state.selection.ranges[0];
    const text = state.sliceDoc(range.from, range.to);
    dispatch({
      changes: { from: range.from, to: range.to, insert: `${prefix}${text}${suffix}` },
      selection: { anchor: range.from + prefix.length }
    });
    editorView.focus();
  };

  const insertLinePrefix = (prefix) => {
    if (isPreview || !editorView) return;
    const { state, dispatch } = editorView;
    const line = state.doc.lineAt(state.selection.main.head);
    dispatch({ changes: { from: line.from, to: line.from, insert: prefix } });
    editorView.focus();
  };
  
  const IconButton = ({ icon: Icon, onClick, title, active }) => (
    <button 
      onClick={onClick} 
      title={title}
      disabled={isPreview && title !== "Toggle Preview"}
      className={clsx(
        "p-1.5 rounded transition-colors",
        active ? "bg-blue-500/20 text-blue-400" : "hover:bg-[#3f3f46] text-gray-400 hover:text-white",
        (isPreview && title !== "Toggle Preview") && "opacity-30 cursor-not-allowed"
      )}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-[#27272a] bg-[#202023] justify-between">
      <div className="flex items-center gap-1">
        <IconButton icon={Bold} onClick={() => insertSyntax('**', '**')} title="Bold" />
        <IconButton icon={Italic} onClick={() => insertSyntax('*', '*')} title="Italic" />
        <div className="w-[1px] h-4 bg-[#3f3f46] mx-1" />
        <IconButton icon={Hash} onClick={() => insertLinePrefix('# ')} title="Heading 1" />
        <IconButton icon={Type} onClick={() => insertLinePrefix('## ')} title="Heading 2" />
        <div className="w-[1px] h-4 bg-[#3f3f46] mx-1" />
        <IconButton icon={List} onClick={() => insertLinePrefix('- ')} title="Bullet List" />
        <IconButton icon={Code} onClick={() => insertSyntax('`', '`')} title="Inline Code" />
      </div>

      <div className="border-l border-[#3f3f46] pl-2">
        <IconButton 
          icon={isPreview ? EyeOff : Eye} 
          onClick={onTogglePreview} 
          title="Toggle Preview" 
          active={isPreview}
        />
      </div>
    </div>
  );
}