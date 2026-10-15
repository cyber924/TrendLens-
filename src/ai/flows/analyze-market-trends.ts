'use server';

/**
 * @fileOverview An AI agent for analyzing market trends with precise date ranges.
 *
 * - analyzeMarketTrends - A function that handles the market trend analysis process.
 * - AnalyzeMarketTrendsInput - The input type for the analyzeMarketTrends function.
 * - AnalyzeMarketTrendsOutput - The return type for the analyzeMarketTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketTrendsInputSchema = z.object({
  platform: z
    .enum(['Naver', 'Coupang', 'Zigzag'])
    .describe('The e-commerce platform to analyze.'),
  category: z.string().describe('The product category to analyze (e.g., dresses, shirts).'),
  startDate: z.string().optional().describe('The start date for analysis in YYYY-MM-DD format.'),
  endDate: z.string().optional().describe('The end date for analysis in YYYY-MM-DD format.'),
});
export type AnalyzeMarketTrendsInput = z.infer<typeof AnalyzeMarketTrendsInputSchema>;

const TrendItemSchema = z.object({
  item: z.string().describe('The name of the trending item (keyword, material, or color).'),
  description: z.string().describe('A detailed description and analysis of why this item is trending.'),
  productIdea: z.string().describe('A concrete product idea that utilizes this trend.'),
});

const AnalyzeMarketTrendsOutputSchema = z.object({
  topKeywords: z.array(TrendItemSchema).describe('Top 5 trending keywords with analysis.'),
  topMaterials: z.array(TrendItemSchema).describe('Top 5 trending materials with analysis.'),
  topColors: z.array(TrendItemSchema).describe('Top 5 trending colors with analysis.'),
});
export type AnalyzeMarketTrendsOutput = z.infer<typeof AnalyzeMarketTrendsOutputSchema>;

export async function analyzeMarketTrends(
  input: AnalyzeMarketTrendsInput
): Promise<AnalyzeMarketTrendsOutput> {
  const now = new Date();
  const pastMonth = new Date();
  pastMonth.setMonth(now.getMonth() - 1);
  const defaultEndDate = now.toISOString().split('T')[0];
  const defaultStartDate = pastMonth.toISOString().split('T')[0];

  const enrichedInput = {
    ...input,
    startDate: input.startDate || defaultStartDate,
    endDate: input.endDate || defaultEndDate,
  };

  return analyzeMarketTrendsFlow(enrichedInput);
}

const prompt = ai.definePrompt({
  name: 'analyzeMarketTrendsPrompt',
  input: {schema: AnalyzeMarketTrendsInputSchema},
  output: {schema: AnalyzeMarketTrendsOutputSchema},
  prompt: `You are a world-class market analysis expert specializing in Korean e-commerce trends in 2026.

**CRITICAL CONTEXT:**
- **Today's Date:** 2026-03-01 (March 1st, 2026).
- **Target Analysis Period:** From {{{startDate}}} to {{{endDate}}}.

Your task is to identify and analyze trends specifically for the {{category}} category on {{platform}} within the target period.

**Instructions:**
1.  **Stay Up-to-Date:** Ensure the trends are relevant to the 2026 market environment. Do NOT use outdated information from 2024 or earlier unless it's a continuing multi-year trend.
2.  **Analysis Detail:** Identify the top 5 trending keywords, materials, and colors.
3.  **Actionable Output:** For each item, provide a detailed description of WHY it is trending and a CONCRETE product idea that a modern Korean brand can execute right now.
4.  **Language:** You MUST write the entire response in Korean.

Output the results in the specified JSON format.`,
});

const analyzeMarketTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeMarketTrendsFlow',
    inputSchema: AnalyzeMarketTrendsInputSchema,
    outputSchema: AnalyzeMarketTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
