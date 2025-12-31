import { DictionaryResponse } from "@/types";

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface NormalizedWordData {
    meaning: string;
    examples: string[];
    partOfSpeech: string;
    phoneticText?: string;
    phoneticAudioUrl?: string;
}

export async function fetchWordData(word: string): Promise<NormalizedWordData | null> {
    try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Failed to fetch word data");
        }

        const data: DictionaryResponse[] = await res.json();
        if (!data || data.length === 0) return null;

        const entry = data[0];

        // 1. Extract Phonetics (Audio & Text)
        // Preference: US audio > Any audio
        let phoneticText = entry.phonetics.find(p => p.text)?.text;
        let audioUrl = entry.phonetics.find(p => p.audio && p.audio.includes("-us.mp3"))?.audio;

        if (!audioUrl) {
            audioUrl = entry.phonetics.find(p => p.audio)?.audio;
        }

        // 2. Extract Meaning & Examples
        // Take the first meaning that has a definition
        const primaryMeaning = entry.meanings[0];
        const partOfSpeech = primaryMeaning?.partOfSpeech || "unknown";

        const firstDefinition = primaryMeaning?.definitions[0];
        const meaning = firstDefinition?.definition || "No definition found.";

        // Collect examples from all definitions to give user variety (up to 3)
        const examples: string[] = [];
        entry.meanings.forEach(m => {
            m.definitions.forEach(d => {
                if (d.example && examples.length < 3) {
                    examples.push(d.example);
                }
            });
        });

        return {
            meaning,
            examples,
            partOfSpeech,
            phoneticText,
            phoneticAudioUrl: audioUrl || undefined
        };

    } catch (error) {
        console.error("Dictionary Fetch Error:", error);
        return null;
    }
}
