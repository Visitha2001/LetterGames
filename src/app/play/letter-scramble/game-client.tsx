'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import type { GenerateLetterScrambleOutput } from '@/ai/flows/generate-letter-scramble';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RotateCcw, TimerIcon, Shuffle } from 'lucide-react';
import { GameOverDialog } from '@/components/game-over-dialog';
import { cn } from '@/lib/utils';

type GameClientProps = {
  puzzle: GenerateLetterScrambleOutput;
  difficulty: 'easy' | 'medium' | 'hard';
};

const GAME_DURATION = 300; // 5 minutes
const WORDS_TO_WIN = 15;

type LetterState = {
    char: string;
    id: number;
    angle: number;
}

export function GameClient({ puzzle, difficulty }: GameClientProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectionPath, setSelectionPath] = useState<number[]>([]); // Array of letter IDs
  const [linePoints, setLinePoints] = useState<string>("");

  const [gameLetters, setGameLetters] = useState<LetterState[]>([]);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const letterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const setupLetters = useCallback(() => {
    const newLetters = puzzle.letters.map((char, index) => ({
        char,
        id: index,
        angle: (360 / puzzle.letters.length) * index,
    }));
    setGameLetters(newLetters);
    letterRefs.current = new Array(newLetters.length);
  }, [puzzle.letters]);

  useEffect(() => {
    setupLetters();
  }, [setupLetters]);


  useEffect(() => {
    if (gameOver) return;
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
  }, [gameOver]);

  useEffect(() => {
    if (foundWords.length >= WORDS_TO_WIN) {
      setGameWon(true);
      setGameOver(true);
    }
  }, [foundWords]);
  
  const updateLine = useCallback(() => {
      if (!boardRef.current || selectionPath.length === 0) {
          setLinePoints("");
          return;
      }
      const boardRect = boardRef.current.getBoundingClientRect();
      const points = selectionPath.map(id => {
          const ref = letterRefs.current[id];
          if (!ref) return "";
          const rect = ref.getBoundingClientRect();
          const x = rect.left + rect.width / 2 - boardRect.left;
          const y = rect.top + rect.height / 2 - boardRect.top;
          return `${x},${y}`;
      }).join(" ");
      setLinePoints(points);
  }, [selectionPath]);

  useEffect(() => {
      updateLine();
  }, [selectionPath, updateLine]);


  const showMessage = (text: string, type: 'error' | 'success') => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 1500);
  }

  const handleShuffle = () => {
      setGameLetters(prev => [...prev].sort(() => Math.random() - 0.5));
  }
  
  const handlePointerDown = (letterId: number) => {
    setIsDragging(true);
    setSelectionPath([letterId]);
  };
  
  const handlePointerEnter = (letterId: number) => {
    if (isDragging && !selectionPath.includes(letterId)) {
        setSelectionPath(prev => [...prev, letterId]);
    }
  };
  
  const handlePointerUp = () => {
    if (!isDragging) return;
    
    const guessWord = selectionPath.map(id => gameLetters.find(l => l.id === id)?.char).join('').toLowerCase();
    
    if (guessWord.length > 1) {
        if (foundWords.includes(guessWord)) {
          showMessage("Already found!", 'error');
        } else if (puzzle.possibleWords.map(w => w.toLowerCase()).includes(guessWord)) {
          setFoundWords(prev => [...prev, guessWord].sort((a,b) => b.length - a.length));
          showMessage("Great word!", 'success');
        } else {
          showMessage("Not a valid word.", 'error');
        }
    }
    
    setIsDragging(false);
    setSelectionPath([]);
  };

  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleReset = () => router.refresh();
  
  const getGuessPreview = () => {
    return selectionPath.map(id => gameLetters.find(l => l.id === id)?.char).join('').toUpperCase();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-4" onPointerUp={handlePointerUp}>
       <GameOverDialog
        isOpen={gameOver}
        time={formatTime(GAME_DURATION - timeLeft)}
        difficulty={difficulty}
        score={foundWords.length}
        possible={WORDS_TO_WIN}
        onClose={() => {}}
        gameType="letter-scramble"
        won={gameWon}
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
                {/* Current Guess Preview */}
                <div className="h-16 flex items-center justify-center text-3xl font-bold font-mono tracking-widest text-primary bg-primary/10 rounded-lg">
                    {getGuessPreview() || <span className="text-muted-foreground text-lg">Draw a word</span>}
                </div>
               
                {/* Letter Board */}
                <div 
                    ref={boardRef}
                    className="relative w-72 h-72 mx-auto my-8"
                    onPointerLeave={() => isDragging && handlePointerUp()}
                >
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 288 288"
                    >
                        {linePoints && (
                             <polyline
                                points={linePoints}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-70"
                            />
                        )}
                    </svg>
                    {gameLetters.map((letter, index) => {
                        const isSelected = selectionPath.includes(letter.id);
                        return (
                            <button
                                key={letter.id}
                                ref={el => letterRefs.current[index] = el}
                                onPointerDown={() => handlePointerDown(letter.id)}
                                onPointerEnter={() => handlePointerEnter(letter.id)}
                                className={cn(
                                    "absolute flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-3xl font-bold cursor-pointer select-none touch-none",
                                    "transition-colors duration-150",
                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground'
                                )}
                                style={{
                                    top: `calc(50% - 2rem)`,
                                    left: `calc(50% - 2rem)`,
                                    transform: `rotate(${letter.angle}deg) translate(88px) rotate(-${letter.angle}deg)`,
                                }}
                            >
                                {letter.char.toUpperCase()}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                     <Button type="button" variant="outline" onClick={handleShuffle}>
                        <Shuffle className="mr-2" />
                        Shuffle Letters
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="w-full max-w-md mx-auto">
            <Card className="bg-background/30">
                <CardHeader>
                    <CardTitle className="text-xl text-center font-headline">
                        Found Words: {foundWords.length} / {WORDS_TO_WIN}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 overflow-y-auto pr-2">
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
