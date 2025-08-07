import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Puzzle, Sword } from "lucide-react";
import Link from "next/link";

const games = [
    {
        name: "Word Search",
        description: "Find hidden words in a grid of letters.",
        icon: Search,
        href: "/games/word-search",
        tags: ["classic", "relaxing"],
    },
    {
        name: "Crossword (Coming Soon)",
        description: "Fill in the blanks of a classic crossword puzzle.",
        icon: Puzzle,
        href: "#",
        disabled: true,
        tags: ["coming soon"],
    },
    {
        name: "Letter Scramble (Coming Soon)",
        description: "Make as many words as you can from a set of letters.",
        icon: Sword,
        href: "#",
        disabled: true,
        tags: ["coming soon"],
    }
]

export default function GamesPage() {
    return (
        <div className="text-center">
            <h1 className="text-5xl font-bold font-headline text-primary mb-4">Choose a Puzzle</h1>
            <p className="text-lg text-muted-foreground mb-8">Select a game to start playing.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {games.map((game) => (
                    <Card key={game.name} className="bg-background/50 hover:border-primary transition-colors flex flex-col">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <game.icon className="w-12 h-12 text-accent" />
                            </div>
                            <CardTitle className="font-headline">{game.name}</CardTitle>
                            <CardDescription>{game.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end">
                             <Button asChild disabled={game.disabled} className="w-full mt-4">
                                <Link href={game.href}>Play Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <Button asChild variant="link" className="mt-8">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    )
}
