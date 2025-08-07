// src/ai/flows/generate-maze.ts
'use server';
/**
 * @fileOverview Maze generation AI agent.
 *
 * - generateMaze - A function that generates a maze.
 * - GenerateMazeInput - The input type for the generateMaze function.
 * - GenerateMazeOutput - The return type for the generateMaze function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMazeInputSchema = z.object({
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the maze.'),
});
export type GenerateMazeInput = z.infer<typeof GenerateMazeInputSchema>;

const GenerateMazeOutputSchema = z.object({
  mazeData: z.string().describe('A string representation of the maze data.'),
  isSolvable: z.boolean().describe('Whether the maze is solvable or not.'),
});
export type GenerateMazeOutput = z.infer<typeof GenerateMazeOutputSchema>;

export async function generateMaze(input: GenerateMazeInput): Promise<GenerateMazeOutput> {
  return generateMazeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMazePrompt',
  input: {schema: GenerateMazeInputSchema},
  output: {schema: GenerateMazeOutputSchema},
  prompt: `You are a maze generation expert. You will generate a unique and solvable maze based on the difficulty requested by the user.

  The maze should be represented as a string where:
  - 'S' represents the start point.
  - 'E' represents the end point.
  - '#' represents a wall.
  - ' ' represents an open path.

  The maze dimensions should be based on the difficulty:
  - easy: 10x10
  - medium: 15x15
  - hard: 20x20

  The entire maze must be enclosed by walls ('#').
  The start ('S') and end ('E') points must be on the outer edge of the maze, not in the middle.
  The maze should be solvable, meaning there is at least one path from 'S' to 'E'.

  Difficulty: {{{difficulty}}}

  Return the mazeData and isSolvable as a JSON object. Ensure the mazeData is a single string with newline characters separating the rows.`,
});

const generateMazeFlow = ai.defineFlow(
  {
    name: 'generateMazeFlow',
    inputSchema: GenerateMazeInputSchema,
    outputSchema: GenerateMazeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
