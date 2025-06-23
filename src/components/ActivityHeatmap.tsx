
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  addDays,
  format,
  getDay,
  isSameDay,
  startOfWeek,
  subYears,
} from "date-fns";
import React from "react";

interface ActivityHeatmapProps {
  data: Record<string, number>;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}

const getIntensityColor = (count: number) => {
  if (count === 0) return "bg-muted/50 hover:bg-muted";
  if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900 hover:bg-emerald-300 dark:hover:bg-emerald-800";
  if (count <= 5) return "bg-emerald-400 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600";
  if (count <= 10) return "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400";
  return "bg-emerald-800 dark:bg-emerald-300 hover:bg-emerald-900 dark:hover:bg-emerald-200";
};

export const ActivityHeatmap = ({ data, selectedDate, onSelectDate }: ActivityHeatmapProps) => {
  const today = new Date();
  
  // Create an array of 53 weeks (53 * 7 = 371 days) to ensure a full grid
  const startDate = startOfWeek(subYears(today, 1), { weekStartsOn: 0 }); // Sunday start
  const dates = Array.from({ length: 53 * 7 }).map((_, i) => addDays(startDate, i));
  
  const monthLabels = dates.reduce((acc: { month: string, index: number }[], date, i) => {
      const month = format(date, 'MMM');
      const weekIndex = Math.floor(i / 7);
      if (acc.every(m => m.month !== month)) {
          acc.push({ month, index: weekIndex });
      }
      return acc;
  }, []);


  return (
    <TooltipProvider>
      <div className="flex justify-end">
        <div className="flex flex-col gap-1 w-full overflow-x-auto pb-2">
            <div className="grid grid-flow-col" style={{ gridTemplateColumns: `repeat(53, minmax(0, 1fr))`, gridTemplateRows: 'auto' }}>
                 {monthLabels.map(({ month, index }, i) => {
                    const nextMonthIndex = monthLabels[i+1]?.index ?? 53;
                    const colSpan = nextMonthIndex - index;
                     return (
                        <div key={month} style={{ gridColumn: `span ${colSpan}`}} className="text-xs text-muted-foreground -ml-2 first:ml-0">
                          {month}
                        </div>
                    )
                 })}
            </div>

            <div className="flex gap-3">
                <div className="grid grid-flow-row grid-rows-7 text-xs text-muted-foreground text-right gap-[1px]">
                  <span></span>
                  <span className="mt-0.5">Mon</span>
                  <span></span>
                  <span className="mt-0.5">Wed</span>
                  <span></span>
                  <span className="mt-0.5">Fri</span>
                  <span></span>
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {dates.map((date, i) => {
                    const dateKey = format(date, "yyyy-MM-dd");
                    const count = data[dateKey] || 0;
                    return (
                        <Tooltip key={i}>
                        <TooltipTrigger asChild>
                            <button
                            aria-label={`Date ${format(date, "MMMM d, yyyy")}, Activities: ${count}`}
                            className={cn(
                                "w-3.5 h-3.5 rounded-sm transition-colors",
                                getIntensityColor(count),
                                isSameDay(date, selectedDate || new Date(0)) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}
                            onClick={() => onSelectDate(date)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold">
                            {count} {count === 1 ? "activity" : "activities"}
                            </p>
                            <p className="text-muted-foreground">
                            {format(date, "MMMM d, yyyy")}
                            </p>
                        </TooltipContent>
                        </Tooltip>
                    );
                    })}
                </div>
            </div>
           <div className="flex items-center justify-end gap-2 mt-2 text-xs">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded-sm bg-muted/50" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-800 dark:bg-emerald-300" />
              <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
