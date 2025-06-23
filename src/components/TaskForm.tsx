
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Task, Team, TeamMember } from "@/types";
import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  priority: z.string().optional(),
  teamId: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional().nullable(),
  dueTime: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, existingTask?: Task) => void;
  taskToEdit?: Task;
  teams: Team[];
}

export function TaskForm({ isOpen, onClose, onSubmit, taskToEdit, teams }: TaskFormProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      priority: "",
      teamId: "__none__",
      assignedTo: "__none__",
      dueDate: null,
      dueTime: "",
    },
  });
  
  const selectedTeamId = form.watch('teamId');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        const dueDateObj = taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null;
        let timeString = "";
        if (dueDateObj) {
            const hours = dueDateObj.getHours();
            const minutes = dueDateObj.getMinutes();
            if (hours !== 0 || minutes !== 0) {
                 timeString = format(dueDateObj, "HH:mm");
            }
        }
        form.reset({
          title: taskToEdit.title,
          notes: taskToEdit.notes,
          priority: taskToEdit.priority || "",
          teamId: taskToEdit.teamId || "__none__",
          assignedTo: taskToEdit.assignedTo?.id || "__none__",
          dueDate: dueDateObj,
          dueTime: timeString,
        });
      } else {
        form.reset({
          title: "",
          notes: "",
          priority: "",
          teamId: "__none__",
          assignedTo: "__none__",
          dueDate: null,
          dueTime: "",
        });
      }
    }
  }, [taskToEdit, form, isOpen]);

  useEffect(() => {
    const fetchMembers = async (teamId: string) => {
      if (teamId === '__none__') {
        setMembers([]);
        form.setValue('assignedTo', '__none__');
        return;
      }
      setIsLoadingMembers(true);
      try {
        const res = await fetch(`/api/teams/${teamId}/members`);
        if (!res.ok) throw new Error('Failed to fetch team members');
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.error(error);
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    if (selectedTeamId) {
      fetchMembers(selectedTeamId);
    }
  }, [selectedTeamId, form]);


  const handleSubmit = (data: TaskFormValues) => {
    const { dueDate, dueTime, ...restOfData } = data;
    let finalDueDateISO: string | null = null;

    if (dueDate) {
        const combinedDate = new Date(dueDate);
        if (dueTime) {
            const [hours, minutes] = dueTime.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                combinedDate.setHours(hours, minutes, 0, 0);
            }
        } else {
             combinedDate.setHours(0, 0, 0, 0);
        }
        finalDueDateISO = combinedDate.toISOString();
    }
    
    const dataToSend = {
      ...restOfData,
      dueDate: finalDueDateISO,
    };
    onSubmit(dataToSend, taskToEdit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {taskToEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finalize project report" {...field} className="bg-background border-input focus:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any relevant details or context..." className="resize-none bg-background border-input focus:ring-primary" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Assign to Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input focus:ring-primary"><SelectValue placeholder="Select a team" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No Team / Personal</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Assign to Member</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMembers || selectedTeamId === '__none__' || members.length === 0}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input focus:ring-primary">
                          {isLoadingMembers && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Unassigned</SelectItem>
                         {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-input focus:ring-primary"><SelectValue placeholder="Select priority" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-x-2">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-between">
                          <FormLabel className="text-foreground/80">Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="mt-1"/>
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="dueTime"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-between">
                                <FormLabel className="text-foreground/80">Time</FormLabel>
                                <FormControl>
                                    <Input
                                        type="time"
                                        className="bg-background border-input focus:ring-primary"
                                        disabled={!form.watch('dueDate')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="mt-1"/>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <DialogFooter className="mt-8">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default">
                {taskToEdit ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
