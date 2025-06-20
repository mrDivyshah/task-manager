// src/ai/flows/smart-sort.ts
'use server';
/**
 * @fileOverview A flow to categorize and prioritize tasks based on the content of their notes.
 *
 * - smartSort - A function that handles the task categorization and prioritization process.
 * - SmartSortInput - The input type for the smartSort function.
 * - SmartSortOutput - The return type for the smartSort function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

const SmartSortInputSchema = z.array(TaskSchema).describe('An array of tasks to categorize and prioritize.');
export type SmartSortInput = z.infer<typeof SmartSortInputSchema>;

const SmartSortOutputSchema = z.array(z.object({
  id: z.string(),
  category: z.string().describe('The category of the task.'),
  priority: z.string().describe('The priority of the task (high, medium, low).'),
})).describe('An array of tasks with their categories and priorities.');
export type SmartSortOutput = z.infer<typeof SmartSortOutputSchema>;

export async function smartSort(input: SmartSortInput): Promise<SmartSortOutput> {
  return smartSortFlow(input);
}

const smartSortPrompt = ai.definePrompt({
  name: 'smartSortPrompt',
  input: {schema: SmartSortInputSchema},
  output: {schema: SmartSortOutputSchema},
  prompt: `You are a task management expert. You will be provided with a list of tasks, and you will categorize and prioritize each task based on the content of the task notes.

Tasks:
{{#each this}}
Task ID: {{id}}
Title: {{title}}
Notes: {{notes}}
{{/each}}

Prioritization should be based on the impact or urgency conveyed in the notes. A task should be marked as 'high' priority if it relates to an impending deadline, financial cost or opportunity, serious problem, or a critical blocking issue. It should be marked as 'medium' if is is important, but not urgent. Otherwise it should be marked as 'low'.

{{#each this}}
{ id:"{{id}}", category:"", priority:"" }
{{/each}}

Output in JSON format:
`,
});

const smartSortFlow = ai.defineFlow(
  {
    name: 'smartSortFlow',
    inputSchema: SmartSortInputSchema,
    outputSchema: SmartSortOutputSchema,
  },
  async input => {
    const {output} = await smartSortPrompt(input);
    return output!;
  }
);
