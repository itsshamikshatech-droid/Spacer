'use server';

/**
 * @fileOverview AI-powered space and service suggestion flow.
 *
 * This flow suggests the best-matched spaces and services based on user history,
 * budget, location, and reviews. It utilizes AI to provide relevant options to space buyers.
 *
 * @interface SuggestSpaceAndServicesInput - Input for the suggestSpaceAndServices function.
 * @interface SuggestSpaceAndServicesOutput - Output of the suggestSpaceAndServices function.
 * @function suggestSpaceAndServices - The main function to get space and service suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSpaceAndServicesInputSchema = z.object({
  searchHistory: z
    .string()
    .describe('The user search history, including previous searches and preferences.'),
  budget: z.number().describe('The budget for the space and services.'),
  location: z.string().describe('The desired location for the space.'),
  reviews: z
    .string()
    .describe('Reviews and ratings from other users, providing feedback on spaces and services.'),
});
export type SuggestSpaceAndServicesInput = z.infer<typeof SuggestSpaceAndServicesInputSchema>;

const SuggestSpaceAndServicesOutputSchema = z.object({
  suggestedSpaces: z
    .string()
    .describe('A list of suggested spaces, including details such as location, capacity, and price.'),
  suggestedServices: z
    .string()
    .describe('A list of suggested services, including details such as category, charges, and availability.'),
});
export type SuggestSpaceAndServicesOutput = z.infer<typeof SuggestSpaceAndServicesOutputSchema>;

export async function suggestSpaceAndServices(
  input: SuggestSpaceAndServicesInput
): Promise<SuggestSpaceAndServicesOutput> {
  return suggestSpaceAndServicesFlow(input);
}

const suggestSpaceAndServicesPrompt = ai.definePrompt({
  name: 'suggestSpaceAndServicesPrompt',
  input: {schema: SuggestSpaceAndServicesInputSchema},
  output: {schema: SuggestSpaceAndServicesOutputSchema},
  prompt: `You are an AI assistant designed to suggest the best-matched spaces and services for space buyers.
  Based on the user's search history, budget, location, and reviews, provide a list of suggested spaces and services.

  Search History: {{{searchHistory}}}
  Budget: {{{budget}}}
  Location: {{{location}}}
  Reviews: {{{reviews}}}

  Suggest the best-matched spaces and services that meet the user's requirements and preferences.
  Format the suggested spaces and services as a list with relevant details.`,
});

const suggestSpaceAndServicesFlow = ai.defineFlow(
  {
    name: 'suggestSpaceAndServicesFlow',
    inputSchema: SuggestSpaceAndServicesInputSchema,
    outputSchema: SuggestSpaceAndServicesOutputSchema,
  },
  async input => {
    const {output} = await suggestSpaceAndServicesPrompt(input);
    return output!;
  }
);
