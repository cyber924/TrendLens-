
'use server';
/**
 * @fileOverview Chains multiple AI flows to generate a comprehensive product plan from a single keyword.
 *
 * - generateAutomatedProductPlan - The main function to call.
 * - GenerateAutomatedProductPlanInput - The input type for the function.
 * - GenerateAutomatedProductPlanOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { analyzeMarketTrends, AnalyzeMarketTrendsOutput } from './analyze-market-trends';
import { generateProductIdea, GenerateProductIdeaOutput } from './generate-product-idea';
import { generateMarketingContent, GenerateMarketingContentOutput } from './generate-marketing-content';

const GenerateAutomatedProductPlanInputSchema = z.object({
  keyword: z.string().describe('The initial keyword or product category to plan for (e.g., "summer dress").'),
});
export type GenerateAutomatedProductPlanInput = z.infer<typeof GenerateAutomatedProductPlanInputSchema>;

// Re-define schemas locally as they cannot be exported from 'use server' files.
const TrendItemSchema = z.object({
  item: z.string(),
  description: z.string(),
  productIdea: z.string(),
});
const AnalyzeMarketTrendsOutputSchema = z.object({
  topKeywords: z.array(TrendItemSchema),
  topMaterials: z.array(TrendItemSchema),
  topColors: z.array(TrendItemSchema),
}).describe('The result of the initial market trend analysis.');

const GenerateProductIdeaOutputSchema = z.object({
    report: z.string(),
    images: z.array(z.string()),
}).describe('The generated product idea based on the trends.');

const GenerateMarketingContentOutputSchema = z.object({
    report: z.string(),
}).describe('The marketing plan for the generated product idea.');


const GenerateAutomatedProductPlanOutputSchema = z.object({
  trendAnalysis: AnalyzeMarketTrendsOutputSchema,
  productIdea: GenerateProductIdeaOutputSchema,
  marketingPlan: GenerateMarketingContentOutputSchema,
});
export type GenerateAutomatedProductPlanOutput = z.infer<typeof GenerateAutomatedProductPlanOutputSchema>;


export async function generateAutomatedProductPlan(input: GenerateAutomatedProductPlanInput): Promise<GenerateAutomatedProductPlanOutput> {
    
  const now = new Date();
  const pastMonth = new Date();
  pastMonth.setMonth(now.getMonth() - 1);
  const endDate = now.toISOString().split('T')[0];
  const startDate = pastMonth.toISOString().split('T')[0];

  // 1. Analyze Market Trends based on the initial keyword
  const trendAnalysis = await analyzeMarketTrends({
    platform: 'Naver', // Default to Naver for this automated flow
    category: input.keyword,
    startDate,
    endDate,
  });

  if (!trendAnalysis.topKeywords.length) {
    throw new Error('초기 트렌드 분석에서 키워드를 찾지 못했습니다. 다른 키워드로 시도해보세요.');
  }

  // 2. Generate a Product Idea using the top trend keyword
  const topKeyword = trendAnalysis.topKeywords[0].item;
  const productIdeaPrompt = `${input.keyword} 카테고리 내에서 '${topKeyword}' 트렌드를 반영한 제품 아이디어`;
  const productIdea = await generateProductIdea(productIdeaPrompt);

  // Extract a simple product name and description from the markdown report
  const reportLines = productIdea.report.split('\n');
  const productNameLine = reportLines.find(line => line.includes('## 제품 컨셉 및 타겟 고객')) || 'AI 추천 상품';
  const productName = productNameLine.split(':')[1]?.trim() || 'AI 추천 상품';
  const productDescription = productIdea.report; // Use full report as description

  // 3. Generate a Marketing Plan for the new product idea
  const marketingPlan = await generateMarketingContent({
    productName: productName,
    productDescription: productDescription,
    targetAudience: `"${topKeyword}" 트렌드에 관심이 많은 20-30대 소비자`, // Create a generic target audience
  });

  return {
    trendAnalysis,
    productIdea,
    marketingPlan,
  };
}
