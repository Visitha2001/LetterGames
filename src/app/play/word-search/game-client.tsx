
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WordSearchBoard } from "@/components/word-search-board";
import { WordList } from "@/components/word-list";
import { GameOverDialog } from "@/components/game-over-dialog";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, TimerIcon } from "lucide-react";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

type GameClientProps = {
  grid: string[][];
  words: string[];
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export function GameClient({ grid, words, theme, difficulty }: GameClientProps) {
  const router = useRouter();
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellPositions, setFoundCellPositions] = useState<Position[]>([]);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
        if(!gameWon) {
            setTimeElapsed((prev) => prev + 1);
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameWon]);


  const checkSelection = useCallback(() => {
    const selectedWord = selectedCells.map(({ row, col }) => grid[row][col]).join("");
    const reversedSelectedWord = [...selectedCells].reverse().map(({ row, col }) => grid[row][col]).join("");

    for (const word of words) {
        if (!foundWords.includes(word) && (word.toUpperCase() === selectedWord || word.toUpperCase() === reversedSelectedWord)) {
            setFoundWords(prev => [...prev, word]);
            setFoundCellPositions(prev => [...prev, ...selectedCells]);
            if (foundWords.length + 1 === words.length) {
                setGameWon(true);
            }
            return;
        }
    }
  }, [selectedCells, grid, words, foundWords]);

  const handleMouseUp = () => {
    if(isDragging) {
        checkSelection();
        setIsDragging(false);
        setSelectedCells([]);
    }
  };
  
  const handleMouseDown = (pos: Position) => {
    setIsDragging(true);
    setSelectedCells([pos]);
  };
  
  const handleMouseEnter = (pos: Position) => {
    if (isDragging && !selectedCells.find(p => p.row === pos.row && p.col === pos.col)) {
        const lastCell = selectedCells[selectedCells.length - 1];
        if (selectedCells.length < 2) {
             setSelectedCells(prev => [...prev, pos]);
        } else {
            const firstCell = selectedCells[0];
            const dx = Math.abs(pos.col - firstCell.col);
            const dy = Math.abs(pos.row - firstCell.row);
            const lastDx = Math.abs(lastCell.col - firstCell.col);
            const lastDy = Math.abs(lastCell.row - firstCell.row);

            if (
              (dx === 0 && lastDx === 0) || // Vertical
              (dy === 0 && lastDy === 0) || // Horizontal
              (dx === dy && lastDx === lastDy) // Diagonal
            ) {
                 setSelectedCells(prev => [...prev, pos]);
            }
        }
    }
  };

  const handleReset = () => {
    router.refresh();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-background p-4 gap-8" onMouseUp={handleMouseUp}>
        <GameOverDialog
            isOpen={gameWon}
            time={formatTime(timeElapsed)}
            difficulty={difficulty}
            onClose={() => {}}
            theme={theme}
            gameType="word-search"
        />

        <div className="w-full lg:w-auto flex flex-col items-center">
            <header className="w-full max-w-lg flex justify-between items-center p-4 rounded-lg bg-background/50 backdrop-blur-sm mb-4 z-20">
              <Button variant="outline" size="icon" onClick={() => router.push('/games/word-search')}>
                <Home className="h-5 w-5"/>
                <span className="sr-only">Home</span>
              </Button>
              <div className="flex items-center gap-4 text-accent font-mono text-2xl font-bold">
                <TimerIcon className="h-6 w-6"/>
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5"/>
                  <span className="sr-only">Reset</span>
              </Button>
            </header>
            <WordSearchBoard 
                grid={grid}
                selectedCells={selectedCells}
                foundCellPositions={foundCellPositions}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
            />
        </div>
        
        <div className="w-full lg:w-64">
          <WordList words={words} foundWords={foundWords} theme={theme} />
        </div>
    </div>
  );
}
