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

    formCard: { marginBottom: 16 },
    fieldRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    },
    fieldIcon: { fontSize: 22, marginTop: 28 },
    fieldInput: { flex: 1 },

    continueWrapper: { borderRadius: 26, overflow: 'hidden', marginTop: 8 },
    continueBtn: {
        height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    },
    continueText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
