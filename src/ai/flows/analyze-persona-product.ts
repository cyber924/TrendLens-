'use server';
/**
 * @fileOverview Generates a product recommendation report based on a customer persona.
 *
 * - analyzePersonaProduct - A function that handles the generation process.
 * - AnalyzePersonaProductInput - The input type for the analyzePersonaProduct function.
 * - AnalyzePersonaProductOutput - The return type for the analyzePersonaProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePersonaProductInputSchema = z.object({
  persona: z
    .string()
    .describe('A detailed description of the target customer persona.'),
  category: z.string().describe('The product category to focus on.'),
});
export type AnalyzePersonaProductInput = z.infer<
  typeof AnalyzePersonaProductInputSchema
>;

const AnalyzePersonaProductOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A detailed product recommendation report formatted in Markdown, tailored to the persona.'
    ),
});
export type AnalyzePersonaProductOutput = z.infer<
  typeof AnalyzePersonaProductOutputSchema
>;

export async function analyzePersonaProduct(
  input: AnalyzePersonaProductInput
): Promise<AnalyzePersonaProductOutput> {
  return analyzePersonaProductFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePersonaProductPrompt',
  input: {schema: AnalyzePersonaProductInputSchema},
  output: {schema: AnalyzePersonaProductOutputSchema},
  prompt: `You are a Senior Product Strategist specializing in persona-based product development for the fashion industry.

Your task is to create a detailed product recommendation report for the given product category, specifically tailored to the provided customer persona.

**Persona Analysis:**
First, deeply analyze the provided persona. Understand their values, lifestyle, needs, and potential pain points related to fashion.

**Product Recommendation:**
Based on your persona analysis, recommend a single, highly-specific product within the given category.

**Report Generation:**
Generate a comprehensive report using **Markdown**. The report must be in **KOREAN** and include the following sections:

*   \`## 타겟 페르소나 분석 (Target Persona Analysis)\`
    *   (페르소나의 핵심 특징, 가치관, 라이프스타일 등을 요약)
*   \`## 제품 제안: [제품명] (Product Recommendation: [Product Name])\`
    *   (페르소나에게 왜 이 제품이 매력적인지 핵심 컨셉을 설명)
*   \`## 핵심 디자인 및 소재 (Key Design & Materials)\`
    *   (페르소나의 취향을 저격할 구체적인 디자인 요소, 색상, 소재 등을 제안)
*   \`## 마케팅 메시지 제안 (Marketing Message Suggestions)\`
    *   (이 페르소나의 마음을 움직일 수 있는 구체적인 소셜 미디어 문구나 광고 카피 제안)

---
**INPUT:**
-   **Target Persona:** {{{persona}}}
-   **Product Category:** {{{category}}}

Generate the report now.
`,
});

const analyzePersonaProductFlow = ai.defineFlow(
  {
    name: 'analyzePersonaProductFlow',
    inputSchema: AnalyzePersonaProductInputSchema,
    outputSchema: AnalyzePersonaProductOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
