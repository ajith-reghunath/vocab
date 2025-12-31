'use server';

import { dbAdmin } from '@/lib/firebaseAdmin';
import { fetchWordData } from '@/lib/dictionary';
import { initializeSpacedRepetition, processReview } from '@/lib/spacedRepetition';
import { Word, DailyActivity } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// --- ADD WORD ---
export async function addWord(formData: FormData) {
    const wordInput = formData.get('word') as string;
    const userContext = formData.get('context') as string;

    if (!wordInput) {
        return { error: 'Word is required' };
    }

    const cleanWord = wordInput.trim().toLowerCase();

    try {
        console.log(`[addWord] Attempting to add word: ${cleanWord}`);

        // 1. Check if word exists
        const existingSnap = await dbAdmin.collection('words')
            .where('word', '==', cleanWord)
            .limit(1)
            .get();

        if (!existingSnap.empty) {
            console.log(`[addWord] Word already exists: ${cleanWord}`);
            const existingDoc = existingSnap.docs[0];
            const existingData = existingDoc.data();

            // Serialize for client
            const serializedExisting = {
                id: existingDoc.id,
                ...existingData,
                nextReviewAt: (existingData.nextReviewAt as unknown as Timestamp).toDate().toISOString(),
                createdAt: (existingData.createdAt as unknown as Timestamp).toDate().toISOString(),
                lastReviewedAt: existingData.lastReviewedAt ? (existingData.lastReviewedAt as unknown as Timestamp).toDate().toISOString() : undefined,
            };

            return { alreadyExists: true, word: serializedExisting };
        }

        // 2. Fetch Dictionary Data
        console.log(`[addWord] Fetching dictionary data for: ${cleanWord}`);
        const dictData = await fetchWordData(cleanWord);
        if (!dictData) {
            console.warn(`[addWord] Definition not found for: ${cleanWord}`);
            return { error: 'Word definition not found in dictionary' };
        }

        // 3. Initialize SR
        const srInit = initializeSpacedRepetition();

        // 4. Create Word Object
        const newWord: Omit<Word, 'id'> = {
            word: cleanWord,
            meaning: dictData.meaning,
            examples: dictData.examples,
            partOfSpeech: dictData.partOfSpeech,
            phoneticText: dictData.phoneticText,
            phoneticAudioUrl: dictData.phoneticAudioUrl,
            userContext: userContext || '',

            ...srInit,
            // Convert Date to Timestamp for Firestore
            // Cast to any because of Client vs Admin SDK Timestamp mismatch in shared types
            nextReviewAt: Timestamp.fromDate(srInit.nextReviewAt) as any,
            createdAt: Timestamp.now() as any,
        };

        // 5. Save to Firestore
        console.log(`[addWord] Saving to Firestore: ${cleanWord}`);
        await dbAdmin.collection('words').add(newWord);
        console.log(`[addWord] Successfully saved: ${cleanWord}`);

        revalidatePath('/dashboard');
        revalidatePath('/library');

        // Serialize for client
        const serializedWord = {
            ...newWord,
            nextReviewAt: (newWord.nextReviewAt as unknown as Timestamp).toDate().toISOString(),
            createdAt: (newWord.createdAt as unknown as Timestamp).toDate().toISOString(),
        };

        return { success: true, word: serializedWord };
    } catch (error: any) {
        console.error('[addWord] Error adding word:', error);
        // Return checking for network/firebase code
        return { error: `Internal Server Error: ${error.message || 'Unknown error'}` };
    }
}



