// Web autofill pipeline service
// Orchestrates: Redis cache → Google Shopping API → ScrapingBee fallback
//
// Full implementation requires Cloud Functions backend (in functions/)
// This client-side module calls the Cloud Function proxy endpoint.

import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from './firebase';
import { AutofillResult } from '../types';

interface AutofillRequest {
  query: string;
}

interface AutofillResponse {
  items: AutofillResult[];
}

// Client-side cache (AsyncStorage-based, for offline fallback)
const CACHE_PREFIX = 'autofill_cache_';

export async function fetchProductData(itemName: string): Promise<AutofillResult | null> {
  try {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<AutofillRequest, AutofillResponse>(functions, 'autofill');
    const result = await callable({ query: itemName });

    if (result.data?.items?.length > 0) {
      return result.data.items[0];
    }
    return null;
  } catch (err) {
    console.warn('Autofill failed:', err);
    return null;
  }
}

export async function fetchProductDataBatch(itemNames: string[]): Promise<(AutofillResult | null)[]> {
  return Promise.all(itemNames.map(fetchProductData));
}
