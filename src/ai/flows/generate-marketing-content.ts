'use server';

/**
 * @fileOverview Generates a comprehensive marketing campaign plan based on product info and target audience.
 *
 * - generateMarketingContent - A function that handles the generation of the marketing plan.
 * - GenerateMarketingContentInput - The input type for the generateMarketingContent function.
 * - GenerateMarketingContentOutput - The return type for the generateMarketingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingContentInputSchema = z.object({
  productName: z.string().describe('The name of the product to promote.'),
  productDescription: z.string().describe('A brief description of the product and its key features.'),
  targetAudience: z.string().describe('A detailed description of the target audience (e.g., age, interests, lifestyle).'),
});
export type GenerateMarketingContentInput = z.infer<typeof GenerateMarketingContentInputSchema>;

const GenerateMarketingContentOutputSchema = z.object({
  report: z.string().describe('A comprehensive marketing plan formatted in Markdown.'),
});
export type GenerateMarketingContentOutput = z.infer<typeof GenerateMarketingContentOutputSchema>;

export async function generateMarketingContent(
  input: GenerateMarketingContentInput
): Promise<GenerateMarketingContentOutput> {
  return generateMarketingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketingPlanPrompt',
  input: {schema: GenerateMarketingContentInputSchema},
  output: {schema: GenerateMarketingContentOutputSchema},
  prompt: `You are an expert Senior Marketer, skilled in creating comprehensive and actionable marketing strategies for e-commerce brands.

Your task is to generate a detailed marketing plan based on the provided product information.

**Product Information:**
-   **Product Name:** {{{productName}}}
-   **Description:** {{{productDescription}}}
-   **Target Audience:** {{{targetAudience}}}

**Instructions:**
Generate a comprehensive marketing plan in **KOREAN**, formatted in **Markdown**. The plan must include the following sections:

1.  \`## 🎯 타겟 고객 분석 및 핵심 메시지 (Target Audience Analysis & Key Message)\`
    *   Analyze the provided target audience and define a powerful, core marketing message that will resonate with them.

2.  \`## 🚀 채널별 마케팅 캠페인 아이디어 (Marketing Campaign Ideas by Channel)\`
    *   Provide creative and specific content ideas for each channel.
    *   \`### 📱 SNS (인스타그램, 틱톡) 콘텐츠 제안\`
        *   (Suggest 2-3 specific, engaging ideas for Instagram Reels or TikTok videos. Include concepts and suggested captions.)
    *   \`### ✉️ 이메일 뉴스레터 초안\`
        *   (Write a compelling subject line and a short draft for a promotional email.)
    *   \`### ✍️ 블로그 포스트 아이디어\`
        *   (Suggest 2 blog post titles and a brief outline for one of them, focusing on storytelling or providing value.)

3.  \`## 🔍 추천 광고 키워드 (Recommended Ad Keywords)\`
    *   List at least 10 relevant keywords for search engine and social media advertising, separated into primary and secondary keywords.

Structure the entire output as a single Markdown report.
`,
});

const generateMarketingContentFlow = ai.defineFlow(
  {
    name: 'generateMarketingContentFlow',
    inputSchema: GenerateMarketingContentInputSchema,
    outputSchema: GenerateMarketingContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
