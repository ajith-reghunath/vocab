'use client';

import { DailyActivity } from '@/types';
import { clsx } from 'clsx';
import { useMemo } from 'react';

interface Props {
    activities: DailyActivity[];
}

export function StreakHeatmap({ activities }: Props) {
    // Generate last 90 days grid
    const days = useMemo(() => {
        const d = [];
        const today = new Date();
        // Start from 89 days ago
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const activity = activities.find(a => a.date === dateStr);
            const count = activity ? activity.reviewCount : 0;

            d.push({
                date: dateStr,
                count,
                level: getLevel(count)
            });
        }
        return d;
    }, [activities]);

    // GitHub style levels: 0 (empty), 1-4 (intensity)
    function getLevel(count: number) {
        if (count === 0) return 0;
        if (count <= 5) return 1;
        if (count <= 10) return 2;
        if (count <= 20) return 3;
        return 4;
    }

    return (
        <div className="flex flex-col gap-2 p-4 bg-card rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Consistency</h3>
                <span className="text-xs text-muted-foreground">Last 90 Days</span>
            </div>

            <div className="grid grid-cols-[repeat(15,_minmax(0,_1fr))] gap-1.5 w-full">
                {/** 
          90 days fits in roughly 13 weeks. 
          To make it look like GitHub (rows=7), we would need vertical generic. 
          For mobile vertical scroll, a simple grid is easier.
          Let's try a dense grid that fits mobile. 15 columns * 6 rows = 90.
         **/}
                {days.map((day) => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.count} reviews`}
                        className={clsx(
                            "aspect-square rounded-sm transition-colors duration-500",
                            day.level === 0 && "bg-white/5",
                            day.level === 1 && "bg-violet-900/40",
                            day.level === 2 && "bg-violet-700/60",
                            day.level === 3 && "bg-violet-600",
                            day.level === 4 && "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]",
                        )}
                    />
                ))}
            </div>

            <div className="flex items-center gap-2 mt-2 justify-end text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-white/5" />
                    <div className="w-3 h-3 rounded-sm bg-violet-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-violet-600" />
                    <div className="w-3 h-3 rounded-sm bg-violet-400" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
