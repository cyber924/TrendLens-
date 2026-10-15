
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-market-trends.ts';
import '@/ai/flows/suggest-optimal-products.ts';
import '@/ai/flows/analyze-product-data.ts';
import '@/ai/flows/generate-marketing-content.ts';
import '@/ai/flows/generate-product-idea.ts';
import '@/ai/flows/analyze-persona-product.ts';
import '@/ai/flows/generate-insight-report.ts';
import '@/ai/flows/batch-rename-products.ts';
import '@/ai/flows/generate-product-page-flow.ts';
import '@/ai/flows/generate-page-section-flow.ts';
import '@/ai/flows/generate-product-image-flow.ts';
import '@/ai/flows/generate-automated-plan-flow.ts';
import '@/ai/flows/generate-detail-content-flow.ts';
import '@/ai/flows/milo-chat-flow.ts';
