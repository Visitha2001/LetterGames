"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { MazeGrid, Position, GameStatus, Difficulty } from "@/lib/types";
import { MazeBoard } from "@/components/maze-board";
import { GameOverDialog } from "@/components/game-over-dialog";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Home, TimerIcon } from "lucide-react";

type GameClientProps = {
  mazeData: string;
  difficulty: Difficulty;
};

const parseMazeData = (mazeData: string): { grid: MazeGrid, start: Position, end: Position } | null => {
  const rows = mazeData.trim().split('\n').map(row => row.split(''));
  if (rows.length === 0 || rows[0].length === 0) return null;
  
  const grid = rows as MazeGrid;
  let start: Position | null = null;
  let end: Position | null = null;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'S') start = { row: r, col: c };
      if (grid[r][c] === 'E') end = { row: r, col: c };
    }
  }

  if (!start || !end) return null;
  return { grid, start, end };
};


export function GameClient({ mazeData, difficulty }: GameClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<{
    grid: MazeGrid;
    startPosition: Position;
    endPosition: Position;
    playerPosition: Position;
  } | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  useEffect(() => {
    const parsed = parseMazeData(mazeData);
    if (parsed) {
      setGameState({
        grid: parsed.grid,
        startPosition: parsed.start,
        endPosition: parsed.end,
        playerPosition: parsed.start,
      });
      setTimeElapsed(0);
      setGameStatus("playing");
    } else {
      toast({
        variant: "destructive",
        title: "Error Parsing Maze",
        description: "Could not initialize the maze. Please try another.",
      });
      router.push('/');
    }
  }, [mazeData, router, toast]);

  useEffect(() => {
    if (gameStatus !== "playing") return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStatus]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!gameState || gameStatus !== 'playing') return;

    const { grid, playerPosition } = gameState;
    const newPos = { row: playerPosition.row + dy, col: playerPosition.col + dx };

    if (
      newPos.row >= 0 && newPos.row < grid.length &&
      newPos.col >= 0 && newPos.col < grid[0].length &&
      grid[newPos.row][newPos.col] !== '#'
    ) {
      setGameState(prev => prev ? { ...prev, playerPosition: newPos } : null);

      if (grid[newPos.row][newPos.col] === 'E') {
        setGameStatus('won');
      }
    }
  }, [gameState, gameStatus]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "ArrowUp": movePlayer(0, -1); break;
        case "ArrowDown": movePlayer(0, 1); break;
        case "ArrowLeft": movePlayer(-1, 0); break;
        case "ArrowRight": movePlayer(1, 0); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({ row: touch.clientY, col: touch.clientX });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      const touch = e.changedTouches[0];
      const endPos = { row: touch.clientY, col: touch.clientX };
      const dx = endPos.col - touchStart.col;
      const dy = endPos.row - touchStart.row;
      
      if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
        if (Math.abs(dx) > 30) movePlayer(dx > 0 ? 1 : -1, 0);
      } else { // Vertical swipe
        if (Math.abs(dy) > 30) movePlayer(0, dy > 0 ? 1 : -1);
      }
      setTouchStart(null);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, movePlayer]);


  const handleReset = () => {
    if (!gameState) return;
    setGameState(prev => prev ? { ...prev, playerPosition: prev.startPosition } : null);
    setTimeElapsed(0);
    setGameStatus("playing");
  };

  const handlePauseToggle = () => {
    setGameStatus(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!gameState) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
        <GameOverDialog
            isOpen={gameStatus === 'won'}
            time={formatTime(timeElapsed)}
            difficulty={difficulty}
            onClose={() => setGameStatus('paused')}
        />
        
        <header className="w-full max-w-4xl flex justify-between items-center p-4 rounded-lg bg-background/50 backdrop-blur-sm mb-4 z-20">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <Home className="h-5 w-5"/>
            <span className="sr-only">Home</span>
          </Button>
          <div className="flex items-center gap-4 text-accent font-mono text-2xl font-bold">
            <TimerIcon className="h-6 w-6"/>
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePauseToggle}>
              {gameStatus === 'playing' ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
              <span className="sr-only">{gameStatus === 'playing' ? 'Pause' : 'Play'}</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="h-5 w-5"/>
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </header>

        <MazeBoard 
            grid={gameState.grid} 
            playerPosition={gameState.playerPosition}
            isPaused={gameStatus === 'paused'}
        />

        <footer className="mt-4 text-center text-muted-foreground z-20">
            <p className="hidden md:block">Use arrow keys to move. Or swipe on mobile.</p>
            <p className="capitalize">Difficulty: {difficulty}</p>
        </footer>
    </div>
  );
}
