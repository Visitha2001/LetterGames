'use server';
/**
 * @fileOverview Crossword puzzle generation AI agent.
 *
 * - generateCrossword - A function that generates a crossword puzzle.
 * - GenerateCrosswordInput - The input type for the generateCrossword function.
 * - GenerateCrosswordOutput - The return type for the generateCrossword function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCrosswordInputSchema = z.object({
  theme: z.string().describe('The theme for the crossword puzzle (e.g., "science", "history", "literature").'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the puzzle. This affects grid size and word complexity.'),
});
export type GenerateCrosswordInput = z.infer<typeof GenerateCrosswordInputSchema>;

const ClueSchema = z.object({
  number: z.number().describe('The number of the clue on the grid.'),
  clue: z.string().describe('The clue text.'),
  answer: z.string().describe('The answer to the clue.'),
  row: z.number().describe('The starting row (0-indexed) of the answer on the grid.'),
  col: z.number().describe('The starting column (0-indexed) of the answer on the grid.'),
});

const GenerateCrosswordOutputSchema = z.object({
  grid: z.array(z.array(z.string().nullable())).describe('A 2D array representing the crossword grid. `null` represents a black square, a string represents a letter for solved cells (should be empty string initially).'),
  clues: z.object({
    across: z.array(ClueSchema).describe('The clues for words that go across.'),
    down: z.array(ClueSchema).describe('The clues for words that go down.'),
  }),
  rows: z.number().describe('The number of rows in the grid.'),
  cols: z.number().describe('The number of columns in the grid.'),
});
export type GenerateCrosswordOutput = z.infer<typeof GenerateCrosswordOutputSchema>;

export async function generateCrossword(input: GenerateCrosswordInput): Promise<GenerateCrosswordOutput> {
  return generateCrosswordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCrosswordPrompt',
  input: {schema: GenerateCrosswordInputSchema},
  output: {schema: GenerateCrosswordOutputSchema},
  prompt: `You are a crossword puzzle generation expert. Create a crossword puzzle based on the specified theme and difficulty.

  The theme for the words is: {{{theme}}}
  The difficulty is: {{{difficulty}}}

  - For 'easy' difficulty:
    - Create a 10x10 grid.
    - Use simple words and clues.
  - For 'medium' difficulty:
    - Create a 15x15 grid.
    - Use moderately complex words and clues.
  - For 'hard' difficulty:
    - Create a 20x20 grid.
    - Use complex or longer words and more challenging clues.

  The output should be a valid crossword puzzle structure. The grid should be a 2D array. Blocked-off cells should be \`null\`. Cells that are part of a word should be an empty string to start.

  Provide the clues for 'across' and 'down' words, including the clue number, the clue text, the answer, and the starting row/col for the answer on the grid. Ensure the numbering and placement is accurate for a standard crossword puzzle.
  
  Return the grid dimensions (rows, cols), the grid itself, and the lists of clues as a JSON object.`,
});

const generateCrosswordFlow = ai.defineFlow(
  {
    name: 'generateCrosswordFlow',
    inputSchema: GenerateCrosswordInputSchema,
    outputSchema: GenerateCrosswordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
