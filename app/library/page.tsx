import { getLibrary } from '@/app/actions';
import { WordCard } from '@/components/WordCard';
import { Navigation } from '@/components/Navigation';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
    const words = await getLibrary();

    return (
        <div className="bg-background min-h-screen px-4 pt-12 pb-24 flex flex-col gap-6">
            <header className="px-2">
                <h1 className="text-2xl font-bold text-white mb-2">Library</h1>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        placeholder="Search your vocabulary..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-zinc-300 outline-none transition-all placeholder:text-zinc-600"
                    />
                    {/* Search is purely client-side filtering if we wanted to be fancy, but for MVP standard list is fine */}
                </div>
            </header>

            <div className="flex flex-col gap-4">
                {words.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        No words yet. Go add some!
                    </div>
                ) : (
                    words.map((word: any) => (
                        <WordCard key={word.id} word={word} minimal />
                    ))
                )}
            </div>

            <Navigation />
        </div>
    );
}
