'use client';

import { Word } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { Eye, Check, X, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    word: Word;
    onResult: (correct: boolean) => void;
    isLast?: boolean;
}

type Mode = 'active_recall' | 'revealed';

export function TestCard({ word, onResult, isLast }: Props) {
    const [mode, setMode] = useState<Mode>('active_recall');
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'forgot' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when word changes
    useEffect(() => {
        setMode('active_recall');
        setInput('');
        setFeedback(null);
        // Focus input on new word active recall
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [word]);

    const playAudio = () => {
        if (word.phoneticAudioUrl) {
            new Audio(word.phoneticAudioUrl).play();
        }
    };

    const handleCheck = () => {
        const cleanInput = input.trim().toLowerCase();
        const cleanWord = word.word.toLowerCase();

        // Exact match for now, could be fuzzy later if requested
        const isCorrect = cleanInput === cleanWord;

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setMode('revealed');
        if (word.phoneticAudioUrl) playAudio();
    };

    const handleDontKnow = () => {
        setFeedback('forgot');
        setMode('revealed');
        if (word.phoneticAudioUrl) playAudio();
    };

    const handleNext = () => {
        const isSuccess = feedback === 'correct';
        onResult(isSuccess);
        // Reset performed by parent changing the 'word' prop
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (mode === 'active_recall') {
                if (input.trim()) {
                    handleCheck();
                }
                // Optional: else could trigger don't know if empty? 
                // For now, let's enforce clicking 'Don't know' or typing something.
            } else if (mode === 'revealed') {
                handleNext();
            }
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
            {/* Question Area */}
            <div className={clsx(
                "bg-card border rounded-3xl p-8 min-h-[300px] flex flex-col justify-center items-center text-center relative overflow-hidden transition-colors duration-500",
                feedback === 'correct' ? "border-green-500/20 bg-green-500/5" :
                    feedback === 'incorrect' ? "border-red-500/20 bg-red-500/5" :
                        feedback === 'forgot' ? "border-orange-500/20 bg-orange-500/5" :
                            "border-white/5"
            )}>

                {/* Context/Question */}
                <div className="z-10 flex flex-col gap-4 items-center">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs">Definition</span>
                    <p className="text-xl md:text-2xl text-zinc-100 font-medium leading-relaxed">
                        {word.meaning}
                    </p>
                    {word.userContext && (
                        <p className="text-sm text-zinc-500 mt-4 italic">
                            hint: {word.userContext}
                        </p>
                    )}
                </div>

                {/* Answer Display (When Revealed) */}
                {mode === 'revealed' && (
                    <div className="mt-8 pt-8 border-t border-white/10 w-full animate-in fade-in slide-in-from-bottom-4">
                        {/* Feedback Label */}
                        <div className="mb-4">
                            {feedback === 'correct' && (
                                <div className="inline-flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-4 py-1 rounded-full text-sm uppercase tracking-wide">
                                    <Check size={16} /> Correct
                                </div>
                            )}
                            {feedback === 'incorrect' && (
                                <div className="flex flex-col gap-2">
                                    <div className="inline-flex items-center justify-center gap-2 text-red-400 font-bold bg-red-400/10 px-4 py-1 rounded-full text-sm uppercase tracking-wide mx-auto">
                                        <X size={16} /> Incorrect
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        You typed: <span className="line-through decoration-red-500/50 text-zinc-300">{input}</span>
                                    </div>
                                </div>
                            )}
                            {feedback === 'forgot' && (
                                <div className="inline-flex items-center gap-2 text-orange-400 font-bold bg-orange-400/10 px-4 py-1 rounded-full text-sm uppercase tracking-wide">
                                    <Eye size={16} /> Forgot
                                </div>
                            )}
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2 capitalize">{word.word}</h2>
                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                            <span>{word.phoneticText}</span>
                            {word.phoneticAudioUrl && (
                                <button onClick={playAudio} className="p-2 hover:text-primary transition-colors">
                                    <Volume2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Area */}
            <div className="flex flex-col gap-3">
                {mode === 'active_recall' ? (
                    <>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type the word..."
                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 focus:border-primary/50 text-white rounded-xl p-4 text-center text-lg outline-none transition-all placeholder:text-zinc-700"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck={false}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDontKnow}
                                className="bg-zinc-800 text-zinc-400 font-medium py-3 rounded-xl hover:bg-zinc-700 hover:text-white transition-colors active:scale-95"
                            >
                                Don't know
                            </button>
                            <button
                                onClick={handleCheck}
                                disabled={!input.trim()}
                                className="bg-white text-black font-bold py-3 rounded-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                Check
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={handleNext}
                        className={clsx(
                            "w-full font-bold py-4 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg animate-in fade-in slide-in-from-bottom-2",
                            isLast ? "bg-green-500 text-white shadow-green-500/20" : "bg-primary text-primary-foreground shadow-primary/20"
                        )}
                    >
                        {isLast ? "Show Results" : "Next Word"}
                    </button>
                )}
            </div>
        </div>
    );
}
