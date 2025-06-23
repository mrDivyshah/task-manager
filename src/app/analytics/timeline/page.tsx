
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Activity } from "@/types";
import { format } from 'date-fns';
import { Loader2, CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ActivityLogItem } from "@/components/ActivityLogItem";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";


export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      setIsActivitiesLoading(true);
      fetch('/api/analytics/activities')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch activities');
            return res.json();
        })
        .then(data => {
            setActivities(data);
        })
        .catch(error => {
          toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        })
        .finally(() => {
            setIsActivitiesLoading(false);
        });
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, toast]);
  
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

  const activityCountsByDate = useMemo(() => {
    return Object.entries(activitiesByDate).reduce((acc, [date, activities]) => {
      acc[date] = activities.length;
      return acc;
    }, {} as Record<string, number>);
  }, [activitiesByDate]);

  const selectedDayActivities = useMemo(() => {
      if (!selectedDate) return [];
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      return activitiesByDate[dateKey] || [];
  }, [selectedDate, activitiesByDate]);


  if (isActivitiesLoading || status === 'loading') {
    return (
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline font-bold text-foreground">Activity Timeline</h1>
                <p className="text-muted-foreground">An interactive heatmap of all task activities.</p>
            </div>
        </div>

        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-muted-foreground" /> Activity Heatmap</CardTitle>
                <CardDescription>An interactive heatmap of all task activities. Click a day to see details.</CardDescription>
            </CardHeader>
            <CardContent>
            {isActivitiesLoading && activities.length === 0 ? (
                <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : activities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p>No activity to display yet.</p>
                    <p>Create or update some tasks to see your timeline.</p>
                </div>
            ) : (
                <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                    <ActivityHeatmap 
                        data={activityCountsByDate}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />
                </div>
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
    </div>
  );
}
