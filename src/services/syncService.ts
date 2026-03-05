import { supabase } from './supabaseClient';
import * as db from '../database/sqlite';
import { Quotation, QuotationItem } from '../types';
import NetInfo from '@react-native-community/netinfo';

export async function syncToSupabase(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
        // Check connectivity
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            return { synced: 0, errors: 0 };
        }

        // Get unsynced quotations
        const unsyncedQuotations = await db.getUnsyncedQuotations();

        for (const q of unsyncedQuotations) {
            try {
                // Upsert quotation to Supabase
                const { error: qError } = await supabase
                    .from('quotations')
                    .upsert({
                        id: q.id,
                        user_id: q.user_id,
                        customer_name: q.customer_name,
                        phone: q.phone,
                        address: q.address,
                        quote_date: q.quote_date,
                        subtotal: q.subtotal,
                        discount_percent: q.discount_percent,
                        discount_amount: q.discount_amount,
                        extra_charge: q.extra_charge,
                        final_total: q.final_total,
                        quote_number: q.quote_number,
                        sync_status: 'synced',
                        created_at: q.created_at,
                        updated_at: q.updated_at,
                    }, { onConflict: 'id' });

                if (qError) {
                    console.error('Sync quotation error:', qError);
                    errors++;
                    continue;
                }

                // Get and sync items
                const items = await db.getQuotationItems(q.id);
                if (items.length > 0) {
                    // Delete existing items in Supabase for this quotation
                    await supabase.from('quotation_items').delete().eq('quotation_id', q.id);

                    // Insert all items
                    const { error: iError } = await supabase
                        .from('quotation_items')
                        .insert(items.map(item => ({
                            id: item.id,
                            quotation_id: item.quotation_id,
                            item_no: item.item_no,
                            item_name: item.item_name,
                            quantity: item.quantity,
                            unit: item.unit,
                            rate: item.rate,
                            total: item.total,
                            created_at: item.created_at,
                        })));

                    if (iError) {
                        console.error('Sync items error:', iError);
                        errors++;
                        continue;
                    }
                }

                // Mark as synced locally
                await db.markQuotationSynced(q.id);
                synced++;
            } catch (err) {
                console.error('Sync error for quotation:', q.id, err);
                errors++;
            }
        }
    } catch (err) {
        console.error('Sync failed:', err);
    }

    return { synced, errors };
}
