import { generateMaze } from "@/ai/flows/generate-maze";
import { Difficulty, DIFFICULTIES } from "@/lib/types";
import { GameClient } from "./game-client";
import { notFound } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type GamePageProps = {
  params: {
    difficulty: Difficulty;
  };
};

export default async function GamePage({ params }: GamePageProps) {
  const { difficulty } = params;

  if (!DIFFICULTIES.includes(difficulty)) {
    notFound();
  }
  
  try {
    const { mazeData, isSolvable } = await generateMaze({ difficulty });

    if (!isSolvable || !mazeData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Maze Generation Failed</AlertTitle>
            <AlertDescription>
              The AI failed to create a solvable maze. Please try again.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      );
    }
    
    return <GameClient mazeData={mazeData} difficulty={difficulty} />;
  } catch (error) {
    console.error("Error generating maze:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>
            Something went wrong while generating the maze. Please check the server logs and try again.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }
}
