import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const mainActions = [
    { title: 'New Quotation', icon: '＋', screen: 'QuotationEditor', params: { isNew: true } },
    { title: 'Scan Image', icon: '📷', screen: 'Scan', params: {} },
    { title: 'Text Input', icon: '⌨️', screen: 'TextInputScreen', params: {} },
    { title: 'Saved Quotations', icon: '📁', screen: 'Quotes', params: {} },
];

export const HomeScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.appTitle}>SnapQuote</Text>
                            <Text style={styles.appSubtitle}>Create quotes in seconds</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <Text style={styles.profileIcon}>👤</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Cards List */}
                    <View style={styles.actionsContainer}>
                        {mainActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (action.screen === 'Scan' || action.screen === 'Quotes') {
                                        navigation.navigate('HomeTabs', { screen: action.screen });
                                    } else {
                                        navigation.navigate(action.screen, action.params);
                                    }
                                }}
                            >
                                <GlassCard style={styles.actionCard}>
                                    <View style={styles.actionLeft}>
                                        <View style={[styles.iconWrapper, { backgroundColor: colors.glassBorder }]}>
                                            <Text style={styles.actionIcon}>{action.icon}</Text>
                                        </View>
                                        <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                                    </View>
                                    <Text style={[styles.actionChevron, { color: colors.textSecondary }]}>›</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 120
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    appSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    profileBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    profileIcon: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    actionsContainer: {
        gap: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 24,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionIcon: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    actionChevron: {
        fontSize: 28,
        fontWeight: '300',
        paddingHorizontal: 8,
    },
});
