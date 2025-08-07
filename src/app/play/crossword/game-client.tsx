'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import type { GenerateCrosswordOutput } from '@/ai/flows/generate-crossword';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw, TimerIcon, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameOverDialog } from '@/components/game-over-dialog';
import { CrosswordBoard } from '@/components/crossword-board';
import { ClueLists } from '@/components/clue-lists';
import { useToast } from '@/hooks/use-toast';

type GameClientProps = {
  puzzle: GenerateCrosswordOutput;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export function GameClient({ puzzle, theme, difficulty }: GameClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [grid, setGrid] = useState(puzzle.grid.map(row => row.map(cell => cell === null ? null : '')));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [solvedCells, setSolvedCells] = useState<boolean[][]>(
    puzzle.grid.map(row => row.map(() => false))
  );

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  
  useEffect(() => {
    inputRefs.current = puzzle.grid.map(() => []);
  }, [puzzle.grid]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameWon) {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameWon]);
  
  const allWords = [...puzzle.clues.across, ...puzzle.clues.down];

  const checkWinCondition = useCallback(() => {
    for (const word of allWords) {
      let currentGuess = '';
      if (word.clue.includes('(across)')) { // A bit of a hack
        for (let i = 0; i < word.answer.length; i++) {
          currentGuess += grid[word.row][word.col + i];
        }
      } else {
        for (let i = 0; i < word.answer.length; i++) {
          currentGuess += grid[word.row + i][word.col];
        }
      }
      if (currentGuess.toUpperCase() !== word.answer.toUpperCase()) {
        return;
      }
    }
    setGameWon(true);
  }, [grid, allWords]);


  const handleInputChange = (row: number, col: number, value: string) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    if (value) {
      // Move to next cell
      let nextRow = row;
      let nextCol = col;
      
      do {
        if (direction === 'across') {
          nextCol++;
          if (nextCol >= puzzle.cols) {
            nextCol = 0;
            nextRow++;
            if(nextRow >= puzzle.rows) nextRow = 0;
          }
        } else {
          nextRow++;
          if (nextRow >= puzzle.rows) {
            nextRow = 0;
            nextCol++;
             if(nextCol >= puzzle.cols) nextCol = 0;
          }
        }
      } while(puzzle.grid[nextRow] && puzzle.grid[nextRow][nextCol] === null);

      inputRefs.current[nextRow]?.[nextCol]?.focus();
      setActiveCell({ row: nextRow, col: nextCol });
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (activeCell?.row === row && activeCell?.col === col) {
      setDirection(prev => (prev === 'across' ? 'down' : 'across'));
    } else {
      setActiveCell({ row, col });
      // Smart direction setting could go here
    }
    inputRefs.current[row]?.[col]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    let nextRow = row;
    let nextCol = col;

    if (e.key === 'Backspace' && grid[row][col] === '') {
       if (direction === 'across') {
          nextCol--;
        } else {
          nextRow--;
        }
    } else {
        switch (e.key) {
            case 'ArrowUp':
                nextRow--;
                setDirection('down');
                break;
            case 'ArrowDown':
                nextRow++;
                setDirection('down');
                break;
            case 'ArrowLeft':
                nextCol--;
                setDirection('across');
                break;
            case 'ArrowRight':
                nextCol++;
                setDirection('across');
                break;
            default:
                return;
        }
    }

    e.preventDefault();

    while(
        nextRow >= 0 && nextRow < puzzle.rows &&
        nextCol >= 0 && nextCol < puzzle.cols &&
        puzzle.grid[nextRow][nextCol] === null
    ) {
         if (e.key === 'Backspace') {
             if (direction === 'across') nextCol--;
             else nextRow--;
         } else {
            switch (e.key) {
                case 'ArrowUp': nextRow--; break;
                case 'ArrowDown': nextRow++; break;
                case 'ArrowLeft': nextCol--; break;
                case 'ArrowRight': nextCol++; break;
            }
         }
    }

    if (nextRow >= 0 && nextRow < puzzle.rows && nextCol >= 0 && nextCol < puzzle.cols) {
        inputRefs.current[nextRow]?.[nextCol]?.focus();
        setActiveCell({ row: nextRow, col: nextCol });
    }
};

const checkPuzzle = () => {
    let correctWords = 0;
    const newSolvedCells = solvedCells.map(r => [...r]);

    [...puzzle.clues.across, ...puzzle.clues.down].forEach(wordInfo => {
        let currentGuess = '';
        const isAcross = puzzle.clues.across.includes(wordInfo);
        
        for (let i = 0; i < wordInfo.answer.length; i++) {
            const r = isAcross ? wordInfo.row : wordInfo.row + i;
            const c = isAcross ? wordInfo.col + i : wordInfo.col;
            currentGuess += grid[r][c];
        }

        if (currentGuess.toUpperCase() === wordInfo.answer.toUpperCase()) {
            correctWords++;
            for (let i = 0; i < wordInfo.answer.length; i++) {
                const r = isAcross ? wordInfo.row : wordInfo.row + i;
                const c = isAcross ? wordInfo.col + i : wordInfo.col;
                newSolvedCells[r][c] = true;
            }
        }
    });

    setSolvedCells(newSolvedCells);
    toast({
        title: "Check Complete",
        description: `You have ${correctWords} correct words so far.`,
    });

    if (correctWords === allWords.length) {
        setGameWon(true);
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

  const activeClue = (() => {
    if (!activeCell) return null;
    const clueList = direction === 'across' ? puzzle.clues.across : puzzle.clues.down;
    return clueList.find(c => 
        direction === 'across' ?
        c.row === activeCell.row && activeCell.col >= c.col && activeCell.col < c.col + c.answer.length :
        c.col === activeCell.col && activeCell.row >= c.row && activeCell.row < c.row + c.answer.length
    );
  })();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-background p-4 gap-8">
      <GameOverDialog
        isOpen={gameWon}
        time={formatTime(timeElapsed)}
        difficulty={difficulty}
        onClose={() => {}}
        gameType="crossword"
      />

      <div className="w-full lg:w-auto flex flex-col items-center">
        <header className="w-full max-w-lg flex justify-between items-center p-4 rounded-lg bg-background/50 backdrop-blur-sm mb-4 z-20">
          <Button variant="outline" size="icon" onClick={() => router.push('/games/crossword')}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
          <div className="flex items-center gap-4 text-accent font-mono text-2xl font-bold">
            <TimerIcon className="h-6 w-6" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Reset</span>
          </Button>
        </header>

        <CrosswordBoard
            puzzle={puzzle}
            grid={grid}
            inputRefs={inputRefs}
            activeCell={activeCell}
            direction={direction}
            solvedCells={solvedCells}
            onCellClick={handleCellClick}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
        />
        <div className="mt-4 w-full max-w-lg">
            <Button onClick={checkPuzzle} className="w-full">
                <Wand2 className="mr-2 h-5 w-5" />
                Check My Answers
            </Button>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <ClueLists
            clues={puzzle.clues}
            activeClue={activeClue}
            onClueClick={(clue) => {
                setActiveCell({row: clue.row, col: clue.col})
                setDirection(puzzle.clues.across.includes(clue) ? 'across' : 'down')
                inputRefs.current[clue.row]?.[clue.col]?.focus();
            }}
        />
      </div>
    </div>
  );
}
