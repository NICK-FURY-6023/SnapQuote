import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GlassContainer from '../components/GlassContainer';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassChip from '../components/GlassChip';
import { CardSkeleton } from '../components/GlassSkeleton';
import { useTheme } from '../theme/ThemeProvider';
import { useQuotationStore } from '../stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme/tokens';
import { RootStackParamList } from '../navigation/navigationRef';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { quotations, loading, loadQuotations } = useQuotationStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuotations();
    setRefreshing(false);
  }, []);

  // Stats
  const totalQuotes = quotations.length;
  const todayQuotes = quotations.filter((q) => {
    const today = new Date().toISOString().split('T')[0];
    return q.created_at?.startsWith(today);
  }).length;
  const totalRevenue = quotations.reduce((sum, q) => sum + q.final_total, 0);
  const pendingSync = quotations.filter((q) => q.sync_status === 'pending').length;

  const quickActions = [
    { title: 'New Quote', icon: '➕', route: 'NewQuotation' as const, color: colors.accent },
    { title: 'Scan Product', icon: '📷', route: 'Scan' as const, color: colors.success },
    { title: 'Quick Entry', icon: '⌨️', route: 'TextInput' as const, color: colors.warning },
    { title: 'Saved Quotes', icon: '📄', route: 'Quotes' as const, color: colors.info },
  ];

  const recentQuotes = quotations.slice(0, 5);

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>SnapQuote</Text>
            </View>
            {pendingSync > 0 && (
              <GlassChip
                label={`${pendingSync} pending`}
                variant="warning"
              />
            )}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard label="Total Quotes" value={String(totalQuotes)} color={colors.accent} colors={colors} />
            <StatCard label="Today" value={String(todayQuotes)} color={colors.success} colors={colors} />
            <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color={colors.warning} colors={colors} />
          </View>

          {/* Quick actions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => {
              const screenName = action.route;
              return (
                <GlassCard
                  key={screenName}
                  onPress={() => navigation.navigate(screenName as any)}
                  style={{ ...styles.actionCard, borderColor: action.color + '30' }}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{action.title}</Text>
                </GlassCard>
              );
            })}
          </View>

          {/* Recent quotes */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Quotes</Text>
          {loading ? (
            <CardSkeleton />
          ) : recentQuotes.length === 0 ? (
            <GlassCard>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No quotes yet. Tap "New Quote" to create your first one.
              </Text>
            </GlassCard>
          ) : (
            recentQuotes.map((quote) => (
              <GlassCard
                key={quote.id}
                onPress={() => navigation.navigate('EditQuotation', { id: quote.id })}
                style={styles.quoteCard}
              >
                <View style={styles.quoteRow}>
                  <Text style={[styles.quoteNumber, { color: colors.accent }]}>
                    {quote.quote_number || 'Draft'}
                  </Text>
                  <GlassChip
                    label={quote.sync_status === 'synced' ? 'Synced' : 'Pending'}
                    variant={quote.sync_status === 'synced' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={[styles.quoteCustomer, { color: colors.text }]}>
                  {quote.customer_name || 'No customer'}
                </Text>
                <Text style={[styles.quoteTotal, { color: colors.textSecondary }]}>
                  ₹{quote.final_total.toLocaleString()}
                </Text>
              </GlassCard>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassContainer>
  );
}

function StatCard({ label, value, color, colors }: { label: string; value: string; color: string; colors: any }) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.glassBorder,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: '48%',
    minWidth: 140,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  quoteCard: {
    marginBottom: spacing.sm,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quoteNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  quoteCustomer: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  quoteTotal: {
    fontSize: fontSize.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
