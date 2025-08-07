'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import type { GenerateLetterScrambleOutput } from '@/ai/flows/generate-letter-scramble';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RotateCcw, TimerIcon, Shuffle, Delete } from 'lucide-react';
import { GameOverDialog } from '@/components/game-over-dialog';
import { cn } from '@/lib/utils';

type GameClientProps = {
  puzzle: GenerateLetterScrambleOutput;
  difficulty: 'easy' | 'medium' | 'hard';
};

const GAME_DURATION = 300; // 5 minutes

type LetterState = {
    char: string;
    id: number;
    used: boolean;
}

export function GameClient({ puzzle, difficulty }: GameClientProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<LetterState[]>([]);
  const [gameLetters, setGameLetters] = useState<LetterState[]>(
      puzzle.letters.map((char, index) => ({ char, id: index, used: false }))
  );
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
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
      setTimeout(() => setMessage(null), 1500);
  }

  const handleShuffle = () => {
      setGameLetters(prev => [...prev].sort(() => Math.random() - 0.5));
  }
  
  const handleLetterClick = (letter: LetterState) => {
    if (letter.used) return;

    setCurrentGuess(prev => [...prev, letter]);
    setGameLetters(prev => prev.map(l => l.id === letter.id ? {...l, used: true} : l));
  }

  const handleBackspace = () => {
      if(currentGuess.length === 0) return;
      const lastLetter = currentGuess[currentGuess.length - 1];
      setCurrentGuess(prev => prev.slice(0, -1));
      setGameLetters(prev => prev.map(l => l.id === lastLetter.id ? {...l, used: false} : l));
  }

  const handleSubmit = () => {
    const guessWord = currentGuess.map(l => l.char).join('').toLowerCase();
    
    if (guessWord.length === 0) return;

    if (foundWords.includes(guessWord)) {
      showMessage("Already found!", 'error');
    } else if (puzzle.possibleWords.map(w => w.toLowerCase()).includes(guessWord)) {
      setFoundWords(prev => [...prev, guessWord].sort((a,b) => b.length - a.length));
      showMessage("Great word!", 'success');
    } else {
      showMessage("Not a valid word.", 'error');
    }
    
    // Reset for next guess
    setCurrentGuess([]);
    setGameLetters(prev => prev.map(l => ({...l, used: false})));
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
                {/* Current Guess Display */}
                <div className="flex justify-center items-center gap-2 h-20 my-4 bg-primary/10 rounded-lg">
                  {currentGuess.map((letter) => (
                    <motion.div
                      key={letter.id}
                      layoutId={`letter-box-${letter.id}`}
                      className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-lg shadow-lg text-3xl md:text-4xl font-bold"
                    >
                      {letter.char.toUpperCase()}
                    </motion.div>
                  ))}
                </div>

                {/* Available Letters */}
                <div className="flex justify-center items-center gap-2 md:gap-3 my-8">
                    {gameLetters.map((letter) => (
                         <motion.div
                            key={letter.id}
                            layoutId={`letter-box-${letter.id}`}
                         >
                            <Button
                                variant="outline"
                                disabled={letter.used}
                                onClick={() => handleLetterClick(letter)}
                                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-background/80 text-foreground rounded-lg shadow-lg text-2xl md:text-3xl font-bold disabled:opacity-30"
                            >
                                {letter.char.toUpperCase()}
                            </Button>
                         </motion.div>
                    ))}
                </div>
                
                <div className="flex gap-2 mt-8">
                    <Button onClick={handleBackspace} variant="outline" size="icon" className="w-16">
                        <Delete />
                    </Button>
                    <Button onClick={handleSubmit} className="flex-grow">
                        Submit Word
                    </Button>
                     <Button type="button" variant="outline" size="icon" onClick={handleShuffle} className="w-16">
                        <Shuffle />
                    </Button>
                </div>

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
