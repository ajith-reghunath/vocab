import { DailyActivity } from "@/types";

export function calculateStreak(activities: DailyActivity[]): number {
    if (!activities || activities.length === 0) return 0;

    // Sort activities by date descending (newest first)
    const sorted = [...activities].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streak = 0;
    let currentCheckDate = new Date(today);

    // Check if there is activity today or yesterday to start the streak
    // If the most recent activity is older than yesterday, streak is broken (0).
    const latestDate = sorted[0].date;
    if (latestDate !== today && latestDate !== yesterday) {
        return 0;
    }

    // Iterate backwards day by day to count consecutive days
    // We align the checking pointer with the actual data

    // Create a Set of active dates for O(1) lookup
    const activeDates = new Set(sorted.map(a => a.date));

    // Start checking from Today. If today missing, check yesterday.
    // If today is present, streak starts at 1. If not, but yesterday is, streak starts at 1 (from yesterday).

    // Implementation strategy: 
    // Loop backwards from Today. 
    // If (Today) exists -> streak++. Continue to yesterday.
    // Else If (Today) missing -> check Yesterday. 
    //    If (Yesterday) exists -> streak++. Continue to day before yesterday.
    //    Else -> Streak broken immediately.

    // Correction: Standard streak logic allows "Today" to be skipped if "Yesterday" was done, without breaking streak (it just doesn't increment for today yet).
    // But strictly, a streak is consecutive days.
    // If let's say I did it yesterday (Streak 5). Today I haven't done it yet. Display Streak 5.
    // If I do it today, Display Streak 6.
    // If I miss today, and check tomorrow. Streak 0.

    let checkDate = new Date(); // Start Today

    // If today is NOT in the list, but yesterday IS, we allow the loop to start from yesterday.
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!activeDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}
