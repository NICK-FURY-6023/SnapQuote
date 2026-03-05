import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuotationStore } from '../stores/quotationStore';
import { useSettingsStore } from '../stores/settingsStore';

const { width } = Dimensions.get('window');

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

const quickActions = [
    { title: 'New\nQuotation', icon: '📝', screen: 'QuotationEditor', params: { isNew: true } },
    { title: 'Scan\nImage', icon: '📷', screen: 'QuotationEditor', params: { isNew: true } },
    { title: 'Text\nInput', icon: '⌨️', screen: 'QuotationEditor', params: { isNew: true } },
    { title: 'Saved\nQuotes', icon: '📁', screen: 'SavedQuotations', params: {} },
];

export const HomeScreen: React.FC = () => {
    const { colors, mode } = useTheme();
    const navigation = useNavigation<any>();
    const { quotations, loadQuotations } = useQuotationStore();
    const { settings } = useSettingsStore();
    const currency = settings?.currency || '₹';

    useFocusEffect(
        useCallback(() => {
            loadQuotations();
        }, [])
    );

    const totalRevenue = quotations.reduce((sum, q) => sum + Number(q.final_total || 0), 0);
    const recentQuotes = quotations.slice(0, 3);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.appTitle}>SnapQuote</Text>
                            <Text style={styles.appSubtitle}>Create quotes in seconds</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => navigation.navigate('HomeTabs', { screen: 'Settings' })}
                        >
                            <Text style={styles.settingsIcon}>⚙️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{quotations.length}</Text>
                            <Text style={styles.statLabel}>Total Quotes</Text>
                        </View>
                        <View style={[styles.statDivider]} />
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{currency}{totalRevenue > 99999 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue.toFixed(0)}</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </View>
                        <View style={[styles.statDivider]} />
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{quotations.filter(q => q.sync_status === 'pending').length}</Text>
                            <Text style={styles.statLabel}>Drafts</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Actions Grid */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate(action.screen, action.params)}
                            style={{ width: (width - 60) / 2 }}
                        >
                            <GlassCard style={styles.actionCard}>
                                <Text style={styles.actionIcon}>{action.icon}</Text>
                                <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Quotations */}
                {recentQuotes.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Quotations</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('HomeTabs', { screen: 'Quotes' })}>
                                <Text style={[styles.seeAll, { color: colors.accent }]}>See All →</Text>
                            </TouchableOpacity>
                        </View>
                        {recentQuotes.map((q) => (
                            <TouchableOpacity
                                key={q.id}
                                activeOpacity={0.85}
                                onPress={async () => {
                                    await useQuotationStore.getState().loadQuotation(q.id);
                                    navigation.navigate('PreviewScreen');
                                }}
                            >
                                <GlassCard style={styles.quoteCard}>
                                    <View style={styles.quoteRow}>
                                        <View style={[styles.quoteIcon, { backgroundColor: colors.accentLight }]}>
                                            <Text style={styles.quoteIconText}>📄</Text>
                                        </View>
                                        <View style={styles.quoteInfo}>
                                            <Text style={[styles.quoteName, { color: colors.text }]} numberOfLines={1}>
                                                {q.customer_name || 'Unnamed'}
                                            </Text>
                                            <Text style={[styles.quoteNumber, { color: colors.textSecondary }]}>
                                                {q.quote_number} • {q.quote_date}
                                            </Text>
                                        </View>
                                        <View style={styles.quoteRight}>
                                            <Text style={[styles.quoteAmount, { color: colors.text }]}>
                                                {currency}{Number(q.final_total).toFixed(0)}
                                            </Text>
                                            <View style={[
                                                styles.statusBadge,
                                                { backgroundColor: q.sync_status === 'synced' ? colors.success + '20' : colors.accentLight }
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    { color: q.sync_status === 'synced' ? colors.success : colors.accent }
                                                ]}>
                                                    {q.sync_status === 'synced' ? '✓ Synced' : 'Draft'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {/* Empty State */}
                {quotations.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No quotations yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Tap "New Quotation" to create your first quote
                        </Text>
                    </GlassCard>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('QuotationEditor', { isNew: true })}
            >
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.fabIcon}>＋</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    headerGradient: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
    },
    appSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    settingsIcon: { fontSize: 20 },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        marginTop: 20,
        paddingVertical: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 0,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    actionCard: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 17,
    },
    quoteCard: {
        marginHorizontal: 20,
        marginBottom: 8,
    },
    quoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quoteIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quoteIconText: { fontSize: 22 },
    quoteInfo: { flex: 1 },
    quoteName: {
        fontSize: 15,
        fontWeight: '600',
    },
    quoteNumber: {
        fontSize: 12,
        marginTop: 2,
    },
    quoteRight: {
        alignItems: 'flex-end',
    },
    quoteAmount: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    emptyCard: {
        marginHorizontal: 20,
        marginTop: 24,
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabIcon: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '300',
    },
});
