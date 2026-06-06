import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassContainer from '../../src/components/GlassContainer';
import GlassCard from '../../src/components/GlassCard';
import GlassInput from '../../src/components/GlassInput';
import GlassChip from '../../src/components/GlassChip';
import GlassButton from '../../src/components/GlassButton';
import { ListSkeleton } from '../../src/components/GlassSkeleton';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useQuotationStore } from '../../src/stores/quotationStore';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';

export default function SavedQuotations() {
  const { colors } = useTheme();
  const { quotations, loading, loadQuotations, deleteQuotation, searchQuotations } = useQuotationStore();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim()) {
      searchQuotations(text);
    } else {
      loadQuotations();
    }
  };

  const handleDelete = (id: string, quoteNumber: string) => {
    Alert.alert(
      'Delete Quote',
      `Delete ${quoteNumber || 'this quote'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteQuotation(id),
        },
      ],
    );
  };

  const renderItem = ({ item }: any) => (
    <GlassCard
      onPress={() => router.push(`/quotation/${item.id}`)}
      style={styles.quoteCard}
    >
      <View style={styles.quoteHeader}>
        <Text style={[styles.quoteNumber, { color: colors.accent }]}>
          {item.quote_number || 'Draft'}
        </Text>
        <View style={styles.quoteActions}>
          <GlassChip
            label={item.sync_status === 'synced' ? 'Synced' : 'Draft'}
            variant={item.sync_status === 'synced' ? 'success' : 'warning'}
          />
        </View>
      </View>
      <Text style={[styles.customerName, { color: colors.text }]}>
        {item.customer_name || 'No customer'}
      </Text>
      <View style={styles.quoteFooter}>
        <Text style={[styles.total, { color: colors.textSecondary }]}>
          {item.currency_symbol || '₹'}{item.final_total?.toLocaleString() || '0'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {item.quote_date || ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.quote_number)}
        style={styles.deleteBtn}
      >
        <Text style={{ color: colors.error, fontSize: fontSize.sm }}>Delete</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Saved Quotations</Text>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Text style={[styles.searchToggle, { color: colors.accent }]}>
              {showSearch ? '✕' : '🔍'}
            </Text>
          </TouchableOpacity>
        </View>

        {showSearch && (
          <GlassInput
            placeholder="Search by customer, number, or phone..."
            value={search}
            onChangeText={handleSearch}
            containerStyle={{ marginBottom: spacing.md }}
          />
        )}

        {loading ? (
          <ListSkeleton count={4} />
        ) : quotations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No quotations yet
            </Text>
            <GlassButton
              title="Create New Quote"
              onPress={() => router.push('/quotation/new')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <FlatList
            data={quotations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  searchToggle: {
    fontSize: fontSize.xl,
    padding: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  quoteCard: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quoteNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  customerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  date: {
    fontSize: fontSize.sm,
  },
  deleteBtn: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
  },
});
