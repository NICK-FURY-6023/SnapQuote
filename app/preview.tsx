import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import GlassContainer from '../src/components/GlassContainer';
import GlassCard from '../src/components/GlassCard';
import GlassButton from '../src/components/GlassButton';
import GlassChip from '../src/components/GlassChip';
import { useTheme } from '../src/theme/ThemeProvider';
import { useQuotationStore } from '../src/stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../src/theme/tokens';

export default function PreviewScreen() {
  const { colors, isDark } = useTheme();
  const { currentQuotation: quote, currentItems: items } = useQuotationStore();
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  if (!quote) {
    return (
      <GlassContainer>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Text style={[{ color: colors.textSecondary, fontSize: fontSize.lg }]}>No quotation to preview</Text>
            <GlassButton title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
          </View>
        </SafeAreaView>
      </GlassContainer>
    );
  }

  const generateHtml = () => {
    const itemsRows = items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.item_name || '-'}</td>
        <td>${item.quantity} ${item.unit}</td>
        <td>${quote.currency_symbol}${item.rate.toFixed(2)}</td>
        <td>${quote.currency_symbol}${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f5f5fa; padding: 20px; color: #1a1a2e; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 16px; color: white; margin-bottom: 20px; }
          .header h1 { font-size: 24px; } .header p { opacity: 0.9; margin-top: 4px; }
          .section { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .section h3 { color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #1a1a2e; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .summary { margin-top: 16px; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .total { border-top: 2px solid #4F46E5; margin-top: 8px; padding-top: 12px; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #4F46E5; }
          .footer { text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>QUOTATION</h1>
          <p>${quote.quote_number || 'Draft'}</p>
        </div>
        <div class="section">
          <h3>Customer Details</h3>
          <div class="info-row"><strong>Name:</strong> ${quote.customer_name || '-'}</div>
          <div class="info-row"><strong>Phone:</strong> ${quote.phone || '-'}</div>
          <div class="info-row"><strong>Address:</strong> ${quote.address || '-'}</div>
          <div class="info-row"><strong>Date:</strong> ${quote.quote_date || '-'}</div>
        </div>
        <div class="section">
          <h3>Items</h3>
          <table>
            <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="summary">
            <div class="summary-row"><span>Subtotal</span><span>${quote.subtotal.toFixed(2)}</span></div>
            ${quote.discount_amount > 0 ? `<div class="summary-row"><span>Discount (${quote.discount_percent}%)</span><span>-${quote.discount_amount.toFixed(2)}</span></div>` : ''}
            ${quote.tax_amount > 0 ? `<div class="summary-row"><span>${quote.tax_type.toUpperCase()} (${quote.tax_percent}%)</span><span>${quote.tax_amount.toFixed(2)}</span></div>` : ''}
            <div class="total"><span>FINAL PAYABLE</span><span>${quote.currency_symbol}${quote.final_total.toFixed(2)}</span></div>
          </div>
        </div>
        <div class="footer">Generated by SnapQuote v2</div>
      </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share Quote - ${quote.quote_number}`,
        });
      } else {
        await Share.share({ url: uri });
      }
    } catch (err) {
      console.warn('PDF export failed:', err);
    }
    setExporting(null);
  };

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Preview</Text>
          <GlassChip label={quote.sync_status} variant={quote.sync_status === 'synced' ? 'success' : 'warning'} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Company Header */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.quoteHeader, { borderRadius: borderRadius.xl }]}
          >
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <Text style={styles.quoteNum}>{quote.quote_number || 'Draft'}</Text>
          </LinearGradient>

          {/* Customer */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CUSTOMER DETAILS</Text>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name:</Text><Text style={[styles.infoValue, { color: colors.text }]}>{quote.customer_name || '-'}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone:</Text><Text style={[styles.infoValue, { color: colors.text }]}>{quote.phone || '-'}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address:</Text><Text style={[styles.infoValue, { color: colors.text }]}>{quote.address || '-'}</Text></View>
            <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date:</Text><Text style={[styles.infoValue, { color: colors.text }]}>{quote.quote_date || '-'}</Text></View>
          </GlassCard>

          {/* Items */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ITEMS</Text>
            {items.map((item, i) => (
              <View key={item.id} style={[styles.previewItem, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.previewItemHeader}>
                  <Text style={[styles.previewItemName, { color: colors.text }]}>{item.item_name || '-'}</Text>
                  <Text style={[styles.previewItemTotal, { color: colors.text }]}>{quote.currency_symbol}{item.total.toFixed(2)}</Text>
                </View>
                <Text style={[styles.previewItemDetail, { color: colors.textSecondary }]}>
                  {item.quantity} {item.unit} × {quote.currency_symbol}{item.rate.toFixed(2)}
                </Text>
              </View>
            ))}
          </GlassCard>

          {/* Summary */}
          <GlassCard style={styles.section}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{quote.currency_symbol}{quote.subtotal.toFixed(2)}</Text>
            </View>
            {quote.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.warning }]}>Discount ({quote.discount_percent}%)</Text>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>-{quote.currency_symbol}{quote.discount_amount.toFixed(2)}</Text>
              </View>
            )}
            {quote.extra_charge > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Extra Charge</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{quote.currency_symbol}{quote.extra_charge.toFixed(2)}</Text>
              </View>
            )}
            {quote.tax_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{quote.tax_type.toUpperCase()} ({quote.tax_percent}%)</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{quote.currency_symbol}{quote.tax_amount.toFixed(2)}</Text>
              </View>
            )}
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: 2, marginVertical: spacing.md, borderRadius: 1 }}
            />
            <View style={styles.finalRow}>
              <Text style={[styles.finalLabel, { color: colors.accent }]}>FINAL PAYABLE</Text>
              <Text style={[styles.finalValue, { color: colors.accent }]}>{quote.currency_symbol}{quote.final_total.toFixed(2)}</Text>
            </View>
          </GlassCard>

          {/* Export buttons */}
          <View style={styles.exportSection}>
            <GlassButton
              title="Download PDF"
              onPress={handleExportPDF}
              loading={exporting === 'pdf'}
              icon={<Ionicons name="document-text" size={18} color="#fff" />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  scrollContent: { padding: spacing.lg },
  quoteHeader: { padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.lg },
  quoteTitle: { color: '#FFFFFF', fontSize: fontSize.xxl, fontWeight: fontWeight.bold, letterSpacing: 2 },
  quoteNum: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: spacing.xs },
  section: { marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 1, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', paddingVertical: 2 },
  infoLabel: { fontSize: fontSize.sm, width: 60 },
  infoValue: { fontSize: fontSize.sm, flex: 1 },
  previewItem: { paddingVertical: spacing.sm },
  previewItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewItemName: { fontSize: fontSize.md, fontWeight: fontWeight.medium, flex: 1 },
  previewItemTotal: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  previewItemDetail: { fontSize: fontSize.sm, marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { fontSize: fontSize.md },
  summaryValue: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  finalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  finalValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  exportSection: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
