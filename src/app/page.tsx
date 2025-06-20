"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Task, SmartSortTaskInput } from "@/types";
import { PlusCircle, Wand2, Loader2 } from "lucide-react";
import { smartSortTasksAction } from "./actions";

// Helper to generate a simple unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasktango-tasks", []);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [isSorting, setIsSorting] = useState(false);
  const { toast } = useToast();

  // Ensure tasks are sorted by creation time initially or by user order
  const sortedTasks = [...tasks].sort((a, b) => a.createdAt - b.createdAt);

  const handleOpenTaskForm = (task?: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setTaskToEdit(undefined);
  };

  const handleSaveTask = (
    data: { title: string; notes?: string },
    existingTask?: Task
  ) => {
    if (existingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === existingTask.id ? { ...task, ...data } : task
        )
      );
      toast({ title: "Task Updated", description: `"${data.title}" has been updated.` });
    } else {
      const newTask: Task = {
        id: generateId(),
        ...data,
        notes: data.notes || "",
        createdAt: Date.now(),
      };
      setTasks([...tasks, newTask]);
      toast({ title: "Task Created", description: `"${data.title}" has been added.` });
    }
    handleCloseTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.title}" has been removed.`,
        variant: "destructive",
      });
    }
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    // No toast for reordering to avoid being too noisy
  };

  const handleSmartSort = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to sort",
        description: "Add some tasks before using Smart Sort.",
        variant: "default",
      });
      return;
    }
    setIsSorting(true);
    try {
      const sortedInfos = await smartSortTasksAction(tasks);
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => {
          const sortInfo = sortedInfos.find(info => info.id === task.id);
          if (sortInfo) {
            return { ...task, category: sortInfo.category, priority: sortInfo.priority };
          }
          return task;
        });
        // Optionally, re-sort by AI priority here, or leave it to user drag-and-drop
        // For now, just update metadata. User can reorder based on this.
        // Example: Sort by priority (high > medium > low), then by original order.
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        newTasks.sort((a,b) => {
          const pA = a.priority ? priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 4 : 4;
          const pB = b.priority ? priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 4 : 4;
          if (pA !== pB) return pA - pB;
          return a.createdAt - b.createdAt; // fallback to creation time
        });
        return newTasks;
      });
      toast({
        title: "Tasks Smart Sorted!",
        description: "Categories and priorities have been updated.",
      });
    } catch (error) {
      console.error("Smart Sort Error:", error);
      toast({
        title: "Smart Sort Failed",
        description: (error as Error).message || "Could not sort tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSorting(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-headline font-semibold text-foreground">Your Tasks</h2>
          <div className="flex gap-3">
            <Button onClick={handleSmartSort} disabled={isSorting} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
              {isSorting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4 text-accent" />
              )}
              Smart Sort
            </Button>
            <Button onClick={() => handleOpenTaskForm()} className="shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </div>
        </div>

        <TaskList
          tasks={sortedTasks}
          onEditTask={handleOpenTaskForm}
          onDeleteTask={handleDeleteTask}
          onReorderTasks={handleReorderTasks}
        />
      </main>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
