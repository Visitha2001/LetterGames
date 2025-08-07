'use server';
/**
 * @fileOverview Word Search generation AI agent.
 *
 * - generateWordSearch - A function that generates a word search puzzle.
 * - GenerateWordSearchInput - The input type for the generateWordSearch function.
 * - GenerateWordSearchOutput - The return type for the generateWordSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordSearchInputSchema = z.object({
  theme: z.string().describe('The theme for the word search puzzle (e.g., "animals", "space", "food").'),
});
export type GenerateWordSearchInput = z.infer<typeof GenerateWordSearchInputSchema>;

const GenerateWordSearchOutputSchema = z.object({
  grid: z.array(z.array(z.string())).describe('A 15x15 grid of letters for the word search puzzle.'),
  words: z.array(z.string()).describe('A list of 10-15 words hidden in the grid related to the theme.'),
});
export type GenerateWordSearchOutput = z.infer<typeof GenerateWordSearchOutputSchema>;

export async function generateWordSearch(input: GenerateWordSearchInput): Promise<GenerateWordSearchOutput> {
  return generateWordSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordSearchPrompt',
  input: {schema: GenerateWordSearchInputSchema},
  output: {schema: GenerateWordSearchOutputSchema},
  prompt: `You are a word search puzzle generation expert. Create a 15x15 grid for a word search puzzle.

  The theme for the words is: {{{theme}}}

  Generate a list of 10 to 15 words related to this theme. The words should be of varying lengths.
  Place these words in the 15x15 grid. The words can be placed horizontally, vertically, or diagonally, and in forward or reverse order.
  Fill the remaining empty cells in the grid with random uppercase letters.

  Return the grid and the list of words as a JSON object.`,
});

const generateWordSearchFlow = ai.defineFlow(
  {
    name: 'generateWordSearchFlow',
    inputSchema: GenerateWordSearchInputSchema,
    outputSchema: GenerateWordSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
