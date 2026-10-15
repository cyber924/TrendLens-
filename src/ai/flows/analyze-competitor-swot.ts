
'use server';
/**
 * @fileOverview Analyzes a competitor's product page and generates a SWOT analysis.
 *
 * - analyzeCompetitorSwot - The main function to call.
 * - AnalyzeCompetitorSwotInput - The input type for the function.
 * - AnalyzeCompetitorSwotOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { scrapeWebsiteText } from '../tools/web-scraper-tool';

const AnalyzeCompetitorSwotInputSchema = z.object({
  productUrl: z.string().url().describe('The URL of the competitor product to analyze.'),
});
export type AnalyzeCompetitorSwotInput = z.infer<typeof AnalyzeCompetitorSwotInputSchema>;

const AnalyzeCompetitorSwotOutputSchema = z.object({
  productName: z.string().describe('The name of the analyzed product.'),
  strengths: z.array(z.string()).describe('List of strengths for the product.'),
  weaknesses: z.array(z.string()).describe('List of weaknesses for the product.'),
  opportunities: z.array(z.string()).describe('List of opportunities based on the analysis.'),
  threats: z.array(z.string()).describe('List of threats based on the analysis.'),
  keyMetrics: z.object({
      price: z.number().describe('The extracted price of the product.'),
      reviewCount: z.number().describe('The extracted number of reviews.'),
  }),
  summary: z.string().describe('A final summary and recommended action plan.'),
});
export type AnalyzeCompetitorSwotOutput = z.infer<typeof AnalyzeCompetitorSwotOutputSchema>;


export async function analyzeCompetitorSwot(input: AnalyzeCompetitorSwotInput): Promise<AnalyzeCompetitorSwotOutput> {
  const scrapedText = await scrapeWebsiteText({ url: input.productUrl });
  if (!scrapedText || scrapedText.startsWith('Failed to scrape')) {
    throw new Error(`URL에서 콘텐츠를 가져올 수 없습니다. 주소를 확인해주세요. 원인: ${scrapedText}`);
  }

  const { output } = await competitorSwotPrompt({ scrapedText });

  if (!output) {
    throw new Error("AI가 분석 리포트를 생성하지 못했습니다. 다시 시도해 주세요.");
  }

  return output;
}

const competitorSwotPrompt = ai.definePrompt({
    name: 'competitorSwotPrompt',
    input: { schema: z.object({ scrapedText: z.string() }) },
    output: { schema: AnalyzeCompetitorSwotOutputSchema },
    prompt: `You are an expert e-commerce business analyst. Your task is to perform a SWOT analysis on a competitor's product based on its scraped page content.

**Instructions:**
1.  **Parse the Data:** Analyze the provided "Scraped Website Text" to identify the product name, price, number of reviews, and key features.
2.  **Perform SWOT Analysis:**
    *   **Strengths:** What are the product's strong points? (e.g., good price, unique feature, great storytelling)
    *   **Weaknesses:** What is the product lacking? (e.g., few reviews, unclear description, high price)
    *   **Opportunities:** What market gaps can *we* exploit based on their weaknesses? (e.g., "We can target customers who value eco-friendly materials," "We can offer a wider range of colors")
    *   **Threats:** What external factors could be a threat? (e.g., high competition in this niche, dependency on a single trend)
3.  **Extract Key Metrics:** Pull out the exact price and review count as numbers. If they are not present, use 0.
4.  **Summarize and Recommend:** Provide a final summary and a concrete, actionable recommendation for our business.
5.  **Language:** The entire response, including the analysis, must be in **KOREAN**.

---
**Scraped Website Text:**
\`\`\`
{{scrapedText}}
\`\`\`
---

Now, generate the complete SWOT analysis in the specified JSON format.
`,
});

