
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
  prompt: `You are a task management expert.
For each task provided below, you must determine a relevant 'category' (e.g., "Work", "Personal", "Finance") and assign a 'priority'. The priority MUST be one of "high", "medium", or "low".

Prioritization Guidelines:
- 'high': Tasks that are urgent, have impending deadlines, significant financial implications, critical problems, or are blocking other tasks.
- 'medium': Important tasks that are not immediately urgent but should be addressed soon.
- 'low': All other tasks that can be done at a lower urgency.

Tasks to process:
{{#each this}}
- Task ID: {{id}}
  Title: "{{title}}"
  Notes: "{{notes}}"
{{/each}}

Your response MUST be a valid JSON array. Each object in the array must correspond to one of the input tasks. Each object MUST contain exactly three fields:
1.  "id": (string) The original ID of the task.
2.  "category": (string) The category you've assigned.
3.  "priority": (string) The priority you've assigned. This MUST be "high", "medium", or "low".

Example of the EXACT expected JSON output format:
[
  { "id": "task_id_1", "category": "Work", "priority": "high" },
  { "id": "task_id_2", "category": "Home Errands", "priority": "medium" },
  { "id": "task_id_3", "category": "Finance", "priority": "low" }
]

Ensure your output is ONLY this JSON array. Do NOT include any other text, explanations, or markdown formatting (like \`\`\`json ... \`\`\`) around the JSON. The entire response should be the JSON array itself.
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

