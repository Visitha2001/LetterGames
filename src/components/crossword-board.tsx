"use client"

import { cn } from "@/lib/utils"
import type { GenerateCrosswordOutput } from "@/ai/flows/generate-crossword";

type CrosswordBoardProps = {
    puzzle: GenerateCrosswordOutput;
    grid: (string | null)[][];
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
    activeCell: { row: number, col: number } | null;
    direction: 'across' | 'down';
    solvedCells: boolean[][];
    onCellClick: (row: number, col: number) => void;
    onInputChange: (row: number, col: number, value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => void;
}

export function CrosswordBoard({ 
    puzzle, 
    grid, 
    inputRefs, 
    activeCell, 
    direction, 
    solvedCells,
    onCellClick, 
    onInputChange, 
    onKeyDown 
}: CrosswordBoardProps) {

    const getClueNumber = (r: number, c: number) => {
        const across = puzzle.clues.across.find(clue => clue.row === r && clue.col === c);
        const down = puzzle.clues.down.find(clue => clue.row === r && clue.col === c);
        return across?.number || down?.number;
    }

    return (
        <div 
            className="p-2 bg-background select-none rounded-md"
            style={{
                border: '1px solid hsl(var(--primary))',
                boxShadow: '0 0 10px hsl(var(--primary))',
            }}
        >
            <div 
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${puzzle.cols}, clamp(20px, 5vw, 40px))`,
                    gridTemplateRows: `repeat(${puzzle.rows}, clamp(20px, 5vw, 40px))`,
                    gap: '2px',
                }}
            >
                {puzzle.grid.map((row, r) =>
                    row.map((cell, c) => {
                        if (cell === null) {
                            return <div key={`${r}-${c}`} className="bg-foreground rounded-sm" />;
                        }

                        const clueNumber = getClueNumber(r, c);
                        const isActive = activeCell?.row === r && activeCell?.col === c;
                        
                        const activeClueInfo = (() => {
                            if (!activeCell) return null;
                            const clueList = direction === 'across' ? puzzle.clues.across : puzzle.clues.down;
                            return clueList.find(clue => 
                                direction === 'across' ?
                                clue.row === activeCell.row && c >= clue.col && c < clue.col + clue.answer.length :
                                clue.col === activeCell.col && r >= clue.row && r < clue.row + clue.answer.length
                            );
                        })();

                        const isHighlighted = !!activeClueInfo;

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={cn(
                                    "relative flex items-center justify-center bg-primary/10 rounded-sm",
                                    isActive && "bg-yellow-400/50",
                                    isHighlighted && !isActive && "bg-primary/30",
                                    solvedCells[r][c] && "!bg-green-500/30",
                                )}
                                onClick={() => onCellClick(r, c)}
                            >
                                {clueNumber && (
                                    <span className="absolute top-0 left-0.5 text-[8px] font-bold text-muted-foreground">{clueNumber}</span>
                                )}
                                <input
                                    ref={el => {
                                        if (inputRefs.current[r]) {
                                            inputRefs.current[r][c] = el;
                                        }
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={grid[r][c] || ''}
                                    onChange={(e) => onInputChange(r, c, e.target.value)}
                                    onKeyDown={(e) => onKeyDown(e, r, c)}
                                    className="w-full h-full bg-transparent text-center text-lg font-bold uppercase text-foreground focus:outline-none"
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
