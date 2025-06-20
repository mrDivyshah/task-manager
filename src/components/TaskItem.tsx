
"use client";

import { Pencil, Trash2, GripVertical, Tag, Zap, Clock, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task, Team } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import useLocalStorage from "@/hooks/useLocalStorage";
import React from "react";


interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, targetTaskId: string) => void;
  isDragging?: boolean;
}

export function TaskItem({ task, onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragging }: TaskItemProps) {
  const [teams] = useLocalStorage<Team[]>("taskflow-teams", []);
  
  const assignedTeam = React.useMemo(() => {
    if (!task.teamId) return null;
    return teams.find(team => team.id === task.teamId);
  }, [task.teamId, teams]);

  const priorityColors = {
    high: "bg-red-500/20 text-red-700 border-red-500/50 dark:text-red-400 dark:border-red-500/70",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50 dark:text-yellow-400 dark:border-yellow-500/70",
    low: "bg-green-500/20 text-green-700 border-green-500/50 dark:text-green-400 dark:border-green-500/70",
    default: "bg-muted text-muted-foreground border-border",
  };
  
  const getPriorityColor = (priority?: string) => {
    if (!priority) return priorityColors.default;
    const p = priority.toLowerCase();
    if (p === 'high') return priorityColors.high;
    if (p === 'medium') return priorityColors.medium;
    if (p === 'low') return priorityColors.low;
    return priorityColors.default;
  }

  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
      className={cn(
        "w-full shadow-lg rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl bg-card animate-subtle-appear",
        isDragging ? "opacity-50 ring-2 ring-primary" : "opacity-100",
      )}
      style={{ animationDelay: `${Math.random() * 0.2}s`}} // Stagger animation
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <CardTitle className="font-headline text-xl mb-1 break-all">{task.title}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary cursor-grab p-1 h-8 w-8" aria-label="Drag to reorder">
          <GripVertical size={20} />
        </Button>
      </CardHeader>
      <CardContent className="pb-4">
        {task.notes && (
          <CardDescription className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
            {task.notes}
          </CardDescription>
        )}
        {(task.category || task.priority || assignedTeam) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {task.category && (
              <Badge variant="secondary" className="text-xs py-1 px-2.5 rounded-full bg-accent/10 text-accent-foreground border-accent/30">
                <Tag size={14} className="mr-1.5 text-accent" />
                {task.category}
              </Badge>
            )}
            {task.priority && (
              <Badge variant="outline" className={cn("text-xs py-1 px-2.5 rounded-full", getPriorityColor(task.priority))}>
                <Zap size={14} className="mr-1.5" />
                Priority: {task.priority}
              </Badge>
            )}
            {assignedTeam && (
              <Badge variant="outline" className="text-xs py-1 px-2.5 rounded-full border-primary/50 bg-primary/10 text-primary-foreground">
                <Users size={14} className="mr-1.5 text-primary" />
                Team: {assignedTeam.name}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 border-t border-border/50">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)} aria-label={`Edit task ${task.title}`}>
          <Pencil size={16} className="mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => onDelete(task.id)} aria-label={`Delete task ${task.title}`}>
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}

