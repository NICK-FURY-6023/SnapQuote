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
import { useTheme } from '../../src/theme/ThemeProvider';
import { useQuotationStore } from '../../src/stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../../src/theme/tokens';
import { UnitType } from '../../src/types';

const UNIT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Piece', value: 'Pc' },
  { label: 'Kilogram', value: 'Kg' },
  { label: 'Litre', value: 'Ltr' },
  { label: 'Meter', value: 'Mtr' },
  { label: 'Feet', value: 'Ft' },
  { label: 'Box', value: 'Box' },
  { label: 'Set', value: 'Set' },
  { label: 'Bag', value: 'Bag' },
  { label: 'Nos', value: 'Nos' },
];

const TAX_OPTIONS = [
  { label: 'No Tax', value: 'none' },
  { label: 'GST', value: 'gst' },
  { label: 'VAT', value: 'vat' },
];

export default function NewQuotationScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ templateId?: string }>();
  const {
    currentQuotation: quote, currentItems: items,
    createNewQuotation, setCustomerDetails,
    addItem, duplicateItem, updateItem, removeItem,
    setDiscount, setExtraCharge, setTax,
    saveCurrentQuotation, clearCurrent, autoSaveDraft,
  } = useQuotationStore();

  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [discount, setDiscountStr] = useState('0');
  const [extraCharge, setExtraChargeStr] = useState('0');
  const [taxPercent, setTaxPercent] = useState('0');

  useEffect(() => {
    createNewQuotation(params.templateId);
    return () => { clearCurrent(); };
  }, []);

  useEffect(() => {
    if (quote) {
      setCustomerName(quote.customer_name || '');
      setPhone(quote.phone || '');
      setAddress(quote.address || '');
      setDiscountStr(String(quote.discount_percent || 0));
      setExtraChargeStr(String(quote.extra_charge || 0));
      setTaxPercent(String(quote.tax_percent || 0));
    }
  }, [quote?.id]);

  // Auto-save every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (quote && items.some((i) => i.item_name)) {
        autoSaveDraft();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [quote, items]);

  const handleCustomerChange = () => {
    setCustomerDetails({
      customer_name: customerName,
      phone,
      address,
    });
  };

  const handleSave = async () => {
    handleCustomerChange();
    setSaving(true);
    await saveCurrentQuotation();
    setSaving(false);
    router.push('/preview');
  };

  const handleSaveAndExit = async () => {
    handleCustomerChange();
    setSaving(true);
    await saveCurrentQuotation();
    setSaving(false);
    router.back();
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    updateItem(index, field as any, value);
  };

  const handleDiscountChange = (val: string) => {
    setDiscountStr(val);
    const pct = parseFloat(val) || 0;
    setDiscount(quote?.discount_type || 'overall', pct);
  };

  const handleExtraChargeChange = (val: string) => {
    setExtraChargeStr(val);
    setExtraCharge(parseFloat(val) || 0);
  };

  const handleTaxChange = (type: string, pct: string) => {
    setTaxPercent(pct);
    setTax(type as 'gst' | 'vat' | 'none', parseFloat(pct) || 0);
  };

  if (!quote) return null;

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Quotation</Text>
          <TouchableOpacity onPress={handleSaveAndExit}>
            <Ionicons name="checkmark-circle" size={28} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Customer Details */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CUSTOMER</Text>
          <GlassCard style={styles.sectionCard}>
            <GlassInput
              label="Customer Name"
              value={customerName}
              onChangeText={(v) => { setCustomerName(v); handleCustomerChange(); }}
              placeholder="Enter customer name"
            />
            <GlassInput
              label="Phone"
              value={phone}
              onChangeText={(v) => { setPhone(v); handleCustomerChange(); }}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />
            <GlassInput
              label="Address"
              value={address}
              onChangeText={(v) => { setAddress(v); handleCustomerChange(); }}
              placeholder="Delivery address"
              multiline
            />
          </GlassCard>

          {/* Items */}
          <View style={styles.itemsHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ITEMS</Text>
            <TouchableOpacity onPress={addItem}>
              <Ionicons name="add-circle" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <GlassCard key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemNumber, { color: colors.accent }]}>#{item.item_no}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => duplicateItem(index)} style={{ marginRight: spacing.sm }}>
                    <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <GlassInput
                label="Item Name"
                value={item.item_name}
                onChangeText={(v) => handleItemFieldChange(index, 'item_name', v)}
                placeholder="Product or service name"
              />

              <View style={styles.itemFieldsRow}>
                <View style={{ flex: 2, marginRight: spacing.sm }}>
                  <GlassInput
                    label="Qty"
                    value={String(item.quantity || '')}
                    onChangeText={(v) => handleItemFieldChange(index, 'quantity', parseFloat(v) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={{ flex: 2, marginRight: spacing.sm }}>
                  <GlassPicker
                    options={UNIT_OPTIONS}
                    selected={item.unit}
                    onSelect={(v) => handleItemFieldChange(index, 'unit', v)}
                    label="Unit"
                  />
                </View>
                <View style={{ flex: 3 }}>
                  <GlassInput
                    label="Rate"
                    value={String(item.rate || '')}
                    onChangeText={(v) => handleItemFieldChange(index, 'rate', parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Per-item discount */}
              <View style={styles.itemFieldsRow}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <GlassPicker
                    options={[
                      { label: 'No Disc.', value: 'none' },
                      { label: '% Off', value: 'percent' },
                      { label: '₹ Off', value: 'fixed' },
                    ]}
                    selected={item.discount_type}
                    onSelect={(v) => handleItemFieldChange(index, 'discount_type', v)}
                    label="Discount"
                  />
                </View>
                {item.discount_type !== 'none' && (
                  <View style={{ flex: 1 }}>
                    <GlassInput
                      label="Value"
                      value={String(item.discount_value || '')}
                      onChangeText={(v) => handleItemFieldChange(index, 'discount_value', parseFloat(v) || 0)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                  </View>
                )}
              </View>

              <View style={[styles.itemTotal, { borderTopColor: colors.border }]}>
                <Text style={[styles.itemTotalLabel, { color: colors.textSecondary }]}>
                  Total: {quote.currency_symbol}
                </Text>
                <Text style={[styles.itemTotalValue, { color: colors.text }]}>
                  {item.total.toFixed(2)}
                </Text>
              </View>
            </GlassCard>
          ))}

          {/* Summary */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SUMMARY</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {quote.currency_symbol}{quote.subtotal.toFixed(2)}
              </Text>
            </View>

            <GlassInput
              label="Overall Discount (%)"
              value={discount}
              onChangeText={handleDiscountChange}
              keyboardType="decimal-pad"
              placeholder="0"
            />

            <GlassInput
              label="Extra Charge (₹)"
              value={extraCharge}
              onChangeText={handleExtraChargeChange}
              keyboardType="decimal-pad"
              placeholder="0"
            />

            <View style={styles.taxRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <GlassPicker
                  options={TAX_OPTIONS}
                  selected={quote.tax_type}
                  onSelect={(v) => handleTaxChange(v, taxPercent)}
                  label="Tax Type"
                />
              </View>
              {quote.tax_type !== 'none' && (
                <View style={{ flex: 1 }}>
                  <GlassInput
                    label="Tax %"
                    value={taxPercent}
                    onChangeText={(v) => handleTaxChange(quote.tax_type, v)}
                    keyboardType="decimal-pad"
                    placeholder="18"
                  />
                </View>
              )}
            </View>

            {quote.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.warning }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  -{quote.currency_symbol}{quote.discount_amount.toFixed(2)}
                </Text>
              </View>
            )}

            {quote.tax_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {quote.tax_type.toUpperCase()} ({quote.tax_percent}%)
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {quote.currency_symbol}{quote.tax_amount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.totalRow, { borderTopColor: colors.accent }]}>
              <Text style={[styles.totalLabel, { color: colors.accent }]}>FINAL TOTAL</Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>
                {quote.currency_symbol}{quote.final_total.toFixed(2)}
              </Text>
            </View>
          </GlassCard>

          {/* Action buttons */}
          <View style={styles.actions}>
            <GlassButton
              title="Save & Preview"
              onPress={handleSave}
              loading={saving}
              size="lg"
              style={{ flex: 1 }}
            />
            <View style={{ width: spacing.md }} />
            <GlassButton
              title="Save Only"
              onPress={handleSaveAndExit}
              variant="secondary"
              size="lg"
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.sm,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemFieldsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  itemTotalLabel: {
    fontSize: fontSize.sm,
  },
  itemTotalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.md,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  taxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});
