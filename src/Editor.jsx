import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// FIX: Using named imports for all extensions
import { StarterKit } from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { 
  Bold, Italic, Strikethrough, Code, List, Heading1, Heading2, Heading3, 
  Quote, Undo, Redo, Pilcrow 
} from 'lucide-react';
import clsx from 'clsx';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const IconButton = ({ onClick, isActive, icon: Icon, title, color }) => (
    <button
      onClick={onClick}
      title={title}
      className={clsx(
        "p-1.5 rounded transition-colors",
        isActive 
          ? "bg-blue-500/20 text-blue-400" 
          : "hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
      style={color ? { color } : {}}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-10">
      
      <IconButton icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold" />
      <IconButton icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic" />
      <IconButton icon={Strikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike" />
      <IconButton icon={Code} onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code" />
      
      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />
      
      <IconButton icon={Pilcrow} onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Normal Text" />
      <IconButton icon={Heading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Big Heading" />
      <IconButton icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Medium Heading" />
      <IconButton icon={Heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Small Heading" />
      
      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />
      
      <IconButton icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List" />
      <IconButton icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote" />

      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />

      <div className="flex items-center gap-1.5 ml-1">
        {[
            { color: '#e4e4e7', label: 'Default' },
            { color: '#ef4444', label: 'Red' },
            { color: '#3b82f6', label: 'Blue' },
            { color: '#22c55e', label: 'Green' },
            { color: '#eab308', label: 'Yellow' },
            { color: '#a855f7', label: 'Purple' }
        ].map((c) => (
            <button
                key={c.color}
                onClick={() => editor.chain().focus().setColor(c.color).run()}
                className={clsx(
                    "w-3 h-3 rounded-full hover:scale-125 transition-transform ring-1 ring-transparent hover:ring-[var(--text-primary)]",
                    editor.isActive('textStyle', { color: c.color }) && "ring-[var(--text-primary)] scale-110"
                )}
                style={{ backgroundColor: c.color }}
                title={c.label}
            />
        ))}
      </div>

      <div className="flex-1" />
      
      <IconButton icon={Undo} onClick={() => editor.chain().focus().undo().run()} title="Undo" />
      <IconButton icon={Redo} onClick={() => editor.chain().focus().redo().run()} title="Redo" />
    </div>
  );
};

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Color.configure({ types: ['textStyle'] }),
      TextStyle,
      Link.configure({ openOnClick: false }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true
      }), 
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-4 text-[var(--text-primary)]',
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
       const currentMarkdown = editor.storage.markdown.getMarkdown();
       if (content !== currentMarkdown) {
         editor.commands.setContent(content);
       }
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}