
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Task, Activity, UserSubset } from "@/types";
import { Pencil, Loader2, MessageSquare, Send, ArrowRight, User, Calendar as CalendarIcon, Clock, Circle, CheckCircle, MoreHorizontal, Tag, Zap, Users as UsersIcon, X, Info, Trash2 } from "lucide-react";
import { useState, useEffect, type FormEvent, useCallback } from "react";
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onOpenEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const statusConfig = {
    todo: { label: 'To Do', icon: Circle, color: 'text-muted-foreground' },
    'in-progress': { label: 'In Progress', icon: MoreHorizontal, color: 'text-blue-500' },
    done: { label: 'Done', icon: CheckCircle, color: 'text-green-500' },
};

const priorityColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-700 border-red-500/50 dark:text-red-400 dark:border-red-500/70",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50 dark:text-yellow-400 dark:border-yellow-500/70",
    low: "bg-green-500/20 text-green-700 border-green-500/50 dark:text-green-400 dark:border-green-500/70",
    default: "bg-muted text-muted-foreground border-border",
};

const getPriorityColor = (priority?: string) => {
    if (!priority || priority === 'none') return priorityColors.default;
    return priorityColors[priority.toLowerCase()] || priorityColors.default;
}

const getUserInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names[0][0].toUpperCase();
};

const ActivityItem = ({ activity }: { activity: Activity }) => {
    const Icon = {
        CREATE: Info,
        COMMENT: MessageSquare,
        STATUS_CHANGE: ArrowRight,
        ASSIGNMENT_CHANGE: User,
        UPDATE: Pencil,
    }[activity.type];

    const renderDetails = () => {
        switch(activity.type) {
            case 'CREATE':
                return <p><span className="font-semibold">{activity.details.userName}</span> created this task.</p>;
            case 'COMMENT':
                return (
                    <div>
                        <p className="font-semibold">{activity.details.userName}</p>
                        <p className="mt-1 whitespace-pre-wrap text-foreground/80">{activity.details.comment}</p>
                    </div>
                );
            case 'STATUS_CHANGE':
                return <p><span className="font-semibold">{activity.details.userName}</span> changed status from <Badge variant="outline" className="capitalize">{activity.details.from}</Badge> to <Badge variant="outline" className="capitalize">{activity.details.to}</Badge>.</p>;
            case 'ASSIGNMENT_CHANGE':
                 return <p><span className="font-semibold">{activity.details.userName}</span> changed assignment from <Badge variant="secondary">{activity.details.from || 'Unassigned'}</Badge> to <Badge variant="secondary">{activity.details.to || 'Unassigned'}</Badge>.</p>;
            case 'UPDATE':
                if (activity.details.field === 'Notes') {
                    return <p><span className="font-semibold">{activity.details.userName}</span> updated the notes.</p>;
                }
                return (
                    <p>
                        <span className="font-semibold">{activity.details.userName}</span>
                        {' '}changed the <span className="lowercase font-medium">{activity.details.field}</span> from{' '}
                        <Badge variant="secondary" className="capitalize">{activity.details.from || 'none'}</Badge> to <Badge variant="secondary" className="capitalize">{activity.details.to || 'none'}</Badge>.
                    </p>
                );
            default:
                return <p><span className="font-semibold">{activity.details.userName}</span> made an update.</p>;
        }
    };
    
    return (
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">{getUserInitials(activity.details.userName)}</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-grow">
                <div className="text-sm">
                    {renderDetails()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
            </div>
        </div>
    );
};

export function TaskDetail({ task, isOpen, onClose, onTaskUpdate, onOpenEdit, onDelete }: TaskDetailProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!task) return;
    setIsLoadingActivities(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/activity`);
      if (!res.ok) throw new Error("Failed to fetch task activity");
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingActivities(false);
    }
  }, [task, toast]);

  useEffect(() => {
    if (isOpen && task) {
      fetchActivities();
    }
  }, [isOpen, task, fetchActivities]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    
    setIsSubmittingComment(true);
    try {
        const res = await fetch(`/api/tasks/${task.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: newComment.trim() })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to post comment');
        }
        setNewComment("");
        fetchActivities(); // Re-fetch to show new comment
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsSubmittingComment(false);
    }
  }

  if (!task) return null;

  const currentStatus = statusConfig[task.status] || statusConfig.todo;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const hasTime = dueDate && (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0 || dueDate.getSeconds() !== 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle className="font-headline text-2xl break-all">{task.title}</SheetTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-9 w-9">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the task.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
          <SheetDescription>
            In teams: {task.teams && task.teams.length > 0 ? task.teams.map(t => t.name).join(', ') : 'Personal'}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
              {task.notes && (
                  <div>
                      <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed bg-muted/50 p-3 rounded-md border">{task.notes}</p>
                  </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-muted rounded-md"><currentStatus.icon className={cn("h-5 w-5", currentStatus.color)} /></div>
                    <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium text-foreground capitalize">{currentStatus.label}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-muted rounded-md"><Zap className="h-5 w-5 text-muted-foreground"/></div>
                    <div><p className="text-sm text-muted-foreground">Priority</p><p className="font-medium text-foreground capitalize">{task.priority || 'None'}</p></div>
                </div>
                {task.assignedTo && task.assignedTo.length > 0 && (
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-muted rounded-md mt-1"><User className="h-5 w-5 text-muted-foreground"/></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned To</p>
                          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                            {task.assignedTo.map(user => (
                              <Badge key={user.id} variant="secondary" className="font-medium">{user.name}</Badge>
                            ))}
                          </div>
                        </div>
                    </div>
                )}
                 {dueDate && (
                    <div className={cn("flex items-center gap-3 p-3 border rounded-lg", isOverdue && 'border-destructive/50 bg-destructive/5')}>
                        <div className="p-2 bg-muted rounded-md"><CalendarIcon className={cn("h-5 w-5 text-muted-foreground", isOverdue && 'text-destructive')} /></div>
                        <div><p className="text-sm text-muted-foreground">Due Date</p><p className={cn("font-medium text-foreground", isOverdue && 'text-destructive')}>{format(dueDate, hasTime ? "MMMM d, yyyy 'at' p" : "MMMM d, yyyy")}</p></div>
                    </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                  <h4 className="font-semibold text-foreground mb-4">Activity</h4>
                  {isLoadingActivities ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  ) : activities.length > 0 ? (
                      <div className="space-y-6">
                         {activities.map(act => <ActivityItem key={act.id} activity={act} />)}
                      </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
                  )}
              </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={handleCommentSubmit} className="w-full flex gap-3 items-start">
             <Avatar className="h-9 w-9 flex-shrink-0 mt-1">
                <AvatarFallback className="text-sm bg-primary text-primary-foreground">{getUserInitials(task.assignedTo?.[0]?.name)}</AvatarFallback>
            </Avatar>
            <div className="relative w-full">
                <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..." 
                    className="pr-12 resize-none bg-muted border-input focus:ring-primary" 
                    rows={1}
                />
                <Button type="submit" size="icon" className="absolute right-2 bottom-2 h-7 w-7" disabled={isSubmittingComment || !newComment.trim()}>
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
            </div>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
