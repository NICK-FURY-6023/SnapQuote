import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { useQuotationStore } from '../stores/quotationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useNavigation, useRoute } from '@react-navigation/native';

const UNITS = ['Pc', 'Kg', 'Ltr', 'Mtr', 'Ft', 'Box', 'Set', 'Bag', 'Nos'];
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export const QuotationEditor: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { settings } = useSettingsStore();
    const {
        currentQuotation, currentItems, createNewQuotation,
        updateItem, addItem, removeItem, setDiscount, setExtraCharge,
        recalculate, saveCurrentQuotation, loadQuotation,
    } = useQuotationStore();

    const [discountInput, setDiscountInput] = useState('');
    const [extraChargeInput, setExtraChargeInput] = useState('');

    useEffect(() => {
        if (route.params?.isNew) {
            createNewQuotation();
        } else if (route.params?.quotationId) {
            loadQuotation(route.params.quotationId);
        }
    }, []);

    useEffect(() => {
        if (currentQuotation) {
            setDiscountInput(String(currentQuotation.discount_percent || ''));
            setExtraChargeInput(String(currentQuotation.extra_charge || ''));
        }
    }, [currentQuotation?.id]);

    // Periodic auto-save every 10 seconds
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [autoSaved, setAutoSaved] = useState(false);

    useEffect(() => {
        autoSaveTimerRef.current = setInterval(async () => {
            const q = useQuotationStore.getState().currentQuotation;
            if (q) {
                await useQuotationStore.getState().autoSaveDraft();
                setAutoSaved(true);
                setTimeout(() => setAutoSaved(false), 2000);
            }
        }, AUTO_SAVE_INTERVAL);

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, []);

    // Auto-save on back navigation
    const handleBack = async () => {
        await useQuotationStore.getState().autoSaveDraft();
        navigation.goBack();
    };

    const handleSave = async () => {
        if (currentItems.length === 0 || !currentItems.some(i => i.item_name.trim())) {
            Alert.alert('Error', 'Please add at least one item.');
            return;
        }
        await saveCurrentQuotation();
        navigation.navigate('CustomerDetails');
    };

    const handlePreview = async () => {
        await saveCurrentQuotation();
        navigation.navigate('PreviewScreen');
    };

    if (!currentQuotation) return null;

    const currency = settings?.currency || '₹';
    const discountedAmount = currentQuotation.subtotal - currentQuotation.discount_amount;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                    <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Quotation</Text>
                    {autoSaved && <Text style={{ fontSize: 10, color: colors.success, marginTop: 2 }}>Auto-saved ✓</Text>}
                </View>
                <TouchableOpacity onPress={handlePreview} style={styles.headerBtn}>
                    <Text style={[styles.doneBtn, { color: colors.accent }]}>Preview</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Quote Number Badge */}
                <View style={[styles.quoteBadge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.quoteBadgeText, { color: colors.accent }]}>
                        {currentQuotation.quote_number}
                    </Text>
                </View>

                {/* Table */}
                <GlassCard style={styles.tableCard}>
                    {/* Table Header */}
                    <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 0.25 }]}>#</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 1.3 }]}>ITEM</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 0.5 }]}>QTY</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 0.4 }]}>UNIT</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 0.6 }]}>RATE</Text>
                        <Text style={[styles.th, { color: colors.textSecondary, flex: 0.7, textAlign: 'right' }]}>TOTAL</Text>
                    </View>

                    {/* Table Rows */}
                    {currentItems.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                { borderBottomColor: colors.border },
                                index % 2 === 1 && { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' },
                            ]}
                        >
                            <Text style={[styles.td, { color: colors.textSecondary, flex: 0.25 }]}>{index + 1}</Text>
                            <TextInput
                                value={item.item_name}
                                onChangeText={(v) => updateItem(index, 'item_name', v)}
                                placeholder="Item name"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.cellInput, { color: colors.text, flex: 1.3, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                            />
                            <TextInput
                                value={item.quantity ? String(item.quantity) : ''}
                                onChangeText={(v) => updateItem(index, 'quantity', Number(v) || 0)}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={[styles.cellInput, { color: colors.text, flex: 0.5, borderColor: colors.border, backgroundColor: colors.inputBg, textAlign: 'center' }]}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    const currentIdx = UNITS.indexOf(item.unit || 'Pc');
                                    const nextIdx = (currentIdx + 1) % UNITS.length;
                                    updateItem(index, 'unit', UNITS[nextIdx]);
                                }}
                                style={[styles.unitBtn, { backgroundColor: colors.accentLight, borderColor: colors.border }]}
                            >
                                <Text style={[styles.unitText, { color: colors.accent }]}>{item.unit || 'Pc'}</Text>
                            </TouchableOpacity>
                            <TextInput
                                value={item.rate ? String(item.rate) : ''}
                                onChangeText={(v) => updateItem(index, 'rate', Number(v) || 0)}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={[styles.cellInput, { color: colors.text, flex: 0.6, borderColor: colors.border, backgroundColor: colors.inputBg, textAlign: 'right' }]}
                            />
                            <View style={{ flex: 0.7, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={[styles.totalCell, { color: colors.text }]}>
                                    {currency}{(item.total || 0).toFixed(0)}
                                </Text>
                                {currentItems.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteBtn}>
                                        <Text style={[styles.deleteBtnText, { color: colors.error }]}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}

                    {/* Add Row Button */}
                    <TouchableOpacity
                        onPress={addItem}
                        style={[styles.addRowBtn, { borderColor: colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.addRowIcon, { color: colors.accent }]}>＋</Text>
                        <Text style={[styles.addRowText, { color: colors.accent }]}>Add Row</Text>
                    </TouchableOpacity>
                </GlassCard>

                {/* Summary */}
                <GlassCard style={styles.summaryCard}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items Total</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{currency}{currentQuotation.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.discountRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discount</Text>
                            <TextInput
                                value={discountInput}
                                onChangeText={(v) => {
                                    setDiscountInput(v);
                                    setDiscount(Number(v) || 0);
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.miniInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                            />
                            <Text style={[styles.percentSign, { color: colors.textSecondary }]}>%</Text>
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.error }]}>-{currency}{currentQuotation.discount_amount.toFixed(2)}</Text>
                    </View>

                    {currentQuotation.discount_percent > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Discounted Amount</Text>
                            <Text style={[styles.summaryValue, { color: colors.text }]}>{currency}{discountedAmount.toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <View style={styles.discountRow}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Extra Charge</Text>
                            <TextInput
                                value={extraChargeInput}
                                onChangeText={(v) => {
                                    setExtraChargeInput(v);
                                    setExtraCharge(Number(v) || 0);
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.miniInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                            />
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.success }]}>+{currency}{(currentQuotation.extra_charge || 0).toFixed(2)}</Text>
                    </View>

                    {/* Final Payable with Gradient Line */}
                    <LinearGradient
                        colors={[colors.gradientStart, colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLine}
                    />
                    <View style={[styles.summaryRow, styles.finalRow]}>
                        <Text style={[styles.finalLabel, { color: colors.accent }]}>FINAL PAYABLE</Text>
                        <Text style={[styles.finalValue, { color: colors.accent }]}>{currency}{currentQuotation.final_total.toFixed(2)}</Text>
                    </View>
                </GlassCard>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <GlassButton title="Next → Customer Details" onPress={handleSave} variant="primary" style={styles.actionBtn} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, height: 100,
        borderBottomWidth: 0.5,
    },
    headerBtn: { width: 60 },
    backBtn: { fontSize: 16, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    doneBtn: { fontSize: 16, fontWeight: '600', textAlign: 'right' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    quoteBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 16,
        marginBottom: 12,
    },
    quoteBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    tableCard: { padding: 0, overflow: 'hidden' },
    tableHeader: {
        flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12,
        borderBottomWidth: 1,
    },
    th: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 8,
        borderBottomWidth: 0.5, minHeight: 48,
    },
    td: { fontSize: 14, fontWeight: '500' },
    cellInput: {
        fontSize: 13, paddingHorizontal: 6, paddingVertical: 4,
        borderWidth: 1, borderRadius: 8, marginHorizontal: 2, height: 34,
    },
    unitBtn: {
        flex: 0.4, height: 34, borderRadius: 8, borderWidth: 1,
        justifyContent: 'center', alignItems: 'center', marginHorizontal: 2,
    },
    unitText: { fontSize: 11, fontWeight: '600' },
    totalCell: { fontSize: 13, fontWeight: '600' },
    deleteBtn: { marginTop: 2 },
    deleteBtnText: { fontSize: 12, fontWeight: '700' },
    addRowBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderTopWidth: 1, gap: 6,
    },
    addRowIcon: { fontSize: 18, fontWeight: '600' },
    addRowText: { fontSize: 14, fontWeight: '600' },
    summaryCard: { marginTop: 16 },
    summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 15, fontWeight: '600' },
    discountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    percentSign: { fontSize: 14, fontWeight: '500' },
    miniInput: {
        width: 56, height: 32, borderRadius: 8, borderWidth: 1,
        paddingHorizontal: 8, fontSize: 14, textAlign: 'center',
    },
    gradientLine: {
        height: 2,
        borderRadius: 1,
        marginTop: 12,
    },
    finalRow: {
        paddingTop: 12,
    },
    finalLabel: { fontSize: 18, fontWeight: '800' },
    finalValue: { fontSize: 20, fontWeight: '800' },
    actions: {
        marginTop: 16,
    },
    actionBtn: { flex: 1 },
});
