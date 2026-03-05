import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { useQuotationStore } from '../stores/quotationStore';
import { useNavigation } from '@react-navigation/native';

export const CustomerDetails: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const { currentQuotation, setCustomerDetails, saveCurrentQuotation } = useQuotationStore();

    if (!currentQuotation) return null;

    // Auto-set today's date if empty
    React.useEffect(() => {
        if (!currentQuotation.quote_date) {
            setCustomerDetails({ quote_date: new Date().toISOString().split('T')[0] });
        }
    }, []);

    const handleSave = async () => {
        await saveCurrentQuotation();
        navigation.navigate('PreviewScreen');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Details</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Step indicator */}
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: colors.success }]}>
                        <Text style={styles.stepCheck}>✓</Text>
                    </View>
                    <View style={[styles.stepLine, { backgroundColor: colors.success }]} />
                    <View style={[styles.stepDot, { backgroundColor: colors.accent }]}>
                        <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
                    <View style={[styles.stepDot, { backgroundColor: colors.border }]}>
                        <Text style={[styles.stepNumber, { color: colors.textSecondary }]}>3</Text>
                    </View>
                </View>
                <View style={styles.stepLabels}>
                    <Text style={[styles.stepLabel, { color: colors.success }]}>Items</Text>
                    <Text style={[styles.stepLabel, { color: colors.accent }]}>Customer</Text>
                    <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>Preview</Text>
                </View>

                {/* Customer Info Card */}
                <GlassCard style={styles.formCard}>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldIcon}>👤</Text>
                        <View style={styles.fieldInput}>
                            <GlassInput
                                label="Customer Name"
                                value={currentQuotation.customer_name}
                                onChangeText={(v) => setCustomerDetails({ customer_name: v })}
                                placeholder="Enter customer name"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldIcon}>📱</Text>
                        <View style={styles.fieldInput}>
                            <GlassInput
                                label="Phone Number"
                                value={currentQuotation.phone}
                                onChangeText={(v) => setCustomerDetails({ phone: v })}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldIcon}>📍</Text>
                        <View style={styles.fieldInput}>
                            <GlassInput
                                label="Address"
                                value={currentQuotation.address}
                                onChangeText={(v) => setCustomerDetails({ address: v })}
                                placeholder="Enter address"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldIcon}>📅</Text>
                        <View style={styles.fieldInput}>
                            <GlassInput
                                label="Date"
                                value={currentQuotation.quote_date}
                                onChangeText={(v) => setCustomerDetails({ quote_date: v })}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </View>
                </GlassCard>

                {/* Quote Summary */}
                <GlassCard style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={[styles.summaryTitle, { color: colors.text }]}>Quote Summary</Text>
                        <Text style={[styles.summaryQuoteNum, { color: colors.accent }]}>{currentQuotation.quote_number}</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items Total</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>₹{currentQuotation.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.accent, fontWeight: '700' }]}>FINAL PAYABLE</Text>
                        <Text style={[styles.summaryValue, { color: colors.accent, fontWeight: '800', fontSize: 18 }]}>
                            ₹{currentQuotation.final_total.toFixed(2)}
                        </Text>
                    </View>
                </GlassCard>

                {/* Action Button */}
                <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.continueWrapper}>
                    <LinearGradient
                        colors={[colors.gradientStart, colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueBtn}
                    >
                        <Text style={styles.continueText}>Save & Preview →</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    stepRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 24, marginBottom: 8,
    },
    stepDot: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    stepCheck: { color: '#fff', fontSize: 16, fontWeight: '700' },
    stepNumber: { color: '#fff', fontSize: 14, fontWeight: '700' },
    stepLine: { width: 48, height: 2 },
    stepLabels: {
        flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 20,
    },
    stepLabel: { fontSize: 12, fontWeight: '600' },
    formCard: { marginBottom: 16 },
    fieldRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    },
    fieldIcon: { fontSize: 22, marginTop: 28 },
    fieldInput: { flex: 1 },
    summaryCard: { marginBottom: 16 },
    summaryHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    summaryTitle: { fontSize: 16, fontWeight: '700' },
    summaryQuoteNum: { fontSize: 13, fontWeight: '600' },
    summaryDivider: { height: 1, marginVertical: 12 },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
    },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 15, fontWeight: '600' },
    continueWrapper: { borderRadius: 26, overflow: 'hidden', marginTop: 8 },
    continueBtn: {
        height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    },
    continueText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
