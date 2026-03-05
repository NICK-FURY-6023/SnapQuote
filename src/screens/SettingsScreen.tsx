import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { GlassButton } from '../components/GlassButton';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { syncToSupabase } from '../services/syncService';

export const SettingsScreen: React.FC = () => {
    const { colors, mode, setTheme } = useTheme();
    const { settings, loadSettings, updateSettings } = useSettingsStore();
    const { changePassword } = useAuthStore();
    const [newPassword, setNewPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    if (!settings) return null;

    const handleSync = async () => {
        try {
            setSyncing(true);
            const result = await syncToSupabase();
            Alert.alert('✅ Sync Complete', `Synced: ${result.synced} | Errors: ${result.errors}`);
        } catch (err) {
            Alert.alert('Error', 'Failed to sync with cloud.');
        } finally {
            setSyncing(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 4) {
            Alert.alert('Error', 'Password must be at least 4 characters.');
            return;
        }
        if (!masterPassword) {
            Alert.alert('Error', 'Master Password is required.');
            return;
        }
        const success = await changePassword(newPassword, masterPassword);
        if (success) {
            setNewPassword('');
            setMasterPassword('');
            Alert.alert('✅ Success', 'App password changed successfully!');
        } else {
            Alert.alert('❌ Denied', 'Invalid Master Password. Only NICK FURY can change this.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Customize your experience</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Company Information */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>🏢 COMPANY INFORMATION</Text>
                <GlassCard>
                    <GlassInput
                        label="Company Name"
                        value={settings.company_name}
                        onChangeText={(v) => updateSettings({ company_name: v })}
                        placeholder="Enter company name"
                    />
                    <GlassInput
                        label="Company Phone"
                        value={settings.company_phone}
                        onChangeText={(v) => updateSettings({ company_phone: v })}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />
                    <GlassInput
                        label="Company Address"
                        value={settings.company_address}
                        onChangeText={(v) => updateSettings({ company_address: v })}
                        placeholder="Enter address"
                        multiline
                        numberOfLines={2}
                    />
                    <GlassInput
                        label="Currency Symbol"
                        value={settings.currency}
                        onChangeText={(v) => updateSettings({ currency: v })}
                        placeholder="₹"
                    />
                </GlassCard>

                {/* Theme Selection */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>🎨 APP THEME</Text>
                <View style={styles.themeRow}>
                    <TouchableOpacity
                        style={[
                            styles.themeCard,
                            {
                                backgroundColor: '#FFFFFF',
                                borderColor: mode === 'light' ? colors.accent : '#E5E7EB',
                                borderWidth: mode === 'light' ? 2.5 : 1,
                            },
                        ]}
                        onPress={() => {
                            setTheme('light');
                            updateSettings({ theme: 'light' });
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.themeIcon}>☀️</Text>
                        <Text style={[styles.themeLabel, { color: '#111111' }]}>Pure White</Text>
                        {mode === 'light' && (
                            <LinearGradient
                                colors={[colors.gradientStart, colors.gradientEnd]}
                                style={styles.checkmark}
                            >
                                <Text style={styles.check}>✓</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.themeCard,
                            {
                                backgroundColor: '#0F0F0F',
                                borderColor: mode === 'dark' ? colors.accent : 'rgba(255,255,255,0.15)',
                                borderWidth: mode === 'dark' ? 2.5 : 1,
                            },
                        ]}
                        onPress={() => {
                            setTheme('dark');
                            updateSettings({ theme: 'dark' });
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.themeIcon}>🌙</Text>
                        <Text style={[styles.themeLabel, { color: '#FFFFFF' }]}>Pure Black</Text>
                        {mode === 'dark' && (
                            <LinearGradient
                                colors={[colors.gradientStart, colors.gradientEnd]}
                                style={styles.checkmark}
                            >
                                <Text style={styles.check}>✓</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Security */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>🔒 SECURITY</Text>
                <GlassCard>
                    <GlassInput
                        label="Master Password (Admin Only)"
                        value={masterPassword}
                        onChangeText={setMasterPassword}
                        placeholder="Enter master password to authorize"
                        secureTextEntry
                    />
                    <GlassInput
                        label="New App Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new app password"
                        secureTextEntry
                    />
                    <GlassButton
                        title="Change App Password"
                        onPress={handleChangePassword}
                        variant="primary"
                        fullWidth
                        disabled={newPassword.length < 4 || !masterPassword}
                    />
                </GlassCard>

                {/* Cloud Sync */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>☁️ CLOUD SYNC</Text>
                <GlassCard>
                    <GlassButton
                        title={syncing ? 'Syncing...' : 'Sync to Cloud'}
                        onPress={handleSync}
                        variant="primary"
                        fullWidth
                        loading={syncing}
                    />
                    <Text style={[styles.syncNote, { color: colors.textSecondary }]}>
                        Sync your quotations to Supabase cloud for backup and access across devices
                    </Text>
                </GlassCard>

                {/* About */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ℹ️ ABOUT</Text>
                <GlassCard>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Name</Text>
                        <Text style={[styles.aboutValue, { color: colors.text }]}>SnapQuote</Text>
                    </View>
                    <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
                        <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Description</Text>
                        <Text style={[styles.aboutValue, { color: colors.text }]}>Quotation & Invoice Maker</Text>
                    </View>
                    <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Developed by</Text>
                        <Text style={[styles.aboutValue, { color: colors.accent, fontWeight: '800' }]}>NICK FURY</Text>
                    </View>
                </GlassCard>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        SnapQuote – Quotation & Invoice Maker
                    </Text>
                    <Text style={[styles.footerCopy, { color: colors.textSecondary }]}>
                        © 2026 SnapQuote. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8,
    },
    title: { fontSize: 22, fontWeight: '700' },
    subtitle: { fontSize: 14, marginTop: 2 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    sectionHeader: {
        fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: 1, marginTop: 24, marginBottom: 12,
    },
    themeRow: { flexDirection: 'row', gap: 12 },
    themeCard: {
        flex: 1, height: 110, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    themeIcon: { fontSize: 28, marginBottom: 8 },
    themeLabel: { fontSize: 14, fontWeight: '600' },
    checkmark: {
        position: 'absolute', top: 8, right: 8,
        width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    check: { color: '#fff', fontSize: 14, fontWeight: '700' },
    syncNote: { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
    aboutRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10,
    },
    aboutDivider: { height: 0.5 },
    aboutLabel: { fontSize: 14 },
    aboutValue: { fontSize: 14, fontWeight: '500' },
    footer: {
        alignItems: 'center', marginTop: 32, marginBottom: 16,
    },
    footerText: { fontSize: 13, fontWeight: '500' },
    footerCopy: { fontSize: 11, marginTop: 4 },
});
