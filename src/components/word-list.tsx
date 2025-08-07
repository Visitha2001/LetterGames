"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type WordListProps = {
    words: string[];
    foundWords: string[];
    theme: string;
}

export function WordList({ words, foundWords, theme }: WordListProps) {
    return (
        <Card className="bg-background/50 backdrop-blur-sm border-accent">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center text-accent capitalize">
                    Theme: {theme}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <h3 className="text-lg font-bold mb-4 text-center text-primary">Words to Find:</h3>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-center">
                    {words.map(word => (
                        <li 
                            key={word}
                            className={cn(
                                "font-mono transition-all duration-300",
                                foundWords.includes(word) ? "line-through text-muted-foreground" : "text-foreground"
                            )}
                        >
                            {word.toUpperCase()}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
