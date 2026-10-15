'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing product data provided as CSV text.
 *
 * The flow takes CSV text as input, analyzes it using an AI prompt, and returns a comprehensive text-based report formatted in Markdown.
 * - analyzeProductData - The function to call to run the flow.
 * - AnalyzeProductDataInput - The input type for the analyzeProductData function.
 * - AnalyzeProductDataOutput - The output type for the analyzeProductData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductDataInputSchema = z.object({
  csvText: z
    .string()
    .describe('The product data in CSV format as a raw text string.'),
});
export type AnalyzeProductDataInput = z.infer<typeof AnalyzeProductDataInputSchema>;

const AnalyzeProductDataOutputSchema = z.object({
  analysisReport: z
    .string()
    .describe('A comprehensive, Markdown-formatted analysis report of the CSV data.'),
});
export type AnalyzeProductDataOutput = z.infer<typeof AnalyzeProductDataOutputSchema>;

export async function analyzeProductData(
  input: AnalyzeProductDataInput
): Promise<AnalyzeProductDataOutput> {
  return analyzeProductDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProductDataPrompt',
  input: {schema: AnalyzeProductDataInputSchema},
  output: {schema: AnalyzeProductDataOutputSchema},
  prompt: `You are an expert data analyst specializing in e-commerce product data. Your task is to analyze the provided CSV data and write a comprehensive analysis report.

**Instructions:**
1.  **Analyze Key Areas:** Identify key trends, patterns, and insights from the data. Focus on aspects like:
    *   **Sales Performance:** Overall sales trends. Are they increasing or decreasing? Are there any seasonal patterns?
    *   **Category Analysis:** Which product categories are performing best or worst?
    *   **Stock-to-Sales Ratio:** Is there too much stock for certain items? Are popular items at risk of selling out?
    *   **Pricing Insights:** How does pricing seem to affect sales?
2.  **Provide Actionable Recommendations:** Based on your analysis, suggest concrete actions the user can take (e.g., "Consider a marketing campaign for the '셔츠' category," "Restock '드레스' as sales are high and stock is low.").
3.  **Format the Output as a Markdown Report:** Structure your response as a clear, easy-to-read report. Use Markdown for formatting:
    *   Use \`#\` for the main title (e.g., \`# CSV 데이터 분석 리포트\`).
    *   Use \`##\` for section titles (e.g., \`## 주요 분석 내용\`).
    *   Use bullet points (\`-\` or \`*\`) for lists.
    *   Use bold text (\`**\`) for important keywords or metrics.
    *   If the data is suitable, present numerical comparisons in a Markdown table.
4.  **Language**: The entire response must be in **KOREAN**.

**CSV Data to Analyze:**
\`\`\`csv
{{{csvText}}}
\`\`\`
`,
});

const analyzeProductDataFlow = ai.defineFlow(
  {
    name: 'analyzeProductDataFlow',
    inputSchema: AnalyzeProductDataInputSchema,
    outputSchema: AnalyzeProductDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
