import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '../../src/components/GlassContainer';
import GlassCard from '../../src/components/GlassCard';
import GlassInput from '../../src/components/GlassInput';
import GlassButton from '../../src/components/GlassButton';
import GlassPicker from '../../src/components/GlassPicker';
import GlassChip from '../../src/components/GlassChip';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useQuotationStore } from '../../src/stores/quotationStore';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

const UNIT_OPTIONS = [
  { label: 'Piece', value: 'Pc' }, { label: 'Kg', value: 'Kg' }, { label: 'Litre', value: 'Ltr' },
  { label: 'Meter', value: 'Mtr' }, { label: 'Feet', value: 'Ft' }, { label: 'Box', value: 'Box' },
  { label: 'Set', value: 'Set' }, { label: 'Bag', value: 'Bag' }, { label: 'Nos', value: 'Nos' },
];

export default function EditQuotationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const {
    currentQuotation: quote, currentItems: items,
    loadQuotation, setCustomerDetails, addItem, duplicateItem, updateItem, removeItem,
    setDiscount, setExtraCharge, setTax, saveCurrentQuotation, clearCurrent,
  } = useQuotationStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadQuotation(id);
    return () => clearCurrent();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await saveCurrentQuotation();
    setSaving(false);
    router.back();
  };

  if (!quote) return null;

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {quote.quote_number || 'Edit Quote'}
          </Text>
          <GlassChip label={quote.sync_status} variant={quote.sync_status === 'synced' ? 'success' : 'warning'} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.sectionCard}>
            <GlassInput label="Customer" value={quote.customer_name} onChangeText={(v) => setCustomerDetails({ customer_name: v })} />
            <GlassInput label="Phone" value={quote.phone} onChangeText={(v) => setCustomerDetails({ phone: v })} keyboardType="phone-pad" />
            <GlassInput label="Address" value={quote.address} onChangeText={(v) => setCustomerDetails({ address: v })} multiline />
          </GlassCard>

          <View style={styles.itemsHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ITEMS</Text>
            <TouchableOpacity onPress={addItem}>
              <Ionicons name="add-circle" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <GlassCard key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemNum, { color: colors.accent }]}>#{item.item_no}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => duplicateItem(index)} style={{ marginRight: spacing.sm }}>
                    <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <GlassInput value={item.item_name} onChangeText={(v) => updateItem(index, 'item_name', v)} placeholder="Item name" />
              <View style={styles.row}>
                <GlassInput label="Qty" value={String(item.quantity || '')} onChangeText={(v) => updateItem(index, 'quantity', parseFloat(v) || 0)} keyboardType="numeric" containerStyle={{ flex: 1, marginRight: spacing.xs }} />
                <GlassPicker options={UNIT_OPTIONS} selected={item.unit} onSelect={(v) => updateItem(index, 'unit', v)} />
                <GlassInput label="Rate" value={String(item.rate || '')} onChangeText={(v) => updateItem(index, 'rate', parseFloat(v) || 0)} keyboardType="decimal-pad" containerStyle={{ flex: 1, marginLeft: spacing.xs }} />
              </View>
              <View style={[styles.itemTotalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.itemTotalLabel, { color: colors.textSecondary }]}>Total:</Text>
                <Text style={[styles.itemTotalValue, { color: colors.text }]}>{quote.currency_symbol}{item.total.toFixed(2)}</Text>
              </View>
            </GlassCard>
          ))}

          <GlassCard>
            <GlassInput label="Discount %" value={String(quote.discount_percent)} onChangeText={(v) => setDiscount('overall', parseFloat(v) || 0)} keyboardType="decimal-pad" />
            <GlassInput label="Extra Charge" value={String(quote.extra_charge)} onChangeText={(v) => setExtraCharge(parseFloat(v) || 0)} keyboardType="decimal-pad" />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{quote.currency_symbol}{quote.subtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.finalRow, { borderTopColor: colors.accent }]}>
              <Text style={[styles.finalLabel, { color: colors.accent }]}>TOTAL</Text>
              <Text style={[styles.finalValue, { color: colors.accent }]}>{quote.currency_symbol}{quote.final_total.toFixed(2)}</Text>
            </View>
          </GlassCard>

          <GlassButton title="Save Changes" onPress={handleSave} loading={saving} size="lg" style={{ marginTop: spacing.xl }} />
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  scrollContent: { padding: spacing.lg },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, letterSpacing: 1 },
  sectionCard: { marginBottom: spacing.md },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.md },
  itemCard: { marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  itemNum: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  itemActions: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center' },
  itemTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, marginTop: spacing.sm, borderTopWidth: 1 },
  itemTotalLabel: { fontSize: fontSize.sm },
  itemTotalValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { fontSize: fontSize.md },
  summaryValue: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  finalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md, marginTop: spacing.sm, borderTopWidth: 2 },
  finalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  finalValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
});
