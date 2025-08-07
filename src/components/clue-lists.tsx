"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import type { GenerateCrosswordOutput } from "@/ai/flows/generate-crossword";

type Clue = GenerateCrosswordOutput['clues']['across'][0];

type ClueListsProps = {
    clues: GenerateCrosswordOutput['clues'];
    activeClue: Clue | null;
    onClueClick: (clue: Clue) => void;
};

export function ClueLists({ clues, activeClue, onClueClick }: ClueListsProps) {
    return (
        <Card className="bg-background/50 backdrop-blur-sm border-accent h-[70vh] flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center text-accent">Clues</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-center text-primary mb-2">Across</h3>
                    <ScrollArea className="flex-grow pr-4">
                        <ul className="space-y-2">
                            {clues.across.map((clue) => (
                                <li
                                    key={`across-${clue.number}`}
                                    onClick={() => onClueClick(clue)}
                                    className={cn(
                                        "p-2 rounded-md cursor-pointer transition-colors",
                                        activeClue?.number === clue.number && activeClue.clue === clue.clue ? "bg-primary/30" : "hover:bg-primary/10"
                                    )}
                                >
                                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-center text-primary mb-2">Down</h3>
                     <ScrollArea className="flex-grow pr-4">
                        <ul className="space-y-2">
                            {clues.down.map((clue) => (
                                <li
                                    key={`down-${clue.number}`}
                                    onClick={() => onClueClick(clue)}
                                     className={cn(
                                        "p-2 rounded-md cursor-pointer transition-colors",
                                        activeClue?.number === clue.number && activeClue.clue === clue.clue ? "bg-primary/30" : "hover:bg-primary/10"
                                    )}
                                >
                                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
