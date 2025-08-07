"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

type GameOverDialogProps = {
    isOpen: boolean;
    time: string;
    difficulty: string;
    theme?: string;
    score?: number;
    possible?: number;
    onClose: () => void;
    gameType: 'word-search' | 'letter-scramble';
    won?: boolean;
};

export function GameOverDialog({ isOpen, time, difficulty, theme, score, possible, onClose, gameType, won = true }: GameOverDialogProps) {
  const router = useRouter();

  const handlePlayAgain = () => {
    router.refresh();
  };

  const handleChangeLevel = () => {
    router.push(`/games/${gameType}`);
  };

  if (!isOpen) {
    return null;
  }
  
  const titleText = () => {
    if (gameType === 'letter-scramble') {
      return won ? "You Won!" : "Time's Up!";
    }
    return "Puzzle Solved!";
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background border-accent shadow-[0_0_20px_theme(colors.accent)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-3xl text-center text-primary">
            {titleText()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-2 capitalize">
            You completed the puzzle on {difficulty} difficulty.
            {theme && <div>Theme: "{theme}"</div>}
            {score !== undefined && possible !== undefined && (
                 <div>You found {score} out of {possible} possible words.</div>
            )}
            <div className="text-accent font-mono text-4xl font-bold py-4">
              {time}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
            <Button onClick={handleChangeLevel} variant="outline" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
                New Game
            </Button>
            <Button onClick={handlePlayAgain} autoFocus>
                Play Same Again
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
