'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal products based on consumer reviews,
 * popular keywords, and uploaded product data.
 *
 * - suggestOptimalProducts - An async function that takes product data, consumer reviews, and popular keywords as input and returns product suggestions.
 * - SuggestOptimalProductsInput - The input type for the suggestOptimalProducts function.
 * - SuggestOptimalProductsOutput - The output type for the suggestOptimalProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalProductsInputSchema = z.object({
  productData: z
    .string()
    .describe('The product data as a CSV file data URI (data:<mimetype>;base64,<encoded_data>).'),
  consumerReviews: z.string().describe('Consumer reviews related to the products.'),
  popularKeywords: z.string().describe('Popular keywords related to the products.'),
});

export type SuggestOptimalProductsInput = z.infer<
  typeof SuggestOptimalProductsInputSchema
>;

const SuggestOptimalProductsOutputSchema = z.object({
  suggestedProducts: z
    .string()
    .describe('A list of suggested products based on the input data.'),
});

export type SuggestOptimalProductsOutput = z.infer<
  typeof SuggestOptimalProductsOutputSchema
>;

export async function suggestOptimalProducts(
  input: SuggestOptimalProductsInput
): Promise<SuggestOptimalProductsOutput> {
  return suggestOptimalProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalProductsPrompt',
  input: {schema: SuggestOptimalProductsInputSchema},
  output: {schema: SuggestOptimalProductsOutputSchema},
  prompt: `You are an AI assistant designed to suggest optimal products based on product data, consumer reviews, and popular keywords.

  Analyze the following data to provide a list of suggested products that would be successful in the market.

  Product Data (CSV):
  {{productData}}

  Consumer Reviews:
  {{consumerReviews}}

  Popular Keywords:
  {{popularKeywords}}

  Based on this information, what products do you suggest? Give your response as a list. Explain your reasoning.`,
});

const suggestOptimalProductsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalProductsFlow',
    inputSchema: SuggestOptimalProductsInputSchema,
    outputSchema: SuggestOptimalProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
