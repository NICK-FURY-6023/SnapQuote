import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, writeBatch,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import * as db from '../database/sqlite';
import { Quotation, QuotationItem, SyncResult } from '../types';

const QUOTATIONS_COLLECTION = 'quotations';
const ITEMS_COLLECTION = 'quotation_items';

export async function syncQuotations(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, errors: 0, failedIds: [] };
  const firestore = getFirestoreDb();

  try {
    // Get all locally unsynced quotations
    const allQuotes = await db.getAllQuotations();
    const pending = allQuotes.filter((q) => q.sync_status !== 'synced');

    for (const quote of pending) {
      try {
        const items = await db.getQuotationItems(quote.id);

        // Write quotation to Firestore
        const quoteRef = doc(firestore, QUOTATIONS_COLLECTION, quote.id);
        await setDoc(quoteRef, {
          ...quote,
          items: [], // Don't embed items — they're in subcollection
          updated_at: new Date().toISOString(),
        });

        // Write items as subcollection
        const batch = writeBatch(firestore);
        for (const item of items) {
          const itemRef = doc(firestore, QUOTATIONS_COLLECTION, quote.id, ITEMS_COLLECTION, item.id);
          batch.set(itemRef, item);
        }
        await batch.commit();

        // Mark as synced locally
        await db.saveQuotation({ ...quote, sync_status: 'synced' });
        result.synced++;

        // Trigger Discord webhook via Cloud Function
        // The Cloud Function listens on Firestore quotations collection onCreate/onUpdate
        // and sends the Discord notification server-side.
      } catch (err) {
        result.errors++;
        result.failedIds.push(quote.id);
      }
    }
  } catch (err) {
    console.warn('Sync operation failed:', err);
  }

  return result;
}

export async function pullFromCloud(): Promise<number> {
  const firestore = getFirestoreDb();
  let pulled = 0;

  try {
    const quotesRef = collection(firestore, QUOTATIONS_COLLECTION);
    const snapshot = await getDocs(quotesRef);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as Quotation;

      // Check if local version is newer
      const local = await db.getQuotationById(data.id);
      if (local && local.updated_at >= data.updated_at) continue;

      // Pull items subcollection
      const itemsRef = collection(firestore, QUOTATIONS_COLLECTION, data.id, ITEMS_COLLECTION);
      const itemsSnap = await getDocs(itemsRef);
      const items: QuotationItem[] = itemsSnap.docs.map((d) => d.data() as QuotationItem);

      // Save locally
      await db.saveQuotation({ ...data, sync_status: 'synced' });
      await db.deleteQuotationItems(data.id);
      if (items.length > 0) {
        await db.saveQuotationItems(items);
      }
      pulled++;
    }
  } catch (err) {
    console.warn('Pull from cloud failed:', err);
  }

  return pulled;
}
