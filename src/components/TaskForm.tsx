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
import type { Task } from "@/types";
import { useEffect } from "react";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues, existingTask?: Task) => void;
  taskToEdit?: Task;
}

export function TaskForm({ isOpen, onClose, onSubmit, taskToEdit }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        notes: taskToEdit.notes,
      });
    } else {
      form.reset({
        title: "",
        notes: "",
      });
    }
  }, [taskToEdit, form, isOpen]);


  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data, taskToEdit);
    form.reset(); // Reset form after submission
  };

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
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
