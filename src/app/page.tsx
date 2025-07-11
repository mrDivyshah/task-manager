"use client";

import { useState, useEffect, type FormEvent, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskDetail } from "@/components/TaskDetail";
import { useToast } from "@/hooks/use-toast";
import type { Task, Team } from "@/types";
import {
  PlusCircle,
  Loader2,
  LogIn,
  Mail,
  Eye,
  EyeOff,
  Search,
  Filter,
  SearchX,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  UserPlus,
  Users,
  UserCheck,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function TaskItemSkeleton({ view }: { view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-xl bg-card shadow-md">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-4 mt-auto border-t">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [assignedToMeFilter, setAssignedToMeFilter] = useState<boolean>(false);

  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "task-view-mode",
    "grid"
  );

  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(
    null
  );
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setIsDataLoading(false);
    }
  }, [status]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const [tasksRes, teamsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/teams"),
      ]);

      if (!tasksRes.ok || !teamsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const tasksData = await tasksRes.json();
      const teamsData = await teamsRes.json();

      setTasks(tasksData);
      setTeams(teamsData);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const taskCounts = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      all: tasks.length,
    }),
    [tasks]
  );

  const displayedTasks = tasks
    .filter((task) => statusFilter === "all" || task.status === statusFilter)
    .filter((task) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        task.title.toLowerCase().includes(term) ||
        (task.notes && task.notes.toLowerCase().includes(term))
      );
    })
    .filter((task) => {
      if (priorityFilter === "all") return true;
      if (priorityFilter === "none")
        return (
          !task.priority ||
          task.priority.trim() === "" ||
          task.priority === "none"
        );
      return task.priority?.toLowerCase() === priorityFilter;
    })
    .filter((task) => {
      if (teamFilter === "all") return true;
      if (teamFilter === "personal")
        return !task.teamIds || task.teamIds.length === 0;
      return task.teamIds?.includes(teamFilter);
    })
    .filter((task) => {
      if (!assignedToMeFilter) return true;
      return task.assignedTo?.some((a) => a.id === session?.user?.id);
    })
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;

      const priorityOrder: Record<string, number> = {
        high: 1,
        medium: 2,
        low: 3,
        default: 4,
      };
      const getPrioValue = (priority?: string) => {
        if (!priority || priority.trim() === "" || priority === "none")
          return priorityOrder.default;
        return priorityOrder[priority.toLowerCase()] || priorityOrder.default;
      };
      const pA = getPrioValue(a.priority);
      const pB = getPrioValue(b.priority);

      if (pA !== pB) return pA - pB;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0); // Sort by most recent
    });

  const handleResetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("all");
    setTeamFilter("all");
    setAssignedToMeFilter(false);
  };

  const activeFilterCount =
    (searchTerm.trim() ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (teamFilter !== "all" ? 1 : 0) +
    (assignedToMeFilter ? 1 : 0);

  const handleOpenTaskForm = (task?: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
    setIsDetailViewOpen(false); // Close detail view if open
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setTaskToEdit(undefined);
  };

  const handleSaveTask = async (
    data: {
      title: string;
      notes?: string;
      priority?: string;
      teamIds?: string[];
      assignedTo?: string[];
      dueDate?: string | null;
    },
    existingTask?: Task
  ) => {
    const url = existingTask ? `/api/tasks/${existingTask.id}` : "/api/tasks";
    const method = existingTask ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `Failed to ${existingTask ? "update" : "create"} task`
        );
      }

      const savedTask: Task = await res.json();

      if (existingTask) {
        // If editing, update the task in the main list
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === savedTask.id ? savedTask : t))
        );
        // And if the detail view is open for this task, update it too
        if (selectedTaskDetails?.id === savedTask.id) {
          setSelectedTaskDetails(savedTask);
        }
      } else {
        setTasks((prevTasks) => [savedTask, ...prevTasks]);
      }

      toast({
        title: existingTask ? "Task Updated" : "Task Created",
        description: `"${data.title}" has been saved.`,
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      });
      handleCloseTaskForm();
    } catch (error) {
      toast({
        title: `Error ${existingTask ? "Updating" : "Creating"} Task`,
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    // Optimistically remove from UI
    setTasks(tasks.filter((task) => task.id !== taskId));

    if (selectedTaskDetails?.id === taskId) {
      setIsDetailViewOpen(false);
      setSelectedTaskDetails(null);
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        // Revert UI change on failure
        setTasks((prev) =>
          [...prev, taskToDelete].sort((a, b) => b.createdAt - a.createdAt)
        );
        throw new Error("Failed to delete task from server.");
      }
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.title}" has been removed.`,
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } catch (error) {
      toast({
        title: "Error Deleting Task",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    // Note: This only updates local state. To persist order, a backend update is needed.
    setTasks(reorderedTasks);
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const originalTasks = [...tasks];

    const updateTaskState = (taskToUpdate: Task): Task => {
      if (taskToUpdate.id === taskId) return { ...taskToUpdate, status };
      return taskToUpdate;
    };

    setTasks((prevTasks) => prevTasks.map(updateTaskState));
    if (selectedTaskDetails?.id === taskId) {
      setSelectedTaskDetails((prev) => (prev ? updateTaskState(prev) : null));
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status on server.");
      }

      const updatedTask = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      if (selectedTaskDetails?.id === updatedTask.id) {
        setSelectedTaskDetails(updatedTask);
      }
    } catch (error) {
      setTasks(originalTasks);
      if (selectedTaskDetails?.id === taskId) {
        const originalTask = originalTasks.find((t) => t.id === taskId);
        if (originalTask) setSelectedTaskDetails(originalTask);
      }
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCredentialsLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCredentialsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login Issue",
          description: "Login failed. Please check your credentials.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        // Successful login, router will redirect based on session status change
      }
    } catch (error) {
      toast({
        title: "Login System Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSignupLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Sign Up Successful!",
          description: "You can now log in with your credentials.",
          icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
        });
        setAuthMode("login");
        setEmail(signupEmail);
        setPassword("");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
      } else {
        toast({
          title: "Sign Up Failed",
          description: data.message || "An error occurred during sign up.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Up Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTaskDetails(task);
    setIsDetailViewOpen(true);
  };

  const handleTaskUpdateFromDetail = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTaskDetails(updatedTask);
  };

  if (status === "loading" || (status === "authenticated" && isDataLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mb-8">
            <Skeleton className="h-10 w-full sm:w-96 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="space-y-8">
            <div>
              <Skeleton className="h-8 w-1/4 mb-4 rounded-lg" />
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-4"
                )}
              >
                {[...Array(4)].map((_, i) => (
                  <TaskItemSkeleton key={i} view={viewMode} />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-1/4 mb-4 rounded-lg" />
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-4"
                )}
              >
                {[...Array(4)].map((_, i) => (
                  <TaskItemSkeleton key={i} view={viewMode} />
                ))}
              </div>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © 2025 TaskFlow. All rights reserved.
        </footer>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">
          <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-headline font-semibold text-foreground mb-2">
              {authMode === "login" ? "Welcome Back!" : "Create an Account"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {authMode === "login"
                ? "Log in to manage your tasks."
                : "Get started with TaskFlow for free."}
            </p>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              size="lg"
              className="w-full mb-4 shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center w-full">
              <Separator className="flex-grow shrink" />
              <span className="mx-4 text-xs text-muted-foreground uppercase">
                Or
              </span>
              <Separator className="flex-grow shrink" />
            </div>

            {authMode === "login" ? (
              <form
                onSubmit={handleCredentialsLogin}
                className="space-y-6 text-left"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-input focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-login"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background border-input focus:ring-primary pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-normal text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full shadow-md hover:shadow-lg transition-shadow"
                  disabled={isCredentialsLoading}
                >
                  {isCredentialsLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-5 w-5" />
                  )}
                  Login with Email
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Full Name</Label>
                  <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="bg-background border-input focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="bg-background border-input focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="bg-background border-input focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full shadow-md hover:shadow-lg transition-shadow"
                  disabled={isSignupLoading}
                >
                  {isSignupLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-5 w-5" />
                  )}
                  Create Account
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {authMode === "login" ? (
                <>
                  {" "}
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </Button>{" "}
                </>
              ) : (
                <>
                  {" "}
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setAuthMode("login")}
                  >
                    Log In
                  </Button>{" "}
                </>
              )}
            </p>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © 2025 TaskFlow. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-headline font-semibold text-foreground">
              Your Tasks
            </h2>
            <span className="text-sm text-muted-foreground">
              {activeFilterCount === 0 && statusFilter === "all"
                ? `(${tasks.length} task${tasks.length === 1 ? "" : "s"})`
                : `(${displayedTasks.length} of ${tasks.length} task${
                    tasks.length === 1 ? "" : "s"
                  } shown)`}
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-7 w-8 p-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid View</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-7 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              onClick={() => handleOpenTaskForm()}
              className="shadow-sm hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mb-8">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4 sm:w-auto">
              <TabsTrigger value="all" className="flex gap-2">
                All{" "}
                <Badge
                  variant={statusFilter === "all" ? "default" : "secondary"}
                  className="px-2"
                >
                  {taskCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="todo" className="flex gap-2">
                To Do{" "}
                <Badge
                  variant={statusFilter === "todo" ? "default" : "secondary"}
                  className="px-2"
                >
                  {taskCounts.todo || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="flex gap-2">
                In Progress{" "}
                <Badge
                  variant={
                    statusFilter === "in-progress" ? "default" : "secondary"
                  }
                  className="px-2"
                >
                  {taskCounts["in-progress"] || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="done" className="flex gap-2">
                Done{" "}
                <Badge
                  variant={statusFilter === "done" ? "default" : "secondary"}
                  className="px-2"
                >
                  {taskCounts.done || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="shadow-sm w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-96"
              align="end"
            >
              <div className="grid gap-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine your task list with the options below.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-filter">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="search-filter"
                        type="search"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority-filter">Priority</Label>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger
                        id="priority-filter"
                        className="w-full bg-background"
                      >
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="none">No Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-filter">Team</Label>
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger
                        id="team-filter"
                        className="w-full bg-background"
                      >
                        <SelectValue placeholder="Filter by team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Teams & Personal
                        </SelectItem>
                        <SelectItem value="personal">
                          Personal (No Team)
                        </SelectItem>
                        <Separator />
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="assigned-to-me-filter"
                      checked={assignedToMeFilter}
                      onCheckedChange={(checked) =>
                        setAssignedToMeFilter(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="assigned-to-me-filter"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Only show tasks assigned to me
                    </Label>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="justify-start p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {tasks.length > 0 && displayedTasks.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
            <SearchX size={64} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No Matching Tasks
            </h3>
            <p className="max-w-sm">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {(tasks.length === 0 || displayedTasks.length > 0) && (
          <TaskList
            tasks={displayedTasks}
            view={viewMode}
            onViewDetails={handleViewTaskDetails}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleOpenTaskForm()}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 bg-primary hover:bg-primary/90 text-primary-foreground p-0 z-50 flex items-center justify-center"
              aria-label="Quick Add Task"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quick Add Task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
        teams={teams}
      />

      <TaskDetail
        task={selectedTaskDetails}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
        onTaskUpdate={handleTaskUpdateFromDetail}
        onOpenEdit={handleOpenTaskForm}
        onDelete={handleDeleteTask}
      />

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © 2025 TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}
