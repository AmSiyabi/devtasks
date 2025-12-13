import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, useDraggable, useDroppable, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { clsx } from 'clsx';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-zinc-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' }
];

function TaskCard({ task, onClick, isActive, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  if (isDragging && !isOverlay) {
    return <div ref={setNodeRef} style={style} className="opacity-30 h-24 bg-[var(--bg-tertiary)] rounded-lg border border-dashed border-[var(--border-color)] mb-2" />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={clsx(
        "p-3 mb-2 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing group relative select-none transition-colors",
        isOverlay 
          ? "bg-[var(--bg-secondary)] border-blue-500 shadow-xl scale-105 z-50 rotate-2" 
          : "bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:shadow-md",
        isActive && !isOverlay ? "ring-1 ring-blue-500 bg-blue-500/10" : ""
      )}
    >
      <div className="font-medium text-sm text-[var(--text-primary)] mb-2 leading-tight pointer-events-none">{task.title || "Untitled"}</div>
      <div className="flex justify-between items-center mt-2 pointer-events-none">
         <div className={clsx("text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
            task.priority === 'high' ? "bg-red-500/20 text-red-400" :
            task.priority === 'medium' ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"
         )}>
            {task.priority}
         </div>
         {task.total_logged > 0 && <span className="text-[10px] text-[var(--text-secondary)] font-mono">logged</span>}
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, color, tasks, onTaskClick, activeTaskId }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[280px] flex flex-col h-full mx-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] transition-colors">
      <div className="p-3 flex items-center gap-2 border-b border-[var(--border-color)] mb-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider">{title}</h3>
        <span className="ml-auto text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} isActive={activeTaskId === task.id} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskMove, onTaskClick, activeTaskId }) {
  const [activeDragItem, setActiveDragItem] = useState(null);

  const handleDragStart = (event) => {
    setActiveDragItem(event.active.data.current?.task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (over && active.id) onTaskMove(active.id, over.id);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  return (
    <div className="flex-1 flex overflow-x-auto p-6 h-full bg-[var(--bg-main)] transition-colors duration-300">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {COLUMNS.map(col => (
          <DroppableColumn key={col.id} {...col} tasks={tasks.filter(t => t.status === col.id)} onTaskClick={onTaskClick} activeTaskId={activeTaskId} />
        ))}
        
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem && <TaskCard task={activeDragItem} isOverlay />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}