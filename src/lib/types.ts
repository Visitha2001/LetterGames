export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export type MazeCell = '#' | ' ' | 'S' | 'E';
export type MazeGrid = MazeCell[][];
export type Position = { row: number; col: number };
export type GameStatus = 'playing' | 'won' | 'paused';
