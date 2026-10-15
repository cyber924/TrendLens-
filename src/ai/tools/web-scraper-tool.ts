
'use server';
/**
 * @fileOverview A Genkit tool for scraping the text content of a website.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';


async function performScraping(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                // Some websites block requests without a user-agent.
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            // If response is not OK, return an error message with status.
            return `Failed to scrape URL. Status: ${response.status} ${response.statusText}`;
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script and style tags to clean up the content.
        $('script, style').remove();
        
        // Extract text from the body, which is more likely to contain the main content.
        // We replace multiple newlines/spaces with a single space for cleaner text.
        const bodyText = $('body').text().replace(/\s\s+/g, ' ').trim();
        
        // Return a substring to avoid overly large text payloads.
        return bodyText.substring(0, 8000);

    } catch (error: any) {
        console.error(`Error during scraping for ${url}:`, error);
        return `Failed to scrape URL. Error: ${error.message}`;
    }
}


export const scrapeWebsiteText = ai.defineTool(
  {
    name: 'scrapeWebsiteText',
    description: '지정된 URL에서 웹사이트의 텍스트 콘텐츠를 스크랩(추출)합니다.',
    inputSchema: z.object({
      url: z.string().url().describe('스크랩할 웹사이트의 전체 URL'),
    }),
    outputSchema: z.string().describe('추출된 웹사이트의 텍스트 콘텐츠.'),
  },
  async (input) => {
    return await performScraping(input.url);
  }
);
