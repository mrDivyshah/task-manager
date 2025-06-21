
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
  priority: z.enum(["high", "medium", "low"]).describe('The priority of the task (must be one of "high", "medium", or "low").'),
})).describe('An array of tasks with their categories and priorities.');
export type SmartSortOutput = z.infer<typeof SmartSortOutputSchema>;

export async function smartSort(input: SmartSortInput): Promise<SmartSortOutput> {
  return smartSortFlow(input);
}

const smartSortPrompt = ai.definePrompt({
  name: 'smartSortPrompt',
  input: {schema: SmartSortInputSchema},
  output: {schema: SmartSortOutputSchema}, // Ask for structured JSON directly.
  system: `You are an intelligent task management assistant. Your purpose is to analyze a list of tasks and return a valid JSON array of objects.
Each object in the array must correspond to one of the input tasks.
Each object MUST contain three string fields: 'id', 'category', and 'priority'.
The 'id' field must exactly match the ID of the original task.
The 'priority' field MUST be one of these three values: "high", "medium", or "low". Do not use any other values for priority.
Prioritization Guidelines:
- 'high': For critical, urgent, time-sensitive, or high-impact tasks.
- 'medium': For important but not immediately urgent tasks.
- 'low': For tasks that can be done at a lower urgency.
Your entire output must be ONLY the JSON array. Do not include any introductory text, closing remarks, or markdown. Your response must be a valid JSON array and nothing else.`,
  prompt: `Analyze the following tasks and return the JSON array as instructed:
{{#each this}}
- Task ID: {{id}}, Title: "{{title}}", Notes: "{{notes}}"
{{/each}}
`,
});

const smartSortFlow = ai.defineFlow(
  {
    name: 'smartSortFlow',
    inputSchema: SmartSortInputSchema,
    outputSchema: SmartSortOutputSchema,
  },
  async input => {
    const { output } = await smartSortPrompt(input);
    if (!output) {
      throw new Error('AI model did not return a parsable output for smart sort.');
    }
    // Genkit handles the parsing and validation when output.schema is provided.
    return output;
  }
);
