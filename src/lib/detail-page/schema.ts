
import { z } from 'zod';

export const DetailPageContentSchema = z.object({
  productName: z.string().describe('Product name in Korean'),
  productNameEn: z.string().describe('Product name in English'),
  season: z.string().describe('Season string, e.g., 24 SUMMER, 25 SPRING'),
  
  page1: z.object({
    eyebrow: z.string().describe('Upper small label, e.g., A MOMENT — SILK EDITION'),
    titleLine1: z.string().describe('First line of title, e.g., 가볍지만,'),
    titleLine2Normal: z.string().describe('Second line title normal part, e.g., 결코'),
    titleLine2Italic: z.string().describe('Second line title highlighted italic part, e.g., 가볍지 않은.'),
    subtitle: z.string().describe('Short subcopy, max 20 chars'),
    usp: z.array(z.object({
      num: z.string().describe('Number part, e.g., 01, 100'),
      suffix: z.string().describe('Suffix for number, e.g., %, g, mm'),
      label: z.string().describe('Short description, e.g., 가벼운 무게, 천연 소재'),
      imageUrl: z.string().optional().describe('Point image URL')
    })).max(4),
    heroImageUrl: z.string().optional().describe('Main hero image URL'),
  }),
  
  page2: z.object({
    titleNormal: z.string().describe('Normal title part'),
    titleItalic: z.string().describe('Italic highlighted title part'),
    sub: z.string().describe('Subcopy explaining the problems'),
    problems: z.array(z.string()).length(4).describe('4 specific customer pain points'),
    bottomCtaText: z.string().describe('Text before strong CTA'),
    bottomCtaStrong: z.string().describe('Strong CTA text at bottom'),
  }),
  
  page4: z.object({
    titleNormal: z.string().describe('Section title normal'),
    titleItalic: z.string().describe('Section title italic'),
    sub: z.string().describe('Section subtext'),
    details: z.array(z.object({
      title: z.string(),
      desc: z.string(),
      imageUrl: z.string().optional().describe('Detail image URL'),
    })).length(4),
    highlight: z.object({
      titleNormal: z.string(),
      titleItalic: z.string(),
      desc: z.string(),
      specs: z.array(z.string()).length(3),
      imageUrl: z.string().optional().describe('Highlight image URL'),
    })
  }),
  
  page8: z.object({
    faqTitleNormal: z.string(),
    faqTitleItalic: z.string(),
    faqs: z.array(z.object({
      q: z.string(),
      a: z.string()
    })).length(4),
    ctaTitleNormal: z.string(),
    ctaTitleItalic: z.string(),
    originalPrice: z.number(),
    currentPrice: z.number(),
    discountPercent: z.number(),
  })
});

export type DetailPageContent = z.infer<typeof DetailPageContentSchema>;
