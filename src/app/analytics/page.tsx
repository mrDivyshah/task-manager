
"use client";

import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, Pie, PieChart, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Task, Activity } from "@/types";
import { subDays, format, startOfDay } from 'date-fns';
import { Loader2, AreaChart as AreaChartIcon, BarChart3, PieChart as PieChartIcon, CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ActivityLogItem } from "@/components/ActivityLogItem";

// Define a type for chart configuration
type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchAllData = async () => {
        setIsLoading(true);
        setIsActivitiesLoading(true);
        try {
          const [tasksRes, activitiesRes] = await Promise.all([
            fetch('/api/tasks'),
            fetch('/api/analytics/activities'),
          ]);

          if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
          if (!activitiesRes.ok) throw new Error('Failed to fetch activities');
          
          const tasksData = await tasksRes.json();
          const activitiesData = await activitiesRes.json();
          
          setTasks(tasksData);
          setActivities(activitiesData);
        } catch (error) {
          toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        } finally {
          setIsLoading(false);
          setIsActivitiesLoading(false);
        }
      };
      fetchAllData();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, toast]);

  const analyticsData = useMemo(() => {
    if (tasks.length === 0) return null;

    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);

    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || 'none';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
        if (task.status === 'done') {
            const completedDate = startOfDay(new Date(task.updatedAt));
            const dayEntry = completedLast7Days.find(d => d.date.getTime() === completedDate.getTime());
            if (dayEntry) {
                dayEntry.count += 1;
            }
        }
    });

    return {
      statusData: Object.entries(statusCounts).map(([status, count]) => ({ status, count, fill: `var(--color-${status})` })),
      priorityData: Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count, fill: `var(--color-${priority})` })),
      categoryData: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count).slice(0, 10),
      completionTrendData: completedLast7Days.map(d => ({ date: format(d.date, 'MMM d'), count: d.count })),
    };
  }, [tasks]);
  
  const activitiesByDate = useMemo(() => {
    return activities.reduce((acc, activity) => {
        const dateKey = format(new Date(activity.createdAt), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities]);

  const daysWithActivity = useMemo(() => {
      return Object.keys(activitiesByDate).map(dateStr => {
        // Adjust for timezone issues by creating date in UTC
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      });
  }, [activitiesByDate]);

  const selectedDayActivities = useMemo(() => {
      if (!selectedDate) return [];
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      return activitiesByDate[dateKey] || [];
  }, [selectedDate, activitiesByDate]);


  const statusConfig: ChartConfig = {
    todo: { label: "To Do", color: "hsl(var(--chart-1))" },
    'in-progress': { label: "In Progress", color: "hsl(var(--chart-2))" },
    done: { label: "Done", color: "hsl(var(--chart-3))" },
  };

  const priorityConfig: ChartConfig = {
    high: { label: "High", color: "hsl(var(--chart-5))" },
    medium: { label: "Medium", color: "hsl(var(--chart-4))" },
    low: { label: "Low", color: "hsl(var(--chart-2))" },
    none: { label: "None", color: "hsl(var(--muted))" },
  };

  if (isLoading || status === 'loading') {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-foreground">Task Analytics</h1>
              <p className="text-muted-foreground">An overview of your productivity and task distribution.</p>
            </div>
          </div>
          
          {!analyticsData ? (
             <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-xl bg-card/50">
                <AreaChartIcon size={64} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Not Enough Data</h3>
                <p className="max-w-sm">
                  Create some tasks to start seeing your analytics here.
                </p>
              </div>
          ) : (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-muted-foreground" />Task Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                            <RechartsTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                            <Pie data={analyticsData.statusData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5} >
                                <LabelList dataKey="count" className="fill-background" stroke="none" fontSize={12} formatter={(value: string) => `${((parseInt(value) / tasks.length) * 100).toFixed(0)}%`} />
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="status" />} className="-mt-4" />
                        </PieChart>
                        </ChartContainer>
                    </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AreaChartIcon className="h-5 w-5 text-muted-foreground" />Task Completion Trend</CardTitle>
                        <CardDescription>Tasks completed in the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{ count: { label: "Completed", color: "hsl(var(--primary))" } }} className="aspect-auto h-[250px]">
                        <LineChart data={analyticsData.completionTrendData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={true} />
                        </LineChart>
                        </ChartContainer>
                    </CardContent>
                    </Card>
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-muted-foreground" />Top 10 Categories</CardTitle>
                        <CardDescription>Number of tasks per category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{ count: { label: "Tasks", color: "hsl(var(--primary))" } }} className="aspect-auto h-[300px]">
                        <BarChart data={analyticsData.categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="count" hide />
                            <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                                <LabelList position="right" offset={8} className="fill-foreground" fontSize={12} dataKey="count" />
                            </Bar>
                        </BarChart>
                        </ChartContainer>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-muted-foreground" />Priority Distribution</CardTitle>
                        <CardDescription>How tasks are prioritized across your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartContainer config={priorityConfig} className="mx-auto aspect-square max-h-[300px]">
                            <PieChart>
                                <RechartsTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                                <Pie data={analyticsData.priorityData} dataKey="count" nameKey="priority" />
                                <ChartLegend content={<ChartLegendContent nameKey="priority" />} className="flex-wrap" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    </Card>
                </div>

                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-muted-foreground" /> Activity Timeline</CardTitle>
                    <CardDescription>An interactive timeline of all task activities. Click a day to see details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isActivitiesLoading ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : activities.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No activity to display yet.</p>
                            <p>Create or update some tasks to see your timeline.</p>
                        </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          modifiers={{ hasActivity: daysWithActivity }}
                          modifiersClassNames={{ hasActivity: 'day_hasActivity' }}
                          className="p-0 flex justify-center"
                          classNames={{
                            month: 'space-y-4 border rounded-lg p-3 bg-muted/20 w-full',
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg mb-4 text-foreground">
                            Activities for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                          </h3>
                          <ScrollArea className="h-96 pr-4 -mr-4">
                            <div className="space-y-4">
                              {selectedDayActivities.length > 0 ? (
                                selectedDayActivities.map(activity => (
                                  <ActivityLogItem key={activity.id} activity={activity} />
                                ))
                              ) : (
                                <div className="text-center text-muted-foreground pt-16">
                                  <p>No activity on this day.</p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © 2025 TaskFlow. Developed By Dravya shah
      </footer>
    </div>
  );
}
