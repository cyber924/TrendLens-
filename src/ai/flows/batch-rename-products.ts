'use server';
/**
 * @fileOverview Generates new product names in bulk based on a concept.
 *
 * - batchRenameProducts - The function to call to run the flow.
 * - BatchRenameProductsInput - The input type for the function.
 * - BatchRenameProductsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BatchRenameProductsInputSchema = z.object({
  productNames: z
    .array(z.string())
    .describe('An array of original product names to be renamed.'),
  concept: z
    .string()
    .describe(
      'The core concept or instruction for renaming (e.g., "Make it sound more luxurious", "Add summer-related keywords").'
    ),
});
export type BatchRenameProductsInput = z.infer<
  typeof BatchRenameProductsInputSchema
>;

const RenamedProductSchema = z.object({
  originalName: z.string().describe('The original product name.'),
  newName: z
    .string()
    .describe('The newly generated product name based on the concept.'),
  keywords: z
    .array(z.string())
    .describe(
      'An array of 2-3 relevant SEO keywords for the new product name.'
    ),
});

const BatchRenameProductsOutputSchema = z.object({
  renamedProducts: z
    .array(RenamedProductSchema)
    .describe('An array of objects containing original and new product names.'),
});
export type BatchRenameProductsOutput = z.infer<
  typeof BatchRenameProductsOutputSchema
>;

export async function batchRenameProducts(
  input: BatchRenameProductsInput
): Promise<BatchRenameProductsOutput> {
  return batchRenameProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'batchRenameProductsPrompt',
  input: {schema: BatchRenameProductsInputSchema},
  output: {schema: BatchRenameProductsOutputSchema},
  prompt: `You are an expert copywriter and branding specialist for an e-commerce platform.

Your task is to rename a list of products based on a given concept. For each product, you must provide:
1.  **newName**: A creative and appealing new name that aligns with the provided concept.
2.  **keywords**: 2-3 relevant and effective SEO keywords that a user might search for to find this product.

The entire response must be in **KOREAN**.

**Concept/Instruction:**
"{{{concept}}}"

**Product List to Rename:**
{{#each productNames}}
-   {{{this}}}
{{/each}}

Produce the output in the specified JSON format.
`,
});

const batchRenameProductsFlow = ai.defineFlow(
  {
    name: 'batchRenameProductsFlow',
    inputSchema: BatchRenameProductsInputSchema,
    outputSchema: BatchRenameProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
