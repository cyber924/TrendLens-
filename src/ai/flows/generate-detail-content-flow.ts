
'use server';
/**
 * @fileOverview Generates structured content for a premium detail page.
 */
import { ai } from '@/ai/genkit';
import { buildContentPrompt } from '@/lib/detail-page/prompts';
import { DetailPageContentSchema, type DetailPageContent } from '@/lib/detail-page/schema';
import { z } from 'zod';

const InputSchema = z.object({
  productInfo: z.string(),
  strategy: z.string(),
});

export async function generateDetailContent(input: z.infer<typeof InputSchema>): Promise<DetailPageContent> {
  const { output } = await ai.generate({
    prompt: buildContentPrompt(input.productInfo, input.strategy),
    output: { schema: DetailPageContentSchema },
  });

  if (!output) {
    throw new Error("AI가 콘텐츠를 생성하지 못했습니다.");
  }

  return output;
}
