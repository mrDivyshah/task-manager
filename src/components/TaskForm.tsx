
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { useEffect, useState, useMemo } from "react";
import { Loader2, Calendar as CalendarIcon, Users, Zap } from "lucide-react";
import { MultiSelect, type Option } from "./ui/multi-select";
import { Checkbox } from "./ui/checkbox";
import { useSession } from "next-auth/react";
import { Separator } from "./ui/separator";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  priority: z.string().optional(),
  teamIds: z.array(z.string()).optional(),
  assignedTo: z.array(z.string()).optional(),
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
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [assignToAll, setAssignToAll] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      priority: "none",
      teamIds: [],
      assignedTo: [],
      dueDate: null,
      dueTime: "",
    },
  });
  
  const selectedTeamIds = form.watch('teamIds') || [];

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
          priority: taskToEdit.priority || "none",
          teamIds: taskToEdit.teamIds || [],
          assignedTo: taskToEdit.assignedTo?.map(a => a.id) || [],
          dueDate: dueDateObj,
          dueTime: timeString,
        });
      } else {
        form.reset({
          title: "",
          notes: "",
          priority: "none",
          teamIds: [],
          assignedTo: [session?.user?.id ?? ""].filter(Boolean),
          dueDate: null,
          dueTime: "",
        });
      }
      setAssignToAll(false);
    }
  }, [taskToEdit, form, isOpen, session]);

  useEffect(() => {
    const fetchMembers = async (teamIds: string[]) => {
      if (teamIds.length === 0) {
        setMembers([]);
        return;
      }
      setIsLoadingMembers(true);
      try {
        const memberPromises = teamIds.map(id => fetch(`/api/teams/${id}/members`).then(res => res.ok ? res.json() : []));
        const memberArrays = await Promise.all(memberPromises);
        
        const allMembers = memberArrays.flat();
        const uniqueMembers = Array.from(new Map(allMembers.map((item: TeamMember) => [item.id, item])).values());
        
        setMembers(uniqueMembers);
      } catch (error) {
        console.error(error);
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    fetchMembers(selectedTeamIds);
  }, [selectedTeamIds]);

  useEffect(() => {
    if (assignToAll) {
      form.setValue('assignedTo', members.map(m => m.id));
    }
  }, [assignToAll, members, form]);

  const teamOptions: Option[] = useMemo(() => teams.map(t => ({ value: t.id, label: t.name })), [teams]);
  const memberOptions: Option[] = useMemo(() => {
     // Include the current user if not in any selected team, for personal tasks
    const currentUserOption = session?.user ? { value: session.user.id, label: `${session.user.name} (You)` } : null;
    let allOptions = [...members.map(m => ({ value: m.id, label: m.name }))];
    if (currentUserOption && !allOptions.some(o => o.value === currentUserOption.value)) {
        allOptions.unshift(currentUserOption);
    }
    const uniqueMembers = Array.from(new Map(allOptions.map(item => [item.value, item])).values());
    return uniqueMembers;
  }, [members, session]);


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
      <DialogContent className="sm:max-w-3xl bg-card rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {taskToEdit ? "Edit Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update the details of your task." : "Fill in the details for your new task to keep things organized."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1 -mr-6 pr-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Finalize project report" {...field} className="bg-background border-input focus:ring-primary text-base" />
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
                      <Textarea placeholder="Add any relevant details, links, or context..." className="resize-none bg-background border-input focus:ring-primary" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center text-foreground"><Users className="mr-2 h-5 w-5 text-muted-foreground" /> Assignment</h3>
                <div className="space-y-4">
                  <Controller
                    control={form.control}
                    name="teamIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Assign to Team(s)</FormLabel>
                        <MultiSelect
                            selected={field.value ?? []}
                            options={teamOptions}
                            onChange={field.onChange}
                            placeholder="Select teams..."
                            className="w-full"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-foreground/80">Assign to Member(s)</FormLabel>
                          {isLoadingMembers && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                        <MultiSelect
                            selected={field.value ?? []}
                            options={memberOptions}
                            onChange={field.onChange}
                            placeholder={selectedTeamIds.length > 0 ? "Select members..." : "Select a team first"}
                            className="w-full"
                            disabled={isLoadingMembers || (selectedTeamIds.length === 0 && memberOptions.length <= 1)}
                        />
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2 pl-1">
                    <Checkbox
                      id="assignToAll"
                      onCheckedChange={(checked) => setAssignToAll(Boolean(checked))}
                      disabled={members.length === 0}
                    />
                    <label
                      htmlFor="assignToAll"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Assign to all members in selected team(s)
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center text-foreground"><CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Scheduling & Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "none"}>
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
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-foreground/80">Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-background border-input",
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
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-foreground/80">Time (Optional)</FormLabel>
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
            </div>
            <DialogFooter className="mt-6 pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {taskToEdit ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
