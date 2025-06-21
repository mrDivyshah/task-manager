
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types";
import { PlusCircle, Wand2, Loader2, LogIn, Mail, Eye, EyeOff, Search, Filter, SearchX, CheckCircle2, AlertTriangle, Info, Plus, UserPlus } from "lucide-react";
import { smartSortTasksAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useLocalStorage<Task[]>("taskflow-tasks", []);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [isSorting, setIsSorting] = useState(false);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const displayedTasks = tasks
    .filter(task => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        task.title.toLowerCase().includes(term) ||
        (task.notes && task.notes.toLowerCase().includes(term))
      );
    })
    .filter(task => {
      if (priorityFilter === "all") {
        return true;
      }
      if (priorityFilter === "none") {
        return !task.priority || task.priority.trim() === "";
      }
      return task.priority?.toLowerCase() === priorityFilter;
    })
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3, default: 4 };
      const getPrioValue = (priority?: string) => {
        if (!priority || priority.trim() === "" || priority === "none") return priorityOrder.default;
        return priorityOrder[priority.toLowerCase()] || priorityOrder.default;
      };
      const pA = getPrioValue(a.priority);
      const pB = getPrioValue(b.priority);

      if (pA !== pB) return pA - pB;
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
  
  const allTasksAreDisplayed = displayedTasks.length === tasks.length && searchTerm.trim() === "" && priorityFilter === "all";


  const handleOpenTaskForm = (task?: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setTaskToEdit(undefined);
  };

  const handleSaveTask = (
    data: { title: string; notes?: string; priority?: string; teamId?: string },
    existingTask?: Task
  ) => {
    const taskPriorityToSave = data.priority === "none" || data.priority === ""
      ? undefined
      : (data.priority as Task['priority'] || undefined);
    const taskTeamIdToSave = data.teamId === "" ? undefined : data.teamId;

    if (existingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === existingTask.id
            ? {
                ...task,
                title: data.title,
                notes: data.notes || "",
                priority: taskPriorityToSave,
                teamId: taskTeamIdToSave,
                createdAt: task.createdAt || Date.now()
              }
            : task
        )
      );
      toast({
        title: "Task Updated",
        description: `"${data.title}" has been updated.`,
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      });
    } else {
      const newTask: Task = {
        id: generateId(),
        title: data.title,
        notes: data.notes || "",
        priority: taskPriorityToSave,
        teamId: taskTeamIdToSave,
        createdAt: Date.now(),
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Task Created",
        description: `"${data.title}" has been added.`,
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      });
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
        icon: <AlertTriangle className="h-5 w-5" />,
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
        icon: <Info className="h-5 w-5 text-primary" />,
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
            return { ...task, category: sortInfo.category, priority: sortInfo.priority as Task['priority'] };
          }
          return task;
        });
        const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3, default: 4 };
        newTasks.sort((a,b) => {
          const getPrioValue = (priority?: string) => {
            if (!priority || priority.trim() === "" || priority === "none") return priorityOrder.default;
            return priorityOrder[priority.toLowerCase()] || priorityOrder.default;
          };
          const pA = getPrioValue(a.priority);
          const pB = getPrioValue(b.priority);
          if (pA !== pB) return pA - pB;
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        });
        return newTasks;
      });
      toast({
        title: "Tasks Smart Sorted!",
        description: "Categories and priorities have been updated.",
        icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      });
    } catch (error) {
      console.error("Smart Sort Error:", error);
      toast({
        title: "Smart Sort Failed",
        description: (error as Error).message || "Could not sort tasks. Please try again.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setIsSorting(false);
    }
  };

  const handleCredentialsLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCredentialsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, 
      });

      if (result?.error) {
        let description = "Login failed. Please check your credentials.";
        if (result.error === "CredentialsSignin") {
          description = "Invalid email or password.";
        } else if (result.error !== "Callback" && result.error !== "SessionRequired" && result.error !== "OAuthAccountNotLinked" && result.error !== "Default") {
          description = `Error: ${result.error}`;
        }
         toast({
            title: "Login Issue",
            description: description,
            variant: "destructive",
            icon: <AlertTriangle className="h-5 w-5" />,
        });
      } else if (result?.ok) {
        // Login successful
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred during login.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Login System Error",
        description: `Error: "${errorMessage}". CRITICAL: Check your Next.js server terminal logs for errors from NextAuth. Also verify NEXTAUTH_URL in .env is correct (e.g., http://localhost:9002).`,
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSignupLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setAuthMode('login'); // Switch to login form
        setEmail(signupEmail); // Pre-fill email for convenience
        setPassword('');
        // Clear signup form
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
      } else {
        toast({
            title: "Sign Up Failed",
            description: data.message || "An error occurred during sign up.",
            variant: "destructive",
            icon: <AlertTriangle className="h-5 w-5" />,
        });
      }
    } catch (error) {
      toast({
        title: "Sign Up Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setIsSignupLoading(false);
    }
  };


  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
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
              {authMode === 'login' ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {authMode === 'login' ? 'Log in to manage your tasks.' : 'Get started with TaskFlow for free.'}
            </p>

            <Button onClick={() => signIn("google", { callbackUrl: "/" })} size="lg" className="w-full mb-4 shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90">
              <LogIn className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center w-full">
              <Separator className="flex-grow shrink" />
              <span className="mx-4 text-xs text-muted-foreground uppercase">Or</span>
              <Separator className="flex-grow shrink" />
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleCredentialsLogin} className="space-y-6 text-left">
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-normal text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow" disabled={isCredentialsLoading}>
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
                <Button type="submit" size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow" disabled={isSignupLoading}>
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
              {authMode === 'login' ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setAuthMode('signup')}>
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setAuthMode('login')}>
                    Log In
                  </Button>
                </>
              )}
            </p>

            <p className="mt-4 text-xs text-muted-foreground">
              Sign up for a new account or use Google to log in.
            </p>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
        </footer>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mounted && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-headline font-semibold text-foreground">Your Tasks</h2>
                <span className="text-sm text-muted-foreground">
                  {allTasksAreDisplayed
                    ? `(${tasks.length} task${tasks.length === 1 ? "" : "s"})`
                    : `(${displayedTasks.length} of ${tasks.length} task${tasks.length === 1 ? "" : "s"} shown)`}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap">
                <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[230px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full bg-background border-input focus:ring-primary shadow-sm"
                  />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-auto sm:min-w-[170px] bg-background border-input focus:ring-primary shadow-sm">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
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
                <Button onClick={handleSmartSort} disabled={isSorting || tasks.length === 0} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                  {isSorting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4 text-accent" />
                  )}
                  Smart Sort
                </Button>
                <Button 
                  onClick={() => handleOpenTaskForm()} 
                  className="shadow-sm hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Task
                </Button>
              </div>
            </div>

            {tasks.length > 0 && displayedTasks.length === 0 && (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
                <SearchX size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No Matching Tasks</h3>
                <p className="max-w-sm">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            { (tasks.length === 0 || displayedTasks.length > 0) && (
                <TaskList
                  tasks={displayedTasks}
                  onEditTask={handleOpenTaskForm}
                  onDeleteTask={handleDeleteTask}
                  onReorderTasks={handleReorderTasks}
                />
              )
            }
          </>
        )}
      </main>

      {session && mounted && (
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
      )}

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © {currentYear} TaskFlow. Crafted with 🧠 & ❤️.
      </footer>
    </div>
  );
}
