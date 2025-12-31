'use client';

import { useState, useEffect } from 'react';
import { getDueWords, submitReview } from '@/app/actions';
import { TestCard } from '@/components/TestCard';
import { Navigation } from '@/components/Navigation';
import { Loader2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestPage() {
    const [words, setWords] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Array<{ word: any; isCorrect: boolean }>>([]);
    const [finished, setFinished] = useState(false);

    const router = useRouter();

    useEffect(() => {
        async function init() {
            setLoading(true);
            const due = await getDueWords();
            setWords(due);
            setLoading(false);
        }
        init();
    }, []);

    const handleResult = async (isCorrect: boolean) => {
        const currentWord = words[currentIndex];

        // 1. Record Result
        setResults(prev => [...prev, { word: currentWord, isCorrect }]);

        // 2. Submit to backend
        submitReview(currentWord.id, isCorrect);

        // 3. Move next
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setFinished(true);
        }
    };

    const handlePracticeForgotten = () => {
        const forgottenWords = results
            .filter(r => !r.isCorrect)
            .map(r => r.word); // Reuse the word objects

        if (forgottenWords.length > 0) {
            setWords(forgottenWords);
            setCurrentIndex(0);
            setResults([]);
            setFinished(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" />
            </div>
        );
    }

    if (finished) {
        const recalled = results.filter(r => r.isCorrect);
        const forgotten = results.filter(r => !r.isCorrect);

        return (
            <div className="min-h-screen bg-background px-6 py-12 flex flex-col items-center gap-8 pb-32">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Session Complete!</h1>
                    <p className="text-zinc-500">Here's how you performed</p>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">{recalled.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Recalled</div>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-1">{forgotten.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Forgot</div>
                    </div>
                </div>

                {/* Detailed Lists */}
                <div className="w-full max-w-sm space-y-8">
                    {forgotten.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-orange-400">Needs Practice</h3>
                                <button
                                    onClick={handlePracticeForgotten}
                                    className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full transition-colors border border-orange-500/20"
                                >
                                    Practice Now
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {forgotten.map((item, i) => (
                                    <div key={i} className="bg-zinc-900/30 p-4 rounded-xl border border-orange-500/10 flex justify-between items-center">
                                        <div className="font-medium text-zinc-200 capitalize">{item.word.word}</div>
                                        <div className="text-sm text-zinc-500">{item.word.meaning}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recalled.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-green-400">Recalled</h3>
                            <div className="flex flex-col gap-2">
                                {recalled.map((item, i) => (
                                    <div key={i} className="bg-zinc-900/30 p-4 rounded-xl border border-green-500/10 flex justify-between items-center">
                                        <div className="font-medium text-zinc-200 capitalize">{item.word.word}</div>
                                        <div className="text-sm text-zinc-500 truncate max-w-[150px]">{item.word.meaning}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-xl hover:scale-105 transition-transform mt-auto"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-4">
                <TrendingUp size={48} className="text-zinc-700 mb-2" />
                <h1 className="text-xl font-medium text-white">All caught up!</h1>
                <p className="text-muted-foreground max-w-xs">
                    No words are due for review right now. Check back later or add new words.
                </p>
                <Navigation />
            </div>
        );
    }

    const progress = ((currentIndex) / words.length) * 100;

    return (
        <div className="bg-background min-h-screen flex flex-col">
            {/* Top Progress Bar */}
            <div className="w-full h-1 bg-zinc-900">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-center px-4 md:px-6 pb-20">
                <div className="text-center mb-8 text-muted-foreground text-xs uppercase tracking-widest">
                    Card {currentIndex + 1} of {words.length}
                </div>

                <TestCard
                    key={words[currentIndex].id} // Key forces reset of internal state
                    word={words[currentIndex]}
                    onResult={handleResult}
                    isLast={currentIndex === words.length - 1}
                />
            </div>

            <Navigation />
        </div>
    );
}
