
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
  prompt: `You are a task management expert. You will be provided with a list of tasks. Your goal is to:
1.  Determine a relevant 'category' for each task based on its content (e.g., "Work", "Personal", "Finance", "Project X").
2.  Assign a 'priority' to each task: "high", "medium", or "low".

Prioritization Guidelines:
-   'high': Impending deadlines, significant financial implications, critical problems, or tasks blocking others.
-   'medium': Important tasks that are not immediately urgent.
-   'low': All other tasks.

Input Tasks:
{{#each this}}
- Task ID: {{id}}
  Title: {{title}}
  Notes: {{notes}}
{{/each}}

Please provide your response as a JSON array. Each object in the array must correspond to one of the input tasks and MUST contain the following fields:
-   "id": (string) The original ID of the task.
-   "category": (string) The category you've assigned.
-   "priority": (string) The priority you've assigned ("high", "medium", or "low").

Example of the expected JSON output format:
[
  { "id": "task_id_1", "category": "Work", "priority": "high" },
  { "id": "task_id_2", "category": "Home Errands", "priority": "medium" }
]

Ensure your output is ONLY this JSON array. Do not include any other text or explanations.
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
    if (!output) {
      throw new Error('AI model did not return an output for smart sort.');
    }
    return output;
  }
);

