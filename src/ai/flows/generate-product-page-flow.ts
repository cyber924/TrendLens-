
'use server';
/**
 * @fileOverview Generates a product detail page based on a URL and a strategy.
 *
 * - generateProductPage - The main function to call.
 * - GenerateProductPageInput - The input type for the function.
 * - GenerateProductPageOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateProductPageInputSchema = z.object({
    scrapedText: z.string().describe('The pre-scraped text content of the product page.'),
    strategy: z.string().describe('The strategy for recreating the page (e.g., target audience, tone, key points).')
});
export type GenerateProductPageInput = z.infer<typeof GenerateProductPageInputSchema>;

const GenerateProductPageOutputSchema = z.object({
    htmlContent: z.string().describe('The generated HTML content for the new product page.'),
});
export type GenerateProductPageOutput = z.infer<typeof GenerateProductPageOutputSchema>;


export async function generateProductPage(input: GenerateProductPageInput): Promise<GenerateProductPageOutput> {
  const { output } = await pageGeneratorPrompt(input);

  const htmlContent = output?.htmlContent;

  if (!htmlContent) {
    throw new Error("AI가 상세 페이지를 생성하지 못했습니다. 다시 시도해 주세요.");
  }

  return { htmlContent };
}

// This prompt takes the scraped data and the user's strategy to build the final page.
const pageGeneratorPrompt = ai.definePrompt({
    name: 'productPageGeneratorPrompt',
    input: { schema: GenerateProductPageInputSchema },
    output: { schema: GenerateProductPageOutputSchema },
    prompt: `You are an expert marketer and copywriter who creates high-converting e-commerce product detail pages.
Your task is to recreate a product page based on scraped text content and a given strategy.

**Instructions:**
1.  **Analyze the Data:** Read through the provided "Scraped Website Text" to understand the original product's features, benefits, and specifications.
2.  **Apply the Strategy:** Strictly follow the user's "Strategy" to guide the tone, structure, and focus of the new page. For example, if the strategy is "target 20-somethings with a humorous tone," reflect that in your writing.
3.  **Generate HTML:** Create the response as a single HTML string.
    *   **Styling:** Use Tailwind CSS classes directly within the HTML for styling. DO NOT use \`<style>\` tags or external CSS files.
    *   **Structure:** Create logical sections (e.g., introduction, key features, specifications, customer problem/solution). Use semantic HTML tags (\`<h2>\`, \`<p>\`, \`<ul>\`, etc.).
    *   **Images:** You MUST create at least 3 sections with a placeholder image. Use placeholder images from \`https://placehold.co/800x600.png\`.
    *   **Language:** The entire response must be in **KOREAN**.
4.  **Conversion-Focused:** The final page should be compelling, easy to read, and designed to persuade a customer to make a purchase.

---
**Scraped Website Text:**
\`\`\`
{{scrapedText}}
\`\`\`

**Strategy:**
"{{{strategy}}}"
---

Now, generate the \`htmlContent\`.
`,
});
