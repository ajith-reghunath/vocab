import { Timestamp } from 'firebase/firestore';

export interface Word {
    id?: string; // Firestore Doc ID
    word: string;
    meaning: string;
    examples: string[];
    partOfSpeech: string;

    phoneticText?: string;
    phoneticAudioUrl?: string;

    userContext?: string; // Optional user note

    // Spaced Repetition
    reviewStep: number;
    nextReviewAt: Timestamp | Date; // Date for client, Timestamp for Firestore
    lastReviewedAt?: Timestamp | Date;

    // Performance
    correctStreak: number;
    wrongCount: number;
    easeFactor: number;

    createdAt: Timestamp | Date;
}

export interface DailyActivity {
    date: string; // YYYY-MM-DD
    reviewCount: number;
    correctCount: number;
    wrongCount: number;
    updatedAt: Timestamp | Date;
}

export interface DictionaryResponse {
    word: string;
    phonetics: Array<{
        text?: string;
        audio?: string;
    }>;
    meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{
            definition: string;
            example?: string;
        }>;
    }>;
}
