// Implemented by Gemini.
'use server';
/**
 * @fileOverview A flow that transcribes voice input to text.
 *
 * - transcribeVoiceInput - A function that handles the voice transcription process.
 * - TranscribeVoiceInputInput - The input type for the transcribeVoiceInput function.
 * - TranscribeVoiceInputOutput - The return type for the transcribeVoiceInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeVoiceInputInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeVoiceInputInput = z.infer<typeof TranscribeVoiceInputInputSchema>;

const TranscribeVoiceInputOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio input.'),
});
export type TranscribeVoiceInputOutput = z.infer<typeof TranscribeVoiceInputOutputSchema>;

export async function transcribeVoiceInput(input: TranscribeVoiceInputInput): Promise<TranscribeVoiceInputOutput> {
  return transcribeVoiceInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeVoiceInputPrompt',
  input: {schema: TranscribeVoiceInputInputSchema},
  output: {schema: TranscribeVoiceInputOutputSchema},
  prompt: `Transcribe the following audio input to text:\n\n{{media url=audioDataUri}}`,
});

const transcribeVoiceInputFlow = ai.defineFlow(
  {
    name: 'transcribeVoiceInputFlow',
    inputSchema: TranscribeVoiceInputInputSchema,
    outputSchema: TranscribeVoiceInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
