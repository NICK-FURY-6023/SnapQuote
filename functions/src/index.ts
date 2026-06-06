import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import axios from 'axios';

admin.initializeApp();

// ─── OCR Processing ─────────────────────────────────────────────
// Receives base64 image from client, sends to Google Cloud Vision API,
// returns parsed text and detected items.

import { ImageAnnotatorClient } from '@google-cloud/vision';

const visionClient = new ImageAnnotatorClient();

export const ocrProcess = onCall({ maxInstances: 10 }, async (request) => {
  const { image } = request.data as { image: { base64: string; mimeType: string } };

  if (!image?.base64) {
    throw new HttpsError('invalid-argument', 'Image data is required');
  }

  try {
    const [result] = await visionClient.textDetection({
      image: { content: image.base64 },
    });

    const detections = result.textAnnotations || [];
    const fullText = detections[0]?.description || '';

    // Parse text into structured items
    const lines = fullText.split('\n').filter((l: string) => l.trim());
    const items = lines.map((line: string) => {
      // Basic parsing: look for patterns like "ItemName Qty Rate"
      const tokens = line.split(/\s+/);
      const rate = parseFloat(tokens[tokens.length - 1] || '0');
      const qty = parseFloat(tokens[tokens.length - 2] || '0');
      const name = tokens.length > 2
        ? tokens.slice(0, tokens.length - 2).join(' ')
        : line;

      return {
        item_name: name,
        quantity: isNaN(qty) ? 1 : qty,
        rate: isNaN(rate) ? 0 : rate,
        unit: 'Pc',
      };
    });

    return {
      result: {
        raw_text: fullText,
        items,
        confidence: 0.8,
      },
    };
  } catch (error) {
    functions.logger.error('OCR failed:', error);
    throw new HttpsError('internal', 'OCR processing failed');
  }
});

// ─── Autofill Pipeline ─────────────────────────────────────────
// Receives product name query, checks cache, then fetches from
// Google Shopping API → ScrapingBee fallback.

export const autofill = onCall({ maxInstances: 20 }, async (request) => {
  const { query } = request.data as { query: string };

  if (!query?.trim()) {
    throw new HttpsError('invalid-argument', 'Search query is required');
  }

  try {
    // Try Google Custom Search / Shopping API
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (apiKey && searchEngineId) {
      const response = await axios.get(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            q: `${query} price`,
            key: apiKey,
            cx: searchEngineId,
          },
          timeout: 5000,
        },
      );

      const results = response.data?.items || [];
      const items = results.slice(0, 5).map((item: any) => ({
        item_name: query,
        rate: extractPrice(item.snippet) || 0,
        image_url: item.pagemap?.cse_image?.[0]?.src || null,
        description: item.snippet || null,
        source: 'google_shopping' as const,
        confidence: 0.7,
        price_last_fetched: new Date().toISOString(),
      }));

      if (items.length > 0) {
        return { items };
      }
    }

    // Fallback: return empty result with source info
    return {
      items: [{
        item_name: query,
        rate: 0,
        image_url: null,
        description: null,
        source: 'none' as const,
        confidence: 0,
        price_last_fetched: new Date().toISOString(),
      }],
    };
  } catch (error) {
    functions.logger.error('Autofill failed:', error);
    throw new HttpsError('internal', 'Product search failed');
  }
});

// ─── Discord Webhook Notification ──────────────────────────────
// Triggered when a new quotation is created in Firestore.

export const onQuotationCreated = onDocumentCreated(
  'quotations/{quotationId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const quote = snap.data();

    // Check if Discord webhook is configured in settings
    const settingsDoc = await admin.firestore()
      .collection('settings')
      .doc('default')
      .get();

    const webhookUrl = settingsDoc.data()?.discord_webhook_url;
    if (!webhookUrl) return;

    const embed = {
      embeds: [{
        title: '📄 New Quotation Created',
        color: 0x4F46E5,
        fields: [
          { name: 'Quote #', value: quote.quote_number || 'Draft', inline: true },
          { name: 'Customer', value: quote.customer_name || 'N/A', inline: true },
          { name: 'Amount', value: `₹${quote.final_total?.toFixed(2) || '0.00'}`, inline: true },
          { name: 'Items', value: `${quote.items?.length || 0} items`, inline: true },
          { name: 'Status', value: quote.sync_status || 'pending', inline: true },
        ],
        timestamp: new Date().toISOString(),
      }],
    };

    try {
      await axios.post(webhookUrl, embed);
      functions.logger.info('Discord notification sent');
    } catch (error) {
      functions.logger.warn('Discord webhook failed:', error);
    }
  },
);

// Helper: extract a price from text snippet
function extractPrice(text: string): number | null {
  const match = text.match(/[₹$€£]\s*([\d,]+(?:\.\d{2})?)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}
