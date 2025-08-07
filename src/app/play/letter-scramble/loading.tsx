import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <Loader2 className="h-16 w-16 animate-spin mb-4" />
      <h1 className="text-2xl font-headline">Generating Puzzle...</h1>
      <p className="text-muted-foreground">The AI is scrambling the letters for you.</p>
    </div>
  );
}
