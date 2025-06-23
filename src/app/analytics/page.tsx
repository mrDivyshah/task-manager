
"use client";

import { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Bar, BarChart, CartesianGrid, LabelList, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types";
import { subDays, format, startOfDay } from 'date-fns';
import { Loader2, Package, CheckCircle2, Timer, ListTodo } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType;
  };
};

const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <Card className="shadow-lg rounded-2xl hover:-translate-y-1 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(true);
      fetch('/api/tasks')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch tasks');
          return res.json();
        })
        .then(data => {
          setTasks(data);
        })
        .catch(error => {
          toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, toast]);

  const analyticsData = useMemo(() => {
    if (tasks.length === 0) return null;

    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, { todo: 0, 'in-progress': 0, done: 0 } as Record<Task['status'], number>);

    const categoryCounts = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedLast7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = startOfDay(subDays(new Date(), i));
        return { date, count: 0 };
    }).reverse();

    tasks.forEach(task => {
        if (task.status === 'done' && task.updatedAt) {
            const completedDate = startOfDay(new Date(task.updatedAt));
            const dayEntry = completedLast7Days.find(d => d.date.getTime() === completedDate.getTime());
            if (dayEntry) {
                dayEntry.count += 1;
            }
        }
    });
    
    const completionPercentage = tasks.length > 0 ? (statusCounts.done / tasks.length) * 100 : 0;
    const progressChartData = [
        { name: 'completed', value: completionPercentage, fill: 'var(--color-done)' },
        { name: 'other', value: 100 - completionPercentage, fill: 'var(--color-other)' },
    ];

    return {
      statusCounts,
      totalTasks: tasks.length,
      completionPercentage,
      progressChartData,
      categoryData: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 7),
      completionTrendData: completedLast7Days.map(d => ({ date: format(d.date, 'eee'), count: d.count })),
    };
  }, [tasks]);

  const progressConfig: ChartConfig = {
    done: { label: "Done", color: "hsl(var(--primary))" },
    other: { label: "Other", color: "hsl(var(--muted))" },
  };

  const categoryConfig: ChartConfig = {
     count: { label: "Tasks", color: "hsl(var(--primary))" },
  };

  if (isLoading || status === 'loading') {
    return (
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!analyticsData) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
                <Package size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Not Enough Data</h3>
                <p className="max-w-sm">
                Create some tasks to start seeing your analytics dashboard.
                </p>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
      </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard title="Total Tasks" value={analyticsData.totalTasks} icon={Package} />
            <StatCard title="Completed Tasks" value={analyticsData.statusCounts.done} icon={CheckCircle2} />
            <StatCard title="In-Progress Tasks" value={analyticsData.statusCounts['in-progress']} icon={Timer} />
            <StatCard title="To-Do Tasks" value={analyticsData.statusCounts.todo} icon={ListTodo} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>Weekly Completion</CardTitle>
                    <CardDescription>Tasks completed in the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[350px]">
                     <ChartContainer config={categoryConfig} className="w-full h-full">
                        <BarChart data={analyticsData.completionTrendData} margin={{ top: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                            <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-1 shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>Task Progress</CardTitle>
                    <CardDescription>Percentage of tasks completed.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] sm:h-[350px] relative">
                    <ChartContainer config={progressConfig} className="w-full h-full">
                        <PieChart>
                            <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={analyticsData.progressChartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={80}
                                outerRadius={110}
                                cornerRadius={8}
                                startAngle={90}
                                endAngle={450}
                                paddingAngle={2}
                            >
                                <Cell key="completed" fill="var(--color-done)" />
                                <Cell key="other" fill="var(--color-other)" stroke="var(--color-other)" />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-5xl font-bold text-foreground">{Math.round(analyticsData.completionPercentage)}%</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>Breakdown of tasks by category.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] sm:h-[400px]">
                   <ChartContainer config={categoryConfig} className="w-full h-full">
                    <BarChart data={analyticsData.categoryData} layout="vertical" margin={{ left: 20, right: 30, bottom: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" dataKey="count" hide />
                        <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 8, 8, 0]}>
                            <LabelList position="right" offset={8} className="fill-foreground font-medium" fontSize={12} dataKey="count" />
                        </Bar>
                    </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
