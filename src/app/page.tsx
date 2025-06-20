
"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types";
import { PlusCircle, Wand2, Loader2, LogIn } from "lucide-react";
import { smartSortTasksAction } from "./actions";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasktango-tasks", []);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [isSorting, setIsSorting] = useState(false);
  const { toast } = useToast();

  const sortedTasks = [...tasks].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

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
          task.id === existingTask.id ? { ...task, ...data, createdAt: task.createdAt || Date.now() } : task
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
  };

  const handleSmartSort = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to sort",
        description: "Add some tasks before using Smart Sort.",
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
        const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
        newTasks.sort((a,b) => {
          const pA = priorityOrder[a.priority?.toLowerCase() || ''] || 4;
          const pB = priorityOrder[b.priority?.toLowerCase() || ''] || 4;
          if (pA !== pB) return pA - pB;
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
        </footer>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-headline font-semibold text-foreground mb-4">Welcome to TaskTango!</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Please log in to manage your tasks efficiently and experience smart sorting powered by AI.
          </p>
          <Button onClick={() => signIn("google")} size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90">
            <LogIn className="mr-2 h-5 w-5" />
            Login with Google
          </Button>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {new Date().getFullYear()} TaskTango. Crafted with 🧠 & ❤️.
        </footer>
      </div>
    );
  }

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
