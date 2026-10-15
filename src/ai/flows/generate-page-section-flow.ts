'use server';
/**
 * @fileOverview Generates a single section of a product detail page based on a template and strategy.
 *
 * - generatePageSection - The main function to call.
 * - GeneratePageSectionInput - The input type for the function.
 * - GeneratePageSectionOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePageSectionInputSchema = z.object({
    productInfo: z.string().describe('The basic information about the product (name, features, etc.).'),
    strategy: z.string().describe('The strategy for recreating the page (e.g., target audience, tone, key points).'),
    templateType: z.string().describe('The chosen page template type.'),
    sectionDefinition: z.string().describe('The definition and goal of the specific section to generate.'),
    previousSectionsHtml: z.string().optional().describe('The HTML content of previously generated sections to maintain context.'),
});
export type GeneratePageSectionInput = z.infer<typeof GeneratePageSectionInputSchema>;

const GeneratePageSectionOutputSchema = z.object({
    htmlContent: z.string().describe('The generated HTML content for the requested section.'),
});
export type GeneratePageSectionOutput = z.infer<typeof GeneratePageSectionOutputSchema>;

export async function generatePageSection(input: GeneratePageSectionInput): Promise<GeneratePageSectionOutput> {
  const { output } = await pageSectionGeneratorPrompt(input);

  const htmlContent = output?.htmlContent;

  if (!htmlContent) {
    throw new Error("AI가 상세 페이지 섹션을 생성하지 못했습니다. 다시 시도해 주세요.");
  }

  return { htmlContent };
}

const pageSectionGeneratorPrompt = ai.definePrompt({
    name: 'pageSectionGeneratorPrompt',
    input: { schema: GeneratePageSectionInputSchema },
    output: { schema: GeneratePageSectionOutputSchema },
    prompt: `You are a world-class e-commerce UI/UX designer and premium conversion copywriter.
Your style is minimal, sophisticated, and magazine-like (e.g., 29CM, Musinsa Magazine, Market Kurly).

**STRICT DESIGN RULES:**
1.  **Width:** Everything MUST fit within a **860px** width. Use \`max-w-[860px]\` and \`w-full\`.
2.  **Color Palette:** Use the following CSS variables for colors:
    - Background: \`var(--dp-bg)\` (#fafaf7)
    - Paper: \`var(--dp-paper)\` (#ffffff)
    - Text: \`var(--dp-ink)\` (#0a0a0a)
    - Muted Text: \`var(--dp-ink-muted)\` (#5a5a5a)
    - Border/Line: \`var(--dp-line)\` (#e5e5e5)
    - Accent (CTA): \`var(--dp-accent)\` (#e63946)
3.  **Typography:** 
    - Title/Display: \`font-serif\` (Playfair Display)
    - Body: \`font-sans\` (Pretendard)
    - Code/Spec: \`font-mono\` (JetBrains Mono)
    - Use \`word-break: keep-all\` for all Korean text.
4.  **Layout:** Use plenty of white space. No "emojis". No cheap sales-y banners. Use sophisticated grids and flexbox.

**COPYWRITING RULES:**
1.  **NO EMOJIS.** Not even one.
2.  **Forbidden Words:** Never use "여리여리", "갱신", "인생샷", "심쿵", "혜자", "핵잼", "대박", "존맛", "존예", "미쳤다", "갓생".
3.  **Style:** Short, punchy, elegant. Use verbs and nouns. Max 20 chars per sentence.
4.  **Recommended Patterns:**
    - "{X}지만, 결코 {X}하지 않은."
    - "{X} 한 장으로, {Y}."
    - "한 번 입어보면 알 수 있는 차이."
    - "{X}이 차이를 만듭니다."

**Overall Context:**
- **Product Info:** {{{productInfo}}}
- **Overall Strategy:** "{{{strategy}}}"

---
**Current Task: Generate ONLY the following section:**
- **Section Goal:** {{{sectionDefinition}}}

**Technical Instructions:**
1. Generate a SINGLE \`div\` block. 
2. Use Tailwind CSS classes. 
3. Include high-quality placeholder images using \`https://picsum.photos/seed/[random]/860/600\`.
4. Language: Premium KOREAN.

Now, generate the sophisticated \`htmlContent\`.
`,
});