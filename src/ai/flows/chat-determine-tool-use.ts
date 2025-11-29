// src/ai/flows/chat-determine-tool-use.ts
'use server';
/**
 * @fileOverview Implements a conversational interface between buyers and sellers, determining when to use maps or payment portals.
 *
 * - chatDetermineToolUse - A function that processes user messages and determines if tools are needed.
 * - ChatDetermineToolUseInput - The input type for the chatDetermineToolUse function.
 * - ChatDetermineToolUseOutput - The return type for the chatDetermineToolUse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatDetermineToolUseInputSchema = z.object({
  message: z.string().describe('The user message.'),
  userId: z.string().describe('The ID of the user sending the message.'),
});
export type ChatDetermineToolUseInput = z.infer<typeof ChatDetermineToolUseInputSchema>;

const ChatDetermineToolUseOutputSchema = z.object({
  response: z.string().describe('The response to the user message.'),
  useMapTool: z.boolean().describe('Whether the map tool should be used.'),
  usePaymentTool: z.boolean().describe('Whether the payment tool should be used.'),
});
export type ChatDetermineToolUseOutput = z.infer<typeof ChatDetermineToolUseOutputSchema>;

export async function chatDetermineToolUse(input: ChatDetermineToolUseInput): Promise<ChatDetermineToolUseOutput> {
  return chatDetermineToolUseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatDetermineToolUsePrompt',
  input: {schema: ChatDetermineToolUseInputSchema},
  output: {schema: ChatDetermineToolUseOutputSchema},
  prompt: `You are a helpful assistant facilitating communication between space buyers and sellers.

You will receive a user message and your job is to formulate a helpful response. You must also determine if a map or payment portal is needed based on the user's message.

If the user is asking about the location of a space, set useMapTool to true. If the user is asking about payment options or is ready to make a payment, set usePaymentTool to true. Otherwise, these values should be set to false.

User message: {{{message}}}
`,
});

const chatDetermineToolUseFlow = ai.defineFlow(
  {
    name: 'chatDetermineToolUseFlow',
    inputSchema: ChatDetermineToolUseInputSchema,
    outputSchema: ChatDetermineToolUseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
