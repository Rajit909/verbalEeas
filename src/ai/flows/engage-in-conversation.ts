'use server';

/**
 * @fileOverview This file defines a Genkit flow for engaging in casual conversation with the user.
 *
 * - engageInConversation - A function that handles the conversation process.
 * - EngageInConversationInput - The input type for the engageInConversation function.
 * - EngageInConversationOutput - The return type for the engageInConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EngageInConversationInputSchema = z.object({
  userInput: z.string().describe('The user input to respond to.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history of the conversation.'),
});
export type EngageInConversationInput = z.infer<typeof EngageInConversationInputSchema>;

const EngageInConversationOutputSchema = z.object({
  response: z.string().describe('The conversational response from the assistant.'),
});
export type EngageInConversationOutput = z.infer<typeof EngageInConversationOutputSchema>;

export async function engageInConversation(input: EngageInConversationInput): Promise<EngageInConversationOutput> {
  return engageInConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'engageInConversationPrompt',
  input: {schema: EngageInConversationInputSchema},
  output: {schema: EngageInConversationOutputSchema},
  prompt: `You are a friendly and helpful AI assistant named VerbalEase engaging in a casual conversation.

  Your goal is to have a natural conversation with the user, understanding the context of previous exchanges.

  {% if chatHistory %}
  Here is the chat history:
  {{#each chatHistory}}
  {{role}}: {{content}}
  {{/each}}
  {% endif %}

  User input: {{userInput}}
  Assistant: `,
});

const engageInConversationFlow = ai.defineFlow(
  {
    name: 'engageInConversationFlow',
    inputSchema: EngageInConversationInputSchema,
    outputSchema: EngageInConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
