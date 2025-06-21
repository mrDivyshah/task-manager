
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
  // We ask for a string so we can parse it manually for robustness.
  output: {schema: z.string()},
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

    try {
      // The model might still wrap the JSON in markdown, so we extract it.
      const jsonRegex = /```(json)?\s*([\s\S]*?)\s*```/;
      const match = jsonRegex.exec(output);
      
      let jsonString = output;
      if (match && match[2]) {
        jsonString = match[2];
      }

      // Sometimes the model might just return the array without markdown.
      // Let's find the start of the array and the end.
      const startIndex = jsonString.indexOf('[');
      const endIndex = jsonString.lastIndexOf(']');
      if (startIndex === -1 || endIndex === -1) {
          throw new Error('Valid JSON array not found in the AI response.');
      }
      
      const potentialJson = jsonString.substring(startIndex, endIndex + 1);

      const parsedJson = JSON.parse(potentialJson);

      // Now, validate the parsed JSON against our Zod schema.
      // This will throw an error if the structure doesn't match.
      const validatedOutput = SmartSortOutputSchema.parse(parsedJson);

      return validatedOutput;
    } catch (e: any) {
      console.error("Failed to parse or validate AI output for smart sort:", e);
      console.error("Raw AI Output:", output);
      // Re-throw a more user-friendly error that will be caught by the action.
      throw new Error(`AI returned data in an unexpected format. Details: ${e.message}`);
    }
  }
);
