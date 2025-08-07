"use client";

import type { MazeGrid, Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

type MazeBoardProps = {
  grid: MazeGrid;
  playerPosition: Position;
  isPaused: boolean;
};

export function MazeBoard({ grid, playerPosition, isPaused }: MazeBoardProps) {
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    const updateSize = () => {
      if (grid && grid.length > 0 && grid[0].length > 0) {
        const availableWidth = window.innerWidth - 32; 
        const availableHeight = window.innerHeight - 200;
        
        const size = Math.floor(Math.min(
          24, // max size
          availableWidth / grid[0].length,
          availableHeight / grid.length
        ));
        setCellSize(size > 4 ? size : 4);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [grid]);

  const wallStyle = {
     boxShadow: '0 0 2px hsl(var(--primary)), 0 0 5px hsl(var(--primary)), inset 0 0 1px hsl(var(--primary))',
  };
  
  return (
    <div
      className="relative bg-black/20 p-2"
      style={{
        border: '1px solid hsl(var(--primary))',
        boxShadow: '0 0 10px hsl(var(--primary))',
      }}
    >
      <div
        className="relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${grid.length}, ${cellSize}px)`,
        }}
      >
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <p className="text-4xl font-headline text-white animate-pulse">PAUSED</p>
          </div>
        )}

        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn("flex items-center justify-center", {
                "bg-primary": cell === "#",
              })}
              style={cell === "#" ? wallStyle : {}}
            >
              {cell === "S" && <span className="text-primary font-bold z-10 animate-pulse text-sm" style={{fontSize: `${cellSize * 0.6}px`}}>S</span>}
              {cell === "E" && <span className="text-accent font-bold z-10 animate-pulse text-sm" style={{fontSize: `${cellSize * 0.6}px`}}>E</span>}
            </div>
          ))
        )}
        
        <div
          className="absolute rounded-full bg-accent z-10"
          style={{
            width: `${cellSize * 0.7}px`,
            height: `${cellSize * 0.7}px`,
            top: `${playerPosition.row * cellSize + cellSize * 0.15}px`,
            left: `${playerPosition.col * cellSize + cellSize * 0.15}px`,
            transition: 'top 0.1s linear, left 0.1s linear',
            boxShadow: '0 0 8px hsl(var(--accent))',
          }}
          aria-label="player"
        />
      </div>
    </div>
  );
}
