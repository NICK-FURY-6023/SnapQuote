import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { useQuotationStore } from '../stores/quotationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { generatePdf, sharePdf } from '../services/pdfService';
import { generateExcel, shareExcel } from '../services/excelService';
import { useNavigation } from '@react-navigation/native';

export const PreviewScreen: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const { currentQuotation, currentItems } = useQuotationStore();
    const { settings } = useSettingsStore();
    const [loading, setLoading] = useState<string | null>(null);

    if (!currentQuotation || !settings) return null;

    const q = currentQuotation;
    const currency = settings.currency || '₹';
    const discountedAmount = q.subtotal - q.discount_amount;

    const handleAction = async (action: string) => {
        try {
            setLoading(action);
            if (action === 'downloadPdf') {
                await generatePdf(q, currentItems, settings);
                Alert.alert('✅ Success', 'PDF saved to your device!');
            } else if (action === 'sharePdf') {
                const uri = await generatePdf(q, currentItems, settings);
                await sharePdf(uri);
            } else if (action === 'downloadExcel') {
                await generateExcel(q, currentItems, settings);
                Alert.alert('✅ Success', 'Excel file saved to your device!');
            } else if (action === 'shareExcel') {
                const uri = await generateExcel(q, currentItems, settings);
                await shareExcel(uri);
            }
        } catch (err) {
            Alert.alert('Error', `Failed to ${action}`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Quotation Preview</Text>
                <TouchableOpacity onPress={() => navigation.navigate('QuotationEditor')} style={{ width: 48, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 20 }}>✏️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Invoice Card */}
                <GlassCard style={styles.invoiceCard}>
                    {/* Company Header */}
                    <View style={styles.companyHeader}>
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            style={styles.companyLogo}
                        >
                            <Text style={styles.companyLogoText}>
                                {(settings.company_name || 'SQ').substring(0, 2).toUpperCase()}
                            </Text>
                        </LinearGradient>
                        <View style={styles.companyInfo}>
                            <Text style={[styles.companyName, { color: colors.text }]}>
                                {settings.company_name || 'SnapQuote'}
                            </Text>
                            {settings.company_phone ? (
                                <Text style={[styles.companyDetail, { color: colors.textSecondary }]}>{settings.company_phone}</Text>
                            ) : null}
                            {settings.company_address ? (
                                <Text style={[styles.companyDetail, { color: colors.textSecondary }]}>{settings.company_address}</Text>
                            ) : null}
                        </View>
                    </View>

                    {/* Quote Info */}
                    <View style={[styles.quoteInfoRow, { backgroundColor: colors.accentLight, borderColor: colors.border }]}>
                        <View>
                            <Text style={[styles.quoteInfoLabel, { color: colors.textSecondary }]}>QUOTATION</Text>
                            <Text style={[styles.quoteInfoValue, { color: colors.accent }]}>{q.quote_number}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.quoteInfoLabel, { color: colors.textSecondary }]}>DATE</Text>
                            <Text style={[styles.quoteInfoValue, { color: colors.text }]}>{q.quote_date}</Text>
                        </View>
                    </View>

                    {/* Customer */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BILL TO</Text>
                    <Text style={[styles.customerName, { color: colors.text }]}>{q.customer_name || 'Customer'}</Text>
                    {q.phone ? <Text style={[styles.customerDetail, { color: colors.textSecondary }]}>📱 {q.phone}</Text> : null}
                    {q.address ? <Text style={[styles.customerDetail, { color: colors.textSecondary }]}>📍 {q.address}</Text> : null}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Items Table */}
                    <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.th, { color: colors.textSecondary, width: 30 }]}>#</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 1 }]}>ITEM</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, width: 55, textAlign: 'center' }]}>QTY</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, width: 65, textAlign: 'right' }]}>RATE</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, width: 80, textAlign: 'right' }]}>TOTAL</Text>
                    </View>

                    {currentItems.map((item, i) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                { borderBottomColor: colors.border },
                                i % 2 === 1 && { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' },
                            ]}
                        >
                            <Text style={[styles.td, { color: colors.textSecondary, width: 30 }]}>{i + 1}</Text>
                            <Text style={[styles.td, { color: colors.text, flex: 1 }]}>{item.item_name}</Text>
                            <Text style={[styles.td, { color: colors.text, width: 55, textAlign: 'center' }]}>
                                {item.quantity} {item.unit}
                            </Text>
                            <Text style={[styles.td, { color: colors.text, width: 65, textAlign: 'right' }]}>
                                {currency}{Number(item.rate).toFixed(0)}
                            </Text>
                            <Text style={[styles.td, { color: colors.text, width: 80, textAlign: 'right', fontWeight: '600' }]}>
                                {currency}{Number(item.total).toFixed(0)}
                            </Text>
                        </View>
                    ))}

                    <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 16 }]} />

                    {/* Summary */}
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items Total</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{currency}{q.subtotal.toFixed(2)}</Text>
                        </View>
                        {q.discount_percent > 0 && (
                            <>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discount ({q.discount_percent}%)</Text>
                                    <Text style={[styles.summaryValue, { color: colors.error }]}>-{currency}{q.discount_amount.toFixed(2)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discounted Amount</Text>
                                    <Text style={[styles.summaryValue, { color: colors.text }]}>{currency}{discountedAmount.toFixed(2)}</Text>
                                </View>
                            </>
                        )}
                        {q.extra_charge > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Extra Charge</Text>
                                <Text style={[styles.summaryValue, { color: colors.success }]}>+{currency}{q.extra_charge.toFixed(2)}</Text>
                            </View>
                        )}

                        {/* Final Payable */}
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.finalGradientLine}
                        />
                        <View style={styles.finalRow}>
                            <Text style={[styles.finalLabel, { color: colors.accent }]}>FINAL PAYABLE</Text>
                            <Text style={[styles.finalValue, { color: colors.accent }]}>{currency}{q.final_total.toFixed(2)}</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Export Buttons */}
                <Text style={[styles.exportTitle, { color: colors.text }]}>Export & Share</Text>
                <View style={styles.exportGrid}>
                    <TouchableOpacity
                        style={[styles.exportBtn, { backgroundColor: colors.accent }]}
                        onPress={() => handleAction('downloadPdf')}
                        activeOpacity={0.85}
                        disabled={loading !== null}
                    >
                        <Text style={styles.exportIcon}>📄</Text>
                        <Text style={styles.exportBtnText}>{loading === 'downloadPdf' ? 'Saving...' : 'Download PDF'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.exportBtn, { backgroundColor: colors.success }]}
                        onPress={() => handleAction('downloadExcel')}
                        activeOpacity={0.85}
                        disabled={loading !== null}
                    >
                        <Text style={styles.exportIcon}>📊</Text>
                        <Text style={styles.exportBtnText}>{loading === 'downloadExcel' ? 'Saving...' : 'Download Excel'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.exportBtn, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F0F4FF', borderColor: colors.border, borderWidth: 1 }]}
                        onPress={() => handleAction('sharePdf')}
                        activeOpacity={0.85}
                        disabled={loading !== null}
                    >
                        <Text style={styles.exportIcon}>📤</Text>
                        <Text style={[styles.exportBtnText, { color: colors.text }]}>{loading === 'sharePdf' ? 'Sharing...' : 'Share PDF'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.exportBtn, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F0FFF4', borderColor: colors.border, borderWidth: 1 }]}
                        onPress={() => handleAction('shareExcel')}
                        activeOpacity={0.85}
                        disabled={loading !== null}
                    >
                        <Text style={styles.exportIcon}>📤</Text>
                        <Text style={[styles.exportBtnText, { color: colors.text }]}>{loading === 'shareExcel' ? 'Sharing...' : 'Share Excel'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, height: 100,
        borderBottomWidth: 0.5,
    },
    backBtn: { fontSize: 16, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    invoiceCard: { marginTop: 16 },
    companyHeader: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12,
    },
    companyLogo: {
        width: 48, height: 48, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    companyLogoText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    companyInfo: { flex: 1 },
    companyName: { fontSize: 18, fontWeight: '700' },
    companyDetail: { fontSize: 12, marginTop: 1 },
    quoteInfoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
        marginBottom: 16,
    },
    quoteInfoLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    quoteInfoValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 6,
    },
    customerName: { fontSize: 18, fontWeight: '600' },
    customerDetail: { fontSize: 13, marginTop: 3 },
    divider: { height: 1, marginVertical: 16 },
    tableHeader: {
        flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1,
    },
    th: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: {
        flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 0.5, alignItems: 'center',
    },
    td: { fontSize: 13 },
    summarySection: { marginTop: 8 },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
    },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 15, fontWeight: '600' },
    finalGradientLine: { height: 2, borderRadius: 1, marginTop: 12 },
    finalRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12,
    },
    finalLabel: { fontSize: 18, fontWeight: '800' },
    finalValue: { fontSize: 20, fontWeight: '800' },
    exportTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
    exportGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    exportBtn: {
        width: '48%', flexGrow: 1, height: 52, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    exportIcon: { fontSize: 18 },
    exportBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
