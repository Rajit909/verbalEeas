'use server';

import { engageInConversation, type EngageInConversationInput, type EngageInConversationOutput } from '@/ai/flows/engage-in-conversation';
import { providePersonalizedSuggestions, type ProvidePersonalizedSuggestionsInput, type ProvidePersonalizedSuggestionsOutput } from '@/ai/flows/provide-personalized-suggestions';
import { synthesizeSpeech, type SynthesizeSpeechInput, type SynthesizeSpeechOutput } from '@/ai/flows/synthesize-speech';
import { transcribeVoiceInput, type TranscribeVoiceInputInput, type TranscribeVoiceInputOutput } from '@/ai/flows/transcribe-voice-input';

export async function transcribeAudioAction(input: TranscribeVoiceInputInput): Promise<TranscribeVoiceInputOutput> {
    return await transcribeVoiceInput(input);
}

export async function getConversationResponseAction(input: EngageInConversationInput): Promise<EngageInConversationOutput> {
    return await engageInConversation(input);
}

export async function getPersonalizedSuggestionAction(input: ProvidePersonalizedSuggestionsInput): Promise<ProvidePersonalizedSuggestionsOutput> {
    return await providePersonalizedSuggestions(input);
}

export async function synthesizeSpeechAction(input: SynthesizeSpeechInput): Promise<SynthesizeSpeechOutput> {
    return await synthesizeSpeech(input);
}
