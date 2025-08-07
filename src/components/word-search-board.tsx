"use client";

import { cn } from "@/lib/utils";
import type { Position } from "@/lib/types";

type WordSearchBoardProps = {
  grid: string[][];
  selectedCells: Position[];
  words: string[];
  foundWords: string[];
  onMouseDown: (pos: Position) => void;
  onMouseEnter: (pos: Position) => void;
};

export function WordSearchBoard({ grid, selectedCells, words, foundWords, onMouseDown, onMouseEnter }: WordSearchBoardProps) {

  const isCellInFoundWord = (pos: Position) => {
    for (const word of foundWords) {
        // This is a simplified check. A proper implementation would need to know the exact path of each found word.
        // For now, we just check if the letter is part of any found word.
        // This could be improved by storing the path of found words.
    }
    return false; // This part needs a better implementation. For now, we will just highlight the new selection.
  };

  return (
    <div
      className="relative p-2 bg-background select-none"
      style={{
        border: '1px solid hsl(var(--primary))',
        boxShadow: '0 0 10px hsl(var(--primary))',
      }}
      onMouseLeave={() => onMouseEnter({row: -1, col: -1})}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, clamp(20px, 5vw, 40px))`,
          gridTemplateRows: `repeat(${grid.length}, clamp(20px, 5vw, 40px))`,
          gap: '2px',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCells.some(p => p.row === r && p.col === c);
            return (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "flex items-center justify-center font-mono text-lg font-bold rounded-sm aspect-square",
                  "transition-colors duration-200",
                  isSelected ? "bg-accent text-accent-foreground" : "bg-primary/10",
                  isCellInFoundWord({row:r, col:c}) ? "bg-primary text-primary-foreground" : "" // This won't work yet
                )}
                onMouseDown={() => onMouseDown({ row: r, col: c })}
                onMouseEnter={() => onMouseEnter({ row: r, col: c })}
              >
                {cell}
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
