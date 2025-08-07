'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import type { GenerateLetterScrambleOutput } from '@/ai/flows/generate-letter-scramble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RotateCcw, TimerIcon, Wand2, ArrowRight, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GameOverDialog } from '@/components/game-over-dialog';
import { cn } from '@/lib/utils';

type GameClientProps = {
  puzzle: GenerateLetterScrambleOutput;
  difficulty: 'easy' | 'medium' | 'hard';
};

const GAME_DURATION = 120; // 2 minutes

export function GameClient({ puzzle, difficulty }: GameClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameLetters, setGameLetters] = useState(puzzle.letters);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const showMessage = (text: string, type: 'error' | 'success') => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 2000);
  }

  const handleShuffle = () => {
      setGameLetters(prev => [...prev].sort(() => Math.random() - 0.5));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guess = currentGuess.toLowerCase();
    
    if (guess.length === 0) return;

    if (foundWords.includes(guess)) {
      showMessage("Already found!", 'error');
    } else if (puzzle.possibleWords.map(w => w.toLowerCase()).includes(guess)) {
      setFoundWords(prev => [...prev, guess].sort((a,b) => b.length - a.length));
      showMessage("Great word!", 'success');
    } else {
      showMessage("Not in word list.", 'error');
    }
    setCurrentGuess('');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleReset = () => router.refresh();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-8">
       <GameOverDialog
        isOpen={gameOver}
        time={formatTime(GAME_DURATION - timeLeft)}
        difficulty={difficulty}
        score={foundWords.length}
        possible={puzzle.possibleWords.length}
        onClose={() => {}}
        gameType="letter-scramble"
      />
      
      <div className="w-full max-w-md mx-auto">
         <header className="w-full flex justify-between items-center p-4 rounded-lg bg-background/50 backdrop-blur-sm mb-4 z-20">
          <Button variant="outline" size="icon" onClick={() => router.push('/games/letter-scramble')}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
          <div className="flex items-center gap-4 text-accent font-mono text-2xl font-bold">
            <TimerIcon className="h-6 w-6" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Reset</span>
          </Button>
        </header>

        <Card className="bg-background/30 text-center">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Unscramble</CardTitle>
                 <div className="relative h-8 mt-2">
                    <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={cn(
                                "absolute inset-0 flex items-center justify-center font-bold",
                                message.type === 'success' ? 'text-green-400' : 'text-red-400'
                            )}
                        >
                            {message.text}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center gap-2 md:gap-4 my-8">
                    {gameLetters.map((letter, index) => (
                         <motion.div
                            key={`${letter}-${index}`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-lg shadow-lg text-3xl md:text-4xl font-bold"
                        >
                            {letter.toUpperCase()}
                         </motion.div>
                    ))}
                </div>
                
                <form onSubmit={handleSubmit} className="flex gap-2 mt-8">
                    <Input 
                        ref={inputRef}
                        value={currentGuess}
                        onChange={e => setCurrentGuess(e.target.value)}
                        placeholder="Type your word..."
                        className="text-lg text-center tracking-widest"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                    <Button type="submit" size="icon">
                        <ArrowRight />
                    </Button>
                     <Button type="button" variant="outline" size="icon" onClick={handleShuffle}>
                        <Shuffle />
                    </Button>
                </form>

            </CardContent>
        </Card>
      </div>

       <div className="w-full max-w-md mx-auto">
            <Card className="bg-background/30">
                <CardHeader>
                    <CardTitle className="text-xl text-center font-headline">
                        Found Words: {foundWords.length} / {puzzle.possibleWords.length}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 overflow-y-auto pr-2">
                        <ul className="columns-2 md:columns-3 gap-4">
                           {foundWords.map(word => (
                               <motion.li 
                                key={word}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-mono text-lg capitalize"
                               >
                                {word}
                               </motion.li>
                           ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