// --- GET DASHBOARD STATS ---
export async function getDashboardStats() {
    try {
        const now = Timestamp.now();

        // 1. Fetch Words Due (nextReviewAt <= now)
        const dueSnap = await dbAdmin.collection('words')
            .where('nextReviewAt', '<=', now)
            .get();

        const dueCount = dueSnap.size;

        // 2. Fetch Total Words
        // We can use count() aggregation for efficiency if needed, but size is fine for MVP
        const allSnap = await dbAdmin.collection('words').select('id').get();
        const totalCount = allSnap.size;

        // 3. Fetch Overdue (nextReviewAt < now - 1 day) -> Optional stat, but good to know
        // Not strictly requested in dashboard visual, but logic exists.

        // 4. Fetch Activity for Heatmap (Last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const dateStr = ninetyDaysAgo.toISOString().split('T')[0];

        const activitySnap = await dbAdmin.collection('dailyActivity')
            .where('date', '>=', dateStr)
            .get();

        const activities = activitySnap.docs.map(doc => {
            const d = doc.data();
            return {
                ...d,
                updatedAt: (d.updatedAt as any).toDate().toISOString()
            } as DailyActivity;
        });

        return {
            dueCount,
            totalCount,
            activities
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { dueCount: 0, totalCount: 0, activities: [] };
    }
}

// --- SUBMIT REVIEW ---
export async function submitReview(wordId: string, isCorrect: boolean) {
    try {
        const wordRef = dbAdmin.collection('words').doc(wordId);
        const wordSnap = await wordRef.get();

        if (!wordSnap.exists) {
            throw new Error('Word not found');
        }

        const wordData = wordSnap.data() as Word;

        // 1. Calculate new SR state
        // Convert Firestore Timestamp to Date
        const nextReviewResult = processReview(
            wordData.reviewStep,
            wordData.wrongCount,
            wordData.correctStreak,
            isCorrect
        );

        // 2. Update Word
        const updatePayload = {
            reviewStep: nextReviewResult.reviewStep,
            correctStreak: nextReviewResult.correctStreak,
            wrongCount: nextReviewResult.wrongCount,
            nextReviewAt: Timestamp.fromDate(nextReviewResult.nextReviewAt),
            lastReviewedAt: Timestamp.now(),
            easeFactor: nextReviewResult.easeFactor,
        };

        // 3. Update Daily Activity
        const today = new Date().toISOString().split('T')[0];
        const activityRef = dbAdmin.collection('dailyActivity').doc(today);

        await dbAdmin.runTransaction(async (t) => {
            t.update(wordRef, updatePayload);

            const activityDoc = await t.get(activityRef);
            if (activityDoc.exists) {
                t.update(activityRef, {
                    reviewCount: FieldValue.increment(1),
                    correctCount: FieldValue.increment(isCorrect ? 1 : 0),
                    wrongCount: FieldValue.increment(isCorrect ? 0 : 1),
                    updatedAt: Timestamp.now()
                });
            } else {
                t.set(activityRef, {
                    date: today,
                    reviewCount: 1,
                    correctCount: isCorrect ? 1 : 0,
                    wrongCount: isCorrect ? 0 : 1,
                    updatedAt: Timestamp.now()
                });
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/test');

        return { success: true };
    } catch (error) {
        console.error('Error submitting review:', error);
        return { error: 'Failed to submit review' };
    }
}

// --- GET LIBRARY ---
export async function getLibrary() {
    try {
        const snap = await dbAdmin.collection('words')
            .orderBy('createdAt', 'desc')
            .get();

        // Serialize for Client Components
        return snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                // Cast to any to access Timestamp methods safely on potentially mixed types or raw strings
                nextReviewAt: (d.nextReviewAt as any).toDate().toISOString(),
                createdAt: (d.createdAt as any).toDate().toISOString(),
                lastReviewedAt: d.lastReviewedAt ? (d.lastReviewedAt as any).toDate().toISOString() : undefined
            };
        });
    } catch (error) {
        console.error('Error fetching library:', error);
        return [];
    }
}

// --- GET DUE WORDS FOR TEST ---
export async function getDueWords() {
    try {
        const now = Timestamp.now();
        const snap = await dbAdmin.collection('words')
            .where('nextReviewAt', '<=', now)
            .limit(20) // Limit batch size for sanity
            .get();

        return snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                // Cast to any for safety against shared type mismatch
                nextReviewAt: (d.nextReviewAt as any).toDate().toISOString(),
                createdAt: (d.createdAt as any).toDate().toISOString(),
                lastReviewedAt: d.lastReviewedAt ? (d.lastReviewedAt as any).toDate().toISOString() : undefined
            };
        });
    } catch (e) {
        console.error("Error fetching due words", e);
        return [];
    }
}
// --- RE-ADD WORD (REPLACE) ---
export async function reAddWord(formData: FormData) {
    const wordInput = formData.get('word') as string;
    const userContext = formData.get('context') as string;

    if (!wordInput) return { error: 'Word is required' };
    const cleanWord = wordInput.trim().toLowerCase();

    try {
        console.log(`[reAddWord] Replacing word: ${cleanWord}`);

        // 1. Find and Delete Existing
        const existingSnap = await dbAdmin.collection('words')
            .where('word', '==', cleanWord)
            .get();

        const batch = dbAdmin.batch();
        existingSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // 2. Add as New (calls internal logic)
        return await addWord(formData);
    } catch (error: any) {
        console.error('[reAddWord] Error:', error);
        return { error: `Failed to replace word: ${error.message}` };
    }
}
