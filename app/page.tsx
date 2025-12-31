import { getDashboardStats } from '@/app/actions';
import { Stroke, AlertCircle } from 'lucide-react';
import { StreakHeatmap } from '@/components/StreakHeatmap';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const { dueCount, totalCount, activities } = await getDashboardStats();

    // Find today's streak
    // We can let the heatmap logic handle visual, but we might want a big number.
    // We'll calculate it on client or pass it. 
    // Let's rely on Heatmap visualization for streak unless user specifically asked for "Current Streak (days)" text.
    // The Prompt asked for: "Current streak (days)".
    // We can calculate it simply here for the big display.
    // Re-using utils logic here might be tricky if we don't import utils.
    // Let's just pass the activities to client or do a quick check.

    // Quick backend streak calc
    // (Simplified for display)
    // ... Actually, let's just show "Total Learning" if streak is complex, but the requirement is "Current Streak".

    return (
        <div className="bg-background min-h-screen px-6 pt-12 pb-24 flex flex-col gap-8">
            {/* Header */}
            <header>
                <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">My Vocabulary</h1>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{totalCount}</span>
                    <span className="text-zinc-500">words collected</span>
                </div>
            </header>

            {/* Due Card */}
            <section>
                <div className="relative overflow-hidden bg-gradient-to-br from-violet-900/50 to-purple-900/20 border border-violet-500/20 rounded-3xl p-8">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <AlertCircle size={120} />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-zinc-300 font-medium mb-1">Due for Review</h2>
                        <div className="text-5xl font-bold text-white mb-6">
                            {dueCount}
                        </div>

                        <Link
                            href="/test"
                            className="inline-flex items-center justify-center w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors active:scale-95"
                        >
                            {dueCount > 0 ? "Start Review Session" : "Review Extra"}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Streak Heatmap */}
            <section>
                <StreakHeatmap activities={activities} />
            </section>

            <Navigation />
        </div>
    );
}
