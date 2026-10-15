import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch URL. Status: ${response.status} ${response.statusText}` }, { status: response.status });
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    $('script, style').remove();
    
    const bodyText = $('body').text().replace(/\s\s+/g, ' ').trim();
    
    return NextResponse.json({ text: bodyText.substring(0, 8000) });

  } catch (error: any) {
    console.error(`Error during scraping for ${url}:`, error);
    return NextResponse.json({ error: `Failed to scrape URL. Error: ${error.message}` }, { status: 500 });
  }
}
