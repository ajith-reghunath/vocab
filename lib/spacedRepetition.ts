/**
 * Spaced Repetition Logic (Fixed Schedule)
 * Intervals: [0, 0.25, 1, 7, 14, 30, 60, 180] days
 */

const INTERVALS = [0, 0.25, 1, 7, 14, 30, 60, 180];

interface ReviewResult {
    reviewStep: number;
    correctStreak: number;
    wrongCount: number;
    easeFactor: number; // For future usage, kept as 2.5 for now
    nextReviewAt: Date;
}

// 1. New Word Initialization
export function initializeSpacedRepetition(): ReviewResult {
    const now = new Date();
    // First review in 10 minutes
    const nextReview = new Date(now.getTime() + 10 * 60 * 1000);

    return {
        reviewStep: 0,
        correctStreak: 0,
        wrongCount: 0,
        easeFactor: 2.5,
        nextReviewAt: nextReview,
    };
}

// 2. Process Review
export function processReview(
    currentStep: number,
    currentWrongCount: number,
    currentStreak: number,
    isCorrect: boolean
): ReviewResult {
    let nextStep = currentStep;
    let nextStreak = currentStreak;
    let nextWrongCount = currentWrongCount;

    // Ease factor remains 2.5 per spec, but we track it.
    const easeFactor = 2.5;

    const now = new Date();

    if (isCorrect) {
        nextStep = currentStep + 1;
        nextStreak = currentStreak + 1;
    } else {
        // Backtrack on wrong answer
        nextStep = Math.max(0, currentStep - 2);
        nextStreak = 0;
        nextWrongCount = currentWrongCount + 1;
    }

    // Calculate next interval
    // If we exceed the defined intervals, we can cap it or extend linearly.
    // For safety, let's clamp to the max interval defined.
    const safeStepIndex = Math.min(nextStep, INTERVALS.length - 1);
    const daysToAdd = INTERVALS[safeStepIndex];

    // Calculate Next Review Date
    const nextReviewAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    return {
        reviewStep: nextStep,
        correctStreak: nextStreak,
        wrongCount: nextWrongCount,
        easeFactor,
        nextReviewAt,
    };
}
