// Google Cloud Vision OCR service
// Called from ScanScreen after photo capture
// Sends image to Cloud Function → Vision API → returns parsed text

import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from './firebase';
import { OCRResult } from '../types';

interface OCRRequest {
  image: {
    base64: string;
    mimeType: string;
  };
}

export async function processImage(base64Image: string, mimeType: string = 'image/jpeg'): Promise<OCRResult | null> {
  try {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<OCRRequest, { result: OCRResult }>(functions, 'ocr-process');
    const response = await callable({
      image: {
        base64: base64Image,
        mimeType,
      },
    });

    return response.data?.result ?? null;
  } catch (err) {
    console.warn('OCR processing failed:', err);
    return null;
  }
}
