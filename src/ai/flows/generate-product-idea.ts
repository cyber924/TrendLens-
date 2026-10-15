'use server';
/**
 * @fileOverview Generates a product idea report with visual concepts.
 * It first analyzes user intent to decide whether to generate a full report or just images.
 *
 * - generateProductIdea - A function that handles the generation process.
 * - GenerateProductIdeaInput - The input type for the generateProductIdea function.
 * - GenerateProductIdeaOutput - The return type for the generateProductIdea function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductIdeaInputSchema = z.string();
export type GenerateProductIdeaInput = z.infer<typeof GenerateProductIdeaInputSchema>;

const GenerateProductIdeaOutputSchema = z.object({
  report: z
    .string()
    .describe('A detailed product idea report formatted in Markdown.'),
  images: z
    .array(z.string())
    .describe(
      'An array of data URIs for the generated concept images (e.g., data:image/png;base64,...).'
    ),
});
export type GenerateProductIdeaOutput = z.infer<
  typeof GenerateProductIdeaOutputSchema
>;

export async function generateProductIdea(
  input: GenerateProductIdeaInput
): Promise<GenerateProductIdeaOutput> {
  return generateProductIdeaFlow(input);
}

// 1. A prompt to analyze the user's intent.
const intentAnalysisPrompt = ai.definePrompt({
    name: 'productIdeaIntentAnalysis',
    input: { schema: z.string() },
    output: {
        schema: z.object({
            intent: z.enum(['report', 'image']).describe("The user's primary intent. If the user asks for a product idea, plan, analysis, or anything that requires text generation, the intent is 'report'. If the user explicitly asks to create, draw, or generate an image, picture, or visual, the intent is 'image'."),
            imagePrompt: z.string().describe("A concise, descriptive English prompt suitable for an image generation model, based on the user's request. This should be generated regardless of the intent."),
        }),
    },
    prompt: `Analyze the user's request to determine their primary intent and create a suitable image generation prompt.

User Request: "{{{input}}}"

Based on the request, determine if the user wants a full product plan ('report') or primarily wants to create a specific image ('image').
Also, create a concise, descriptive English prompt for generating an image that captures the essence of the user's request. The prompt should be in English.`,
});


// 2. The prompt to generate the text report.
const reportPrompt = ai.definePrompt({
  name: 'productIdeaReportPrompt',
  input: {schema: z.string()},
  output: {
    schema: z.object({
      report: z
        .string()
        .describe('A detailed product idea report formatted in Markdown.'),
    }),
  },
  prompt: `You are a Senior Product Manager at a leading fashion e-commerce company in Korea.
Your task is to create a detailed product planning report based on a user's request.

**User Request:**
"{{{input}}}"

**Instructions:**
1.  **Analyze Request:** Deeply understand the user's intent, target audience, and core concepts.
2.  **Structure Report:** Create a comprehensive report using **Markdown**. The report MUST include the following sections:
    *   \`## 제품 컨셉 및 타겟 고객 (Product Concept & Target Audience)\`
    *   \`## 핵심 디자인 요소 (Key Design Elements)\` (e.g., color palette, materials, silhouette, details)
    *   \`## 마케팅 소구점 (Key Marketing Points)\` (e.g., copywriting, social media angles)
    *   \`## 추천 스타일링 (Styling Recommendations)\`
3.  **Language**: The entire report must be in **KOREAN**.`,
});

// 3. The main flow that orchestrates everything.
const generateProductIdeaFlow = ai.defineFlow(
  {
    name: 'generateProductIdeaFlow',
    inputSchema: GenerateProductIdeaInputSchema,
    outputSchema: GenerateProductIdeaOutputSchema,
  },
  async (query) => {
    // Step 1: Analyze user intent.
    const { output: intentResult } = await intentAnalysisPrompt(query);
    if (!intentResult) {
      throw new Error('사용자 의도를 분석하지 못했습니다.');
    }

    let reportText = '';
    const imageGenPrompt = intentResult.imagePrompt;

    // Step 2: Generate content based on intent.
    if (intentResult.intent === 'report') {
        // If the user wants a full report, generate it.
        const { output: reportOutput } = await reportPrompt(query);
        reportText = reportOutput?.report || '리포트를 생성하지 못했습니다.';
    } else {
        // If the user just wants an image, create a simple confirmation text.
        reportText = `요청하신 **"${query}"**에 대한 이미지를 생성했습니다.`;
    }
    
    // Step 3: Generate 3 images in parallel based on the determined prompt.
    // Use the updated image generation model identifier.
    const imagePromises = Array(3).fill(null).map(() => 
        ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: `A high-fashion, professional product photoshoot style image of: a fashion model wearing the '${imageGenPrompt}'. Centered, clean background, photorealistic.`,
            config: {
              safetySettings: [
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              ]
            }
        }).catch(err => {
            // Handle individual generation failures (like content filtering) gracefully
            console.error("Individual image generation failed:", err);
            return null;
        })
    );

    const imageResults = await Promise.all(imagePromises);
    const imageUrls = imageResults
      .filter((result): result is any => result !== null)
      .map(result => result.media?.url || '')
      .filter(url => url);

    return {
      report: reportText,
      images: imageUrls,
    };
  }
);
