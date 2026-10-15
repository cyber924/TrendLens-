'use server';
/**
 * @fileOverview Generates a single product image based on a specific template and variables.
 *
 * - generateProductImage - The main function to call.
 * - GenerateProductImageInput - The input type for the function.
 * - GenerateProductImageOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const promptTemplates = {
  keyVisual: `A professional product hero shot of [productName]. If a person is present, it is a stylish Korean model. [vibe] vibe, premium magazine style, high-quality, professional studio lighting, neutral background.`,
  closeUp: `Macro close-up of [productName] focusing on [feature]. Professional product photography, clean background, detailed texture, sharp focus, soft shadows.`,
  lifestyle: `A Korean person naturally interacting with [productName] while [activity] in a [location]. Warm tone, cinematic style, lifestyle photography, soft natural lighting, candid and authentic composition.`,
  flatLay: `Top-down flat lay of [productName] with relevant props. Organized and aesthetic composition, bright and airy lighting, professional ecommerce style.`,
  review: `Smartphone photo style, a Korean person taking a selfie with [productName] in a cozy room. Natural lighting, real-user review vibe, high-quality but realistic, overlay text in Korean saying "[reviewText]".`,
  comparison: `Split screen comparison: [beforeState] vs. [afterState] using [productName]. Clear distinction, professional presentation, informative and clean layout.`,
  icon: `Minimalist line icon or simple 3D render of [iconTopic], centered on a clean white background, high-contrast, modern UI element style.`,
};

const imageGenerationTemplateKeys = Object.keys(promptTemplates) as [keyof typeof promptTemplates, ...(keyof typeof promptTemplates)[]];

const GenerateProductImageInputSchema = z.object({
  template: z.enum(imageGenerationTemplateKeys),
  variables: z.record(z.string()).describe('Variables to fill in the template, e.g., { productName: "Silk Blouse" }'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;

export type GenerateProductImageOutput = string; // The data URI of the generated image.

export async function generateProductImage(input: GenerateProductImageInput): Promise<GenerateProductImageOutput> {
    const template = promptTemplates[input.template];
    if (!template) {
        throw new Error(`Invalid template key: ${input.template}`);
    }

    // Dynamically create the final prompt string from the template and variables
    const finalPrompt = Object.entries(input.variables).reduce(
        (prompt, [key, value]) => prompt.replace(`[${key}]`, value),
        template
    );
    
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: finalPrompt,
            config: {
              safetySettings: [
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              ]
            }
        });

        const imageUrl = media?.url;

        if (!imageUrl) {
            throw new Error('AI가 이미지를 생성했지만, 유효한 URL을 반환하지 않았습니다.');
        }
        return imageUrl;

    } catch (error: any) {
         console.error("Error in generateProductImage flow:", error);
         if (error.message?.includes('content filters') || error.message?.includes('predictions')) {
            throw new Error('요청하신 프롬프트가 안전 가이드라인에 의해 차단되었습니다. 다른 단어를 사용하여 시도해 주세요.');
         }
         throw new Error(`AI 이미지 생성 중 오류가 발생했습니다: ${error.message}`);
    }
}
