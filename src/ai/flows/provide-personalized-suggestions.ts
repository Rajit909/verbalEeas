// src/ai/flows/provide-personalized-suggestions.ts
'use server';

/**
 * @fileOverview A flow that provides personalized suggestions based on past interactions and learned preferences.
 *
 * - providePersonalizedSuggestions - A function that handles the personalized suggestion process.
 * - ProvidePersonalizedSuggestionsInput - The input type for the providePersonalizedSuggestions function.
 * - ProvidePersonalizedSuggestionsOutput - The return type for the providePersonalizedSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePersonalizedSuggestionsInputSchema = z.object({
  userHistory: z
    .string()
    .describe('A summary of the user history and preferences.'),
});
export type ProvidePersonalizedSuggestionsInput = z.infer<
  typeof ProvidePersonalizedSuggestionsInputSchema
>;

const ProvidePersonalizedSuggestionsOutputSchema = z.object({
  suggestion: z.string().describe('A personalized suggestion for the user.'),
});
export type ProvidePersonalizedSuggestionsOutput = z.infer<
  typeof ProvidePersonalizedSuggestionsOutputSchema
>;

export async function providePersonalizedSuggestions(
  input: ProvidePersonalizedSuggestionsInput
): Promise<ProvidePersonalizedSuggestionsOutput> {
  return providePersonalizedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedSuggestionsPrompt',
  input: {schema: ProvidePersonalizedSuggestionsInputSchema},
  output: {schema: ProvidePersonalizedSuggestionsOutputSchema},
  prompt: `Based on the user's history and preferences:

  {{userHistory}}

  Provide a single, personalized suggestion for the user.  Be concise.
  `,
});

const providePersonalizedSuggestionsFlow = ai.defineFlow(
  {
    name: 'providePersonalizedSuggestionsFlow',
    inputSchema: ProvidePersonalizedSuggestionsInputSchema,
    outputSchema: ProvidePersonalizedSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
