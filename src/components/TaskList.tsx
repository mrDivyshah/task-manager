
"use client";

import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { FileText } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onViewDetails: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  view: 'grid' | 'list';
}

export function TaskList({ tasks, onViewDetails, onDeleteTask, onReorderTasks, onStatusChange, view }: TaskListProps) {
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedItemId(taskId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId); // For firefox compatibility
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetTaskId: string) => {
    event.preventDefault();
    if (!draggedItemId || draggedItemId === targetTaskId) {
      setDraggedItemId(null);
      return;
    }

    const draggedItemIndex = tasks.findIndex(task => task.id === draggedItemId);
    const targetItemIndex = tasks.findIndex(task => task.id === targetTaskId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) {
      setDraggedItemId(null);
      return;
    }

    const newTasks = [...tasks];
    const [draggedItem] = newTasks.splice(draggedItemIndex, 1);
    newTasks.splice(targetItemIndex, 0, draggedItem);
    
    onReorderTasks(newTasks);
    setDraggedItemId(null);
  };


  if (tasks.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
        <FileText size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Tasks Yet!</h3>
        <p className="max-w-sm">
          Looks like your task list is empty. Click the "Add New Task" button to get started and organize your day.
        </p>
      </div>
    );
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    const dayKey = format(new Date(task.createdAt), 'yyyy-MM-dd');
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedGroupKeys = Object.keys(groupedTasks).sort().reverse();

  return (
    <div className="mt-8 space-y-8">
      {sortedGroupKeys.map(dateKey => {
        const groupTasks = groupedTasks[dateKey];
        // By appending T00:00:00, we hint to the parser to treat this as a local date, avoiding timezone shifts.
        const groupDate = new Date(dateKey + 'T00:00:00');
        let groupTitle = '';
        if (isToday(groupDate)) {
          groupTitle = 'Today';
        } else if (isYesterday(groupDate)) {
          groupTitle = 'Yesterday';
        } else {
          groupTitle = format(groupDate, 'MMMM d, yyyy');
        }

        return (
          <div key={dateKey} className="animate-subtle-appear">
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border/50">
              {groupTitle}
            </h2>
            <div className={cn(
              view === 'grid'
                ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            )}>
              {groupTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onViewDetails={onViewDetails}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedItemId === task.id}
                  view={view}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
