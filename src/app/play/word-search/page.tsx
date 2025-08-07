import { generateWordSearch } from "@/ai/flows/generate-word-search";
import { GameClient } from "./game-client";
import { notFound } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const THEMES = ["animals", "space", "food", "sports", "nature", "technology", "movies", "music"];

export default async function WordSearchPage({ searchParams }: { searchParams: { difficulty: 'easy' | 'medium' | 'hard' } }) {
  const { difficulty } = searchParams;
  
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return notFound();
  }
  
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  
  try {
    const { grid, words } = await generateWordSearch({ theme, difficulty });

    if (!grid || !words || grid.length === 0 || words.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Puzzle Generation Failed</AlertTitle>
            <AlertDescription>
              The AI failed to create a puzzle. Please try again.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
            <Link href="/games/word-search">Return to Menu</Link>
          </Button>
        </div>
      );
    }
    
    return <GameClient grid={grid} words={words} theme={theme} difficulty={difficulty} />;
  } catch (error) {
    console.error("Error generating word search:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>
            Something went wrong while generating the puzzle. Please check the server logs and try again.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }
}
