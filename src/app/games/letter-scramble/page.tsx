import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword } from "lucide-react";
import Link from "next/link";

export default function LetterScrambleMenuPage() {
    return (
        <div className="w-full max-w-4xl mx-auto">
             <Card className="bg-background/30">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Sword className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline">Letter Scramble</CardTitle>
                    <CardDescription className="text-lg">Select a difficulty to begin.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 text-center">
                    <Link href="/play/letter-scramble?difficulty=easy">
                        <Card className="hover:border-green-500 hover:shadow-[0_0_20px_theme(colors.green.500)] transition-all transform hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-green-500">Easy</CardTitle>
                                <CardDescription>6 Letters</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/play/letter-scramble?difficulty=medium">
                         <Card className="hover:border-yellow-500 hover:shadow-[0_0_20px_theme(colors.yellow.500)] transition-all transform hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-yellow-500">Medium</CardTitle>
                                <CardDescription>7 Letters</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/play/letter-scramble?difficulty=hard">
                         <Card className="hover:border-red-500 hover:shadow-[0_0_20px_theme(colors.red.500)] transition-all transform hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="font-headline text-red-500">Hard</CardTitle>
                                <CardDescription>8 Letters</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </CardContent>
            </Card>
            <div className="text-center mt-8">
                 <Button asChild variant="link">
                    <Link href="/games">Back to All Games</Link>
                </Button>
            </div>
        </div>
    )
}
