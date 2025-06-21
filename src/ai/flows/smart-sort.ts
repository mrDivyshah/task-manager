
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
  priority: z.string().describe('The priority of the task (must be one of "high", "medium", or "low").'),
})).describe('An array of tasks with their categories and priorities.');
export type SmartSortOutput = z.infer<typeof SmartSortOutputSchema>;

export async function smartSort(input: SmartSortInput): Promise<SmartSortOutput> {
  return smartSortFlow(input);
}

const smartSortPrompt = ai.definePrompt({
  name: 'smartSortPrompt',
  input: {schema: SmartSortInputSchema},
  output: {schema: SmartSortOutputSchema},
  system: `You are an intelligent task management assistant. Your purpose is to analyze a list of tasks and return structured JSON data containing a category and a priority for each task. The priority you assign MUST be one of three values: "high", "medium", or "low". Do not use any other values for priority.`,
  prompt: `Analyze the following tasks. For each task, determine a relevant category and assign a priority.

Prioritization Guidelines:
- 'high': Critical, urgent, time-sensitive, or high-impact tasks.
- 'medium': Important but not immediately urgent tasks.
- 'low': Tasks that can be done at a lower urgency.

Tasks to process:
{{#each this}}
- Task ID: {{id}}
  Title: "{{title}}"
  Notes: "{{notes}}"
{{/each}}

Your response MUST be a valid JSON array of objects, where each object corresponds to an input task. Each object MUST contain the 'id', 'category', and 'priority' fields.

IMPORTANT: Your entire output must be ONLY the JSON array. Do not include any introductory text, closing remarks, or markdown code fences like \`\`\`json.
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
    // Ensure the output matches the array structure, even if it's empty (e.g. if the model returns an empty array for some reason)
    if (!Array.isArray(output)) {
        throw new Error('AI model output was not an array as expected for smart sort.');
    }
    return output;
  }
);

