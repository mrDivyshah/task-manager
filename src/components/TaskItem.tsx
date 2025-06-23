
"use client";

import { Pencil, Trash2, GripVertical, Tag, Zap, Clock, Users, User, CheckCircle, Circle, MoreHorizontal, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast } from 'date-fns';
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface TaskItemProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, targetTaskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  isDragging?: boolean;
  view: 'grid' | 'list';
}

export function TaskItem({ task, onViewDetails, onDelete, onDragStart, onDragOver, onDrop, onStatusChange, isDragging, view }: TaskItemProps) {
  const [animationDelay, setAnimationDelay] = useState('0s');

  useEffect(() => {
    setAnimationDelay(`${Math.random() * 0.2}s`);
  }, []);
  
  const assignedTeams = task.teams;
  const assignedUsers = task.assignedTo;

  const priorityColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-700 border-red-500/50 dark:text-red-400 dark:border-red-500/70",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50 dark:text-yellow-400 dark:border-yellow-500/70",
    low: "bg-green-500/20 text-green-700 border-green-500/50 dark:text-green-400 dark:border-green-500/70",
    default: "bg-muted text-muted-foreground border-border",
  };
  
  const getPriorityColor = (priority?: string) => {
    if (!priority) return priorityColors.default;
    const p = priority.toLowerCase();
    return priorityColors[p] || priorityColors.default;
  }

  const statusConfig = {
    todo: { label: 'To Do', icon: Circle, color: 'text-muted-foreground' },
    'in-progress': { label: 'In Progress', icon: MoreHorizontal, color: 'text-blue-500' },
    done: { label: 'Done', icon: CheckCircle, color: 'text-green-500' },
  };

  const currentStatusConfig = statusConfig[task.status] || statusConfig.todo;
  const StatusIcon = currentStatusConfig.icon;
  
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };
  
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const hasTime = dueDate && (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0 || dueDate.getSeconds() !== 0);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, [role="combobox"], [role="button"]')) {
      return;
    }
    onViewDetails(task);
  };

  if (view === 'list') {
    return (
      <Card
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, task.id)}
        onClick={handleCardClick}
        className={cn(
          "w-full shadow-md rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 bg-card animate-subtle-appear flex items-center p-3 gap-3 cursor-pointer",
          isDragging ? "opacity-50 ring-2 ring-primary" : "opacity-100",
          task.status === 'done' && 'opacity-60 bg-card/80'
        )}
        style={{ animationDelay }}
      >
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary cursor-grab h-8 w-8 flex-shrink-0" aria-label="Drag to reorder">
          <GripVertical size={20} />
        </Button>
        
        <Select value={task.status} onValueChange={(newStatus: 'todo' | 'in-progress' | 'done') => onStatusChange(task.id, newStatus)}>
          <SelectTrigger className="h-9 w-9 p-0 flex-shrink-0 bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0" aria-label="Change status">
            <SelectValue asChild>
              <StatusIcon className={cn("h-6 w-6", currentStatusConfig.color)} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium truncate", task.status === 'done' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <div className="flex items-center text-xs text-muted-foreground truncate">
            {dueDate ? (
              <div className={cn("flex items-center", isOverdue ? 'text-destructive' : '')}>
                <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span>Due {format(dueDate, hasTime ? 'MMM d, p' : 'MMM d')}</span>
              </div>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 ml-auto flex-shrink-0">
          {assignedTeams && assignedTeams.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs py-0.5 px-2 rounded-full border-primary/50 bg-primary/10 text-primary/80">
                      <Users size={12} className="mr-1" />
                      {assignedTeams.length} {assignedTeams.length > 1 ? 'Teams' : 'Team'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{assignedTeams.map(t => t.name).join(', ')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          )}
          {assignedUsers && assignedUsers.length > 0 && (
            <div className="flex -space-x-2 overflow-hidden">
              {assignedUsers.slice(0, 3).map(user => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-7 w-7 border-2 border-primary/20">
                          <AvatarFallback className="text-xs bg-muted">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assigned to {user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {assignedUsers.length > 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-7 w-7 border-2 border-primary/20">
                          <AvatarFallback className="text-xs bg-muted">
                            +{assignedUsers.length - 3}
                          </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{assignedUsers.slice(3).map(u => u.name).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
  
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} aria-label={`Delete task ${task.title}`}>
            <Trash2 size={14} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
      onClick={handleCardClick}
      className={cn(
        "w-full shadow-lg rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 bg-card animate-subtle-appear flex flex-col cursor-pointer",
        isDragging ? "opacity-50 ring-2 ring-primary" : "opacity-100",
        task.status === 'done' && 'opacity-60 bg-card/80',
      )}
      style={{ animationDelay: animationDelay }}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1">
          <CardTitle className={cn("font-headline text-xl mb-1 break-all", task.status === 'done' && 'line-through text-muted-foreground')}>
            {task.title}
          </CardTitle>
           <div className="flex items-center text-xs text-muted-foreground">
            {dueDate ? (
              <div className={cn("flex items-center", isOverdue ? 'text-destructive font-medium' : '')}>
                <Calendar className="w-3 h-3 mr-1" />
                Due {format(dueDate, hasTime ? "MMMM d, yyyy 'at' p" : "MMMM d, yyyy")}
              </div>
            ) : (
               <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
               </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary cursor-grab p-1 h-8 w-8" aria-label="Drag to reorder">
          <GripVertical size={20} />
        </Button>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        {task.notes && (
          <CardDescription className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
            {task.notes}
          </CardDescription>
        )}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {task.category && (
            <Badge variant="secondary" className="text-xs py-1 px-2.5 rounded-full bg-accent/10 text-accent-foreground border-accent/30">
              <Tag size={14} className="mr-1.5 text-accent" />
              {task.category}
            </Badge>
          )}
          {task.priority && task.priority !== "none" && (
            <Badge variant="outline" className={cn("text-xs py-1 px-2.5 rounded-full", getPriorityColor(task.priority))}>
              <Zap size={14} className="mr-1.5" />
              Priority: {task.priority}
            </Badge>
          )}
          {assignedTeams && assignedTeams.length > 0 && (
            <Badge variant="outline" className="text-xs py-1 px-2.5 rounded-full border-primary/50 bg-primary/10 text-primary-foreground">
              <Users size={14} className="mr-1.5 text-primary" />
              {assignedTeams.map(t => t.name).join(', ')}
            </Badge>
          )}
          {assignedUsers && assignedUsers.length > 0 && (
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {assignedUsers.map(user => (
                    <Avatar key={user.id} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="text-xs bg-muted">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {assignedUsers.length === 1 && <span className="text-sm font-medium text-muted-foreground">{assignedUsers[0].name}</span>}
             </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center gap-2 pt-2 border-t border-border/50 mt-auto">
        <Select value={task.status} onValueChange={(newStatus: 'todo' | 'in-progress' | 'done') => onStatusChange(task.id, newStatus)}>
            <SelectTrigger className="text-sm h-9 w-40 mr-auto bg-background/50 hover:bg-background/80" aria-label="Change status">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-4 w-4", currentStatusConfig.color)} />
                <SelectValue placeholder="Change status..." />
              </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
            </SelectContent>
        </Select>
        <Button variant="destructive" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} aria-label={`Delete task ${task.title}`}>
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}
