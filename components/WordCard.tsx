'use client';

import { Word } from '@/types';
import { Volume2, Clock } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface Props {
    word: Word;
    minimal?: boolean; // If true, hide examples/stats
}

export function WordCard({ word, minimal = false }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!word.phoneticAudioUrl) return;

        try {
            const audio = new Audio(word.phoneticAudioUrl);
            setIsPlaying(true);
            audio.play();
            audio.onended = () => setIsPlaying(false);
        } catch {
            setIsPlaying(false);
        }
    };

    // Format date relative (e.g., "in 2 days" or "Overdue")
    const getDueStatus = () => {
        const due = new Date(word.nextReviewAt as any);
        const now = new Date();
        const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffHours < 0) return <span className="text-red-400 font-bold">Overdue</span>;
        if (diffHours < 24) return <span className="text-orange-300">Today</span>;
        return <span className="text-muted-foreground">in {Math.ceil(diffHours / 24)}d</span>;
    };

    return (
        <div className="group relative glass-panel hover:bg-zinc-800/40 transition-all duration-300 p-5 rounded-2xl flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white capitalize">{word.word}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="italic opacity-70">{word.partOfSpeech}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="font-mono tracking-wide">{word.phoneticText}</span>
                    </div>
                </div>

                {word.phoneticAudioUrl && (
                    <button
                        onClick={playAudio}
                        disabled={isPlaying}
                        className="p-3 bg-white/5 rounded-full hover:bg-primary/20 hover:text-primary transition-colors active:scale-95"
                    >
                        <Volume2 size={20} className={clsx(isPlaying && "animate-pulse text-primary")} />
                    </button>
                )}
            </div>

            {/* Meaning */}
            <p className="text-zinc-300 leading-relaxed">
                {word.meaning}
            </p>

            {/* Examples (if not minimal) */}
            {!minimal && word.examples.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-white/10 space-y-1">
                    <p className="text-sm text-muted-foreground italic">"{word.examples[0]}"</p>
                </div>
            )}

            {/* Footer info using a lighter touch */}
            <div className="mt-2 flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <div className={clsx("w-2 h-2 rounded-full", word.reviewStep > 3 ? "bg-green-500 shadow-green" : "bg-blue-500")} />
                    Level {word.reviewStep}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                    <Clock size={12} className="text-muted-foreground" />
                    {getDueStatus()}
                </div>
            </div>
        </div>
    );
}
