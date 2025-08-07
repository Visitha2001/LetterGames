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
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the puzzle. This affects grid size and word complexity.'),
});
export type GenerateWordSearchInput = z.infer<typeof GenerateWordSearchInputSchema>;

const GenerateWordSearchOutputSchema = z.object({
  grid: z.array(z.array(z.string())).describe('A grid of letters for the word search puzzle. Size depends on difficulty: 10x10 for easy, 15x15 for medium, 20x20 for hard.'),
  words: z.array(z.string()).describe('A list of hidden words in the grid related to the theme. Number of words depends on difficulty: 8-10 for easy, 10-15 for medium, 15-20 for hard.'),
});
export type GenerateWordSearchOutput = z.infer<typeof GenerateWordSearchOutputSchema>;

export async function generateWordSearch(input: GenerateWordSearchInput): Promise<GenerateWordSearchOutput> {
  return generateWordSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordSearchPrompt',
  input: {schema: GenerateWordSearchInputSchema},
  output: {schema: GenerateWordSearchOutputSchema},
  prompt: `You are a word search puzzle generation expert. Create a word search puzzle based on the specified difficulty.

  The theme for the words is: {{{theme}}}
  The difficulty is: {{{difficulty}}}

  - For 'easy' difficulty:
    - Create a 10x10 grid.
    - Generate a list of 8 to 10 simple words.
    - Words can be placed horizontally or vertically only. No diagonal or backward words.
  - For 'medium' difficulty:
    - Create a 15x15 grid.
    - Generate a list of 10 to 15 words of moderate complexity.
    - Words can be placed horizontally, vertically, or diagonally. No backward words.
  - For 'hard' difficulty:
    - Create a 20x20 grid.
    - Generate a list of 15 to 20 complex or longer words.
    - Words can be placed horizontally, vertically, diagonally, and in forward or reverse order.

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
