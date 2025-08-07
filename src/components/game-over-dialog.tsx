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
    difficulty: string; // Using string for theme now
    onClose: () => void;
};

export function GameOverDialog({ isOpen, time, difficulty, onClose }: GameOverDialogProps) {
  const router = useRouter();

  const handlePlayAgain = () => {
    router.refresh();
  };

  const handleChangeLevel = () => {
    router.push("/");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background border-accent shadow-[0_0_20px_theme(colors.accent)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-3xl text-center text-primary">
            Puzzle Solved!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-2">
            You found all the words for the theme "{difficulty}".
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
