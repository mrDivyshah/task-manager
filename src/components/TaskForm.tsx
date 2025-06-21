
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
import type { Task, Team } from "@/types";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useEffect, useState, useMemo } from "react";
import { Users, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  priority: z.string().optional(),
  teamId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues, existingTask?: Task) => void;
  taskToEdit?: Task;
}

export function TaskForm({ isOpen, onClose, onSubmit, taskToEdit }: TaskFormProps) {
  const [teams] = useLocalStorage<Team[]>("taskflow-teams", []);
  const [isTeamPopoverOpen, setIsTeamPopoverOpen] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      priority: "",
      teamId: "__none__", // Default to "No Team / Personal"
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        form.reset({
          title: taskToEdit.title,
          notes: taskToEdit.notes,
          priority: taskToEdit.priority || "",
          teamId: taskToEdit.teamId || "__none__", // If no teamId, select "No Team"
        });
      } else {
        form.reset({ // For new tasks
          title: "",
          notes: "",
          priority: "",
          teamId: "__none__", // Default to "No Team"
        });
      }
    }
  }, [taskToEdit, form, isOpen]);


  const handleSubmit = (data: TaskFormValues) => {
    const processedData = {
      ...data,
      teamId: data.teamId === "__none__" ? "" : data.teamId, // Convert back to "" for storage/logic
    };
    onSubmit(processedData, taskToEdit);
    form.reset(); // Resets to defaultValues, including teamId: "__none__"
  };

  const selectedTeamName = useMemo(() => {
    const selectedId = form.watch('teamId');
    if (selectedId === '__none__' || !selectedId) return 'No Team / Personal';
    return teams.find(team => team.id === selectedId)?.name || "No Team / Personal";
  }, [form, teams]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px] bg-card rounded-lg shadow-xl">
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
                    <Textarea
                      placeholder="Add any relevant details or context..."
                      className="resize-none bg-background border-input focus:ring-primary"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input focus:ring-primary">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
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
              {teams.length > 0 && (
                 <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel className="text-foreground/80">Assign to Team</FormLabel>
                      <Popover open={isTeamPopoverOpen} onOpenChange={setIsTeamPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                (field.value === '__none__' || !field.value) && "text-muted-foreground"
                              )}
                            >
                              <span className="flex items-center truncate">
                                {field.value && field.value !== '__none__' && <Users className="mr-2 h-4 w-4 shrink-0" />}
                                {selectedTeamName}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start font-normal"
                                onClick={() => {
                                    field.onChange("__none__");
                                    setIsTeamPopoverOpen(false);
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", (field.value === "__none__" || !field.value) ? "opacity-100" : "opacity-0")} />
                                No Team / Personal
                            </Button>
                            {teams.map((team) => (
                                <Button
                                    key={team.id}
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start font-normal"
                                    onClick={() => {
                                        field.onChange(team.id);
                                        setIsTeamPopoverOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", field.value === team.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex items-center truncate">
                                        <Users className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                        {team.name}
                                    </div>
                                </Button>
                            ))}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DialogFooter className="mt-8">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
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
