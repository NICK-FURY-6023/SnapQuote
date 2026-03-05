import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { useQuotationStore } from '../stores/quotationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { sharePdf, generatePdf } from '../services/pdfService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export const SavedQuotations: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const { quotations, loadQuotations, deleteQuotation, loadQuotation } = useQuotationStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || '₹';
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadQuotations();
        }, [])
    );

    const filteredQuotations = searchQuery.trim()
        ? quotations.filter(q =>
            q.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.quote_number.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : quotations;

    const handleEdit = async (id: string) => {
        await loadQuotation(id);
        navigation.navigate('QuotationEditor', { quotationId: id });
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Quotation', 'Are you sure you want to delete this quotation?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteQuotation(id) },
        ]);
    };

    const handleView = async (id: string) => {
        await loadQuotation(id);
        navigation.navigate('PreviewScreen');
    };

    const handleShare = async (q: any) => {
        if (!settings) return;
        try {
            const items = await (async () => {
                await loadQuotation(q.id);
                return useQuotationStore.getState().currentItems;
            })();
            const uri = await generatePdf(q, items, settings);
            await sharePdf(uri);
        } catch {
            Alert.alert('Error', 'Failed to share quotation.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleView(item.id)}>
            <GlassCard style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={[styles.cardIcon, { backgroundColor: colors.accentLight }]}>
                        <Text style={styles.cardIconText}>📄</Text>
                    </View>
                    <View style={styles.cardLeft}>
                        <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                            {item.customer_name || 'Unnamed'}
                        </Text>
                        <Text style={[styles.quoteNumber, { color: colors.accent }]}>{item.quote_number}</Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>{item.quote_date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                        <Text style={[styles.amount, { color: colors.text }]}>
                            {currency}{Number(item.final_total).toFixed(0)}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.sync_status === 'synced' ? colors.success + '20' : colors.accentLight }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.sync_status === 'synced' ? colors.success : colors.accent }
                            ]}>
                                {item.sync_status === 'synced' ? '✓ Synced' : 'Draft'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.actionButton}>
                        <Text style={[styles.actionText, { color: colors.accent }]}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleView(item.id)} style={styles.actionButton}>
                        <Text style={[styles.actionText, { color: colors.success }]}>👁 View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionButton}>
                        <Text style={[styles.actionText, { color: colors.warning }]}>📤 Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                        <Text style={[styles.actionText, { color: colors.error }]}>🗑 Delete</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Saved Quotations</Text>
                <Text style={[styles.count, { color: colors.textSecondary }]}>
                    {quotations.length} {quotations.length === 1 ? 'quote' : 'quotes'}
                </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name or quote number..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { color: colors.text }]}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={[styles.clearBtn, { color: colors.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {filteredQuotations.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>{searchQuery ? '🔍' : '📋'}</Text>
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        {searchQuery ? 'No results found' : 'No quotations yet'}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        {searchQuery ? 'Try a different search term' : 'Create your first quotation to get started'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredQuotations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    title: { fontSize: 22, fontWeight: '700' },
    count: { fontSize: 13, fontWeight: '500' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginVertical: 12,
        height: 44, borderRadius: 14, borderWidth: 1,
        paddingHorizontal: 14, gap: 8,
    },
    searchIcon: { fontSize: 16 },
    searchInput: { flex: 1, fontSize: 15 },
    clearBtn: { fontSize: 16, fontWeight: '600', padding: 4 },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: { marginBottom: 12 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    cardIconText: { fontSize: 22 },
    cardLeft: { flex: 1 },
    customerName: { fontSize: 16, fontWeight: '600' },
    quoteNumber: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    date: { fontSize: 12, marginTop: 2 },
    cardRight: { alignItems: 'flex-end' },
    amount: { fontSize: 20, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardActions: {
        flexDirection: 'row', gap: 12, marginTop: 12, paddingTop: 12,
        borderTopWidth: 0.5,
    },
    actionButton: { paddingVertical: 4 },
    actionText: { fontSize: 13, fontWeight: '600' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
