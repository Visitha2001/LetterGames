'use server';
/**
 * @fileOverview Letter Scramble game generation AI agent.
 *
 * - generateLetterScramble - A function that generates a set of letters for the game.
 * - GenerateLetterScrambleInput - The input type for the generateLetterScramble function.
 * - GenerateLetterScrambleOutput - The return type for the generateLetterScramble function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLetterScrambleInputSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the puzzle. This affects the number of letters and complexity of possible words.'),
});
export type GenerateLetterScrambleInput = z.infer<typeof GenerateLetterScrambleInputSchema>;

const GenerateLetterScrambleOutputSchema = z.object({
  letters: z.array(z.string()).describe('An array of letters for the player to use. 6 for easy, 7 for medium, 8 for hard.'),
  possibleWords: z.array(z.string()).describe('A list of all valid English words that can be formed from the given letters.'),
});
export type GenerateLetterScrambleOutput = z.infer<typeof GenerateLetterScrambleOutputSchema>;

export async function generateLetterScramble(input: GenerateLetterScrambleInput): Promise<GenerateLetterScrambleOutput> {
  return generateLetterScrambleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLetterScramblePrompt',
  input: {schema: GenerateLetterScrambleInputSchema},
  output: {schema: GenerateLetterScrambleOutputSchema},
  prompt: `You are a letter scramble puzzle generation expert. Create a puzzle based on the specified difficulty.

  The difficulty is: {{{difficulty}}}

  - For 'easy' difficulty:
    - Provide 6 letters. Ensure there is at least one 5-letter word possible.
  - For 'medium' difficulty:
    - Provide 7 letters. Ensure there is at least one 6-letter word possible.
  - For 'hard' difficulty:
    - Provide 8 letters. Ensure there is at least one 7-letter word possible.
  
  The selection of letters should allow for a good number of possible words, including a mix of common and less common ones.

  Return the array of letters and a comprehensive list of all possible valid English words that can be formed.
  `,
});

const generateLetterScrambleFlow = ai.defineFlow(
  {
    name: 'generateLetterScrambleFlow',
    inputSchema: GenerateLetterScrambleInputSchema,
    outputSchema: GenerateLetterScrambleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
