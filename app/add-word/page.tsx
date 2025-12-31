'use client';

import { useState, useEffect } from 'react';
import { addWord, reAddWord } from '@/app/actions';
import { Navigation } from '@/components/Navigation';
import { Search, Loader2, Send, Volume2, BookmarkCheck } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton({ hasInput, isLoading }: { hasInput: boolean, isLoading: boolean }) {
    const { pending } = useFormStatus();
    const isBusy = pending || isLoading;

    return (
        <button
            disabled={isBusy || !hasInput}
            type="submit"
            className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {isBusy ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
    );
}

export default function AddWordPage() {
    const [preview, setPreview] = useState<any>(null);
    const [word, setWord] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const [errorState, setErrorState] = useState<boolean>(false);
    const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!word || word.length < 2 || !shouldFetchSuggestions) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(word)}&max=5`);
                if (!res.ok) return;
                const data = await res.json();

                const sorted = data.sort((a: any, b: any) => {
                    const lowerWord = word.toLowerCase();
                    const aMatch = a.word.toLowerCase() === lowerWord;
                    const bMatch = b.word.toLowerCase() === lowerWord;
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                });

                setSuggestions(sorted);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [word, shouldFetchSuggestions]);

    const handleSuggestionClick = async (suggestion: string) => {
        const capitalized = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);

        setShouldFetchSuggestions(false);
        setWord(capitalized);
        setSuggestions([]);
        setErrorState(false);
        setIsDuplicate(false);
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('word', capitalized);

        try {
            const res = await addWord(formData);
            if (res.alreadyExists) {
                setPreview(res.word);
                setIsDuplicate(true);
            } else if (res.error) {
                if (res.error.includes("definition") || res.error.includes("found")) {
                    setErrorState(true);
                    setPreview(null);
                } else {
                    alert(res.error);
                }
            } else {
                setPreview(res.word);
                setErrorState(false);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    async function action(formData: FormData) {
        setErrorState(false);
        setIsDuplicate(false);
        setPreview(null);

        const res = await addWord(formData);
        if (res.alreadyExists) {
            setPreview(res.word);
            setIsDuplicate(true);
        } else if (res.error) {
            if (res.error.includes("definition") || res.error.includes("found")) {
                setErrorState(true);
            } else {
                alert(res.error);
            }
        } else {
            setPreview(res.word);
        }
    }

    const handleReAdd = async () => {
        if (!preview?.word) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('word', preview.word);

        try {
            const res = await reAddWord(formData);
            if (res.success || res.word) {
                setPreview(res.word);
                setIsDuplicate(false);
            } else {
                alert(res.error || "Failed to re-add word");
            }
        } catch (e) {
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background min-h-screen px-6 pt-12 pb-24 flex flex-col gap-6">
            <header>
                <h1 className="text-2xl font-bold text-white mb-2">New Entry</h1>
                <p className="text-zinc-500">Capture a new word for your long-term memory.</p>
            </header>

            <form action={action} className="flex flex-col gap-4">
                <div className="relative z-50">
                    <input
                        name="word"
                        value={word}
                        onChange={(e) => {
                            setWord(e.target.value);
                            setShouldFetchSuggestions(true);
                            setErrorState(false);
                            if (preview) setPreview(null);
                            if (isDuplicate) setIsDuplicate(false);
                        }}
                        placeholder="Word"
                        required
                        className="w-full glass-panel focus:border-primary rounded-xl p-4 pr-12 text-lg text-white placeholder:text-zinc-600 outline-none transition-all"
                        autoComplete="off"
                    />
                    <SubmitButton hasInput={word.trim().length > 0} isLoading={isSubmitting} />

                    {suggestions.length > 0 && !errorState && !isDuplicate && !preview && (
                        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl overflow-hidden shadow-xl z-50">
                            {suggestions.map((s) => (
                                <button
                                    key={s.word}
                                    type="button"
                                    onClick={() => handleSuggestionClick(s.word)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white transition-colors border-b border-white/5 last:border-0 capitalize"
                                >
                                    {s.word}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </form>
            {errorState && (
                <div className="mt-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-6 flex items-center justify-center">
                        <img
                            src="/not-found.png"
                            alt="Word not found"
                            className="h-40 w-40 object-contain drop-shadow-2xl"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Word Not Found</h3>
                    <p className="text-zinc-400 mb-6 max-w-xs">
                        We couldn't find a definition for that word in our dictionary.
                    </p>
                    <button
                        onClick={() => {
                            setWord('');
                            setSuggestions([]);
                            setShouldFetchSuggestions(true);
                            setErrorState(false);
                            const input = document.querySelector('input[name="word"]') as HTMLInputElement;
                            if (input) input.focus();
                        }}
                        className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/5"
                    >
                        Try Another Word
                    </button>
                </div>
            )}

            {
                preview && (
                    <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in">
                        <div className={`${isDuplicate ? 'bg-amber-500/10 border-amber-500/20' : 'bg-green-500/10 border-green-500/20'} border p-6 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`${isDuplicate ? 'text-amber-400' : 'text-green-400'} text-2xl font-bold capitalize`}>{preview.word}</h3>
                                        {isDuplicate && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                                <BookmarkCheck size={10} />
                                                In Library
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {preview.phoneticAudioUrl && (
                                    <button onClick={() => new Audio(preview.phoneticAudioUrl).play()} className={`${isDuplicate ? 'text-amber-400 hover:bg-amber-500/20' : 'text-green-400 hover:bg-green-500/20'} p-2 rounded-full transition-colors`}>
                                        <Volume2 size={20} />
                                    </button>
                                )}
                            </div>
                            <p className={`${isDuplicate ? 'text-amber-100/80' : 'text-green-100/80'} leading-relaxed mb-4`}>
                                {preview.meaning}
                            </p>

                            {isDuplicate ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-sm text-amber-500/60">
                                        <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                                        This word is already in your library.
                                    </div>
                                    <button
                                        onClick={handleReAdd}
                                        disabled={isSubmitting}
                                        className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-colors border border-amber-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Enter as new word"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-green-500/60">
                                    <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                    Added to Library for review
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setWord('');
                                setPreview(null);
                                setIsDuplicate(false);
                                setShouldFetchSuggestions(true);
                            }}
                            className="mt-4 text-center w-full text-zinc-500 hover:text-white transition-colors"
                        >
                            {isDuplicate ? "Cancel" : "Add Another"}
                        </button>
                    </div>
                )
            }

            <Navigation />
        </div>
    );
}
