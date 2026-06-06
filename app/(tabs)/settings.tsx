import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassContainer from '../../src/components/GlassContainer';
import GlassCard from '../../src/components/GlassCard';
import GlassInput from '../../src/components/GlassInput';
import GlassButton from '../../src/components/GlassButton';
import GlassPicker from '../../src/components/GlassPicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { spacing, fontSize, fontWeight } from '../../src/theme/tokens';
import { ThemeMode } from '../../src/types';

const CURRENCY_OPTIONS = [
  { label: '₹ INR (Indian Rupee)', value: 'INR' },
  { label: '$ USD (US Dollar)', value: 'USD' },
  { label: '€ EUR (Euro)', value: 'EUR' },
  { label: '£ GBP (British Pound)', value: 'GBP' },
  { label: '¥ JPY (Japanese Yen)', value: 'JPY' },
  { label: '₩ KRW (Korean Won)', value: 'KRW' },
  { label: '₽ RUB (Russian Ruble)', value: 'RUB' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', KRW: '₩', RUB: '₽',
};

export default function SettingsScreen() {
  const { colors, isDark, mode } = useTheme();
  const { settings, loading, updateSettings, loadSettings } = useSettingsStore();
  const { lock, setPasscode } = useAuthStore();
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || '');
      setCompanyPhone(settings.company_phone || '');
      setCompanyAddress(settings.company_address || '');
      setCompanyEmail(settings.company_email || '');
      setGstNumber(settings.gst_number || '');
      setDiscordWebhook(settings.discord_webhook_url || '');
    }
  }, [settings]);

  const handleSaveCompany = async () => {
    await updateSettings({
      company_name: companyName,
      company_phone: companyPhone,
      company_address: companyAddress,
      company_email: companyEmail,
    });
    Alert.alert('Saved', 'Company information updated.');
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    await updateSettings({ theme: newTheme } as any);
  };

  const handleCurrencyChange = async (code: string) => {
    await updateSettings({
      currency_code: code,
      currency_symbol: CURRENCY_SYMBOLS[code] || '₹',
    } as any);
  };

  const handleBiometricToggle = async (value: boolean) => {
    await updateSettings({ biometric_enabled: value } as any);
  };

  const handleGstToggle = async (value: boolean) => {
    await updateSettings({ gst_registered: value } as any);
  };

  const handleSaveGst = async () => {
    await updateSettings({ gst_number: gstNumber } as any);
    Alert.alert('Saved', 'GST information updated.');
  };

  const handleSaveDiscord = async () => {
    await updateSettings({ discord_webhook_url: discordWebhook || null } as any);
    Alert.alert('Saved', 'Discord webhook configured.');
  };

  const handleChangePasscode = () => {
    Alert.prompt?.(
      'Change Passcode',
      'Enter your new passcode:',
      async (newPasscode: string) => {
        if (newPasscode.length >= 4) {
          await setPasscode(newPasscode);
          Alert.alert('Success', 'Passcode updated.');
        } else {
          Alert.alert('Error', 'Passcode must be at least 4 characters.');
        }
      },
      'secure-text',
    );
  };

  const handleLock = async () => {
    await lock();
    router.replace('/lock');
  };

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

          {/* Company Info */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Company Profile</Text>
          <GlassCard style={styles.section}>
            <GlassInput label="Company Name" value={companyName} onChangeText={setCompanyName} placeholder="Your business name" />
            <GlassInput label="Phone" value={companyPhone} onChangeText={setCompanyPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
            <GlassInput label="Address" value={companyAddress} onChangeText={setCompanyAddress} placeholder="Business address" multiline />
            <GlassInput label="Email" value={companyEmail} onChangeText={setCompanyEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
            <GlassButton title="Save Company Info" onPress={handleSaveCompany} loading={loading} />
          </GlassCard>

          {/* Theme */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <GlassCard style={styles.section}>
            <View style={styles.themeRow}>
              <Text style={[styles.themeLabel, { color: colors.text }]}>Theme</Text>
              <View style={styles.themeToggle}>
                <GlassButton
                  title="Dark"
                  onPress={() => handleThemeChange('dark')}
                  variant={isDark ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1 }}
                />
                <View style={{ width: spacing.sm }} />
                <GlassButton
                  title="Light"
                  onPress={() => handleThemeChange('light')}
                  variant={!isDark ? 'primary' : 'secondary'}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <GlassPicker
              label="Default Currency"
              options={CURRENCY_OPTIONS}
              selected={settings?.currency_code || 'INR'}
              onSelect={handleCurrencyChange}
            />
          </GlassCard>

          {/* Billing & Tax */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Billing & Tax</Text>
          <GlassCard style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>GST Registered</Text>
              <Switch
                value={settings?.gst_registered ?? false}
                onValueChange={handleGstToggle}
                trackColor={{ false: colors.border, true: colors.accentLight }}
                thumbColor={settings?.gst_registered ? colors.accent : colors.textSecondary}
              />
            </View>
            {settings?.gst_registered && (
              <>
                <GlassInput
                  label="GST Number"
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  placeholder="22AAAAA0000A1Z5"
                  autoCapitalize="characters"
                />
                <GlassButton title="Save GST" onPress={handleSaveGst} variant="secondary" />
              </>
            )}
          </GlassCard>

          {/* Security */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
          <GlassCard style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Biometric Unlock</Text>
              <Switch
                value={settings?.biometric_enabled ?? false}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.accentLight }}
                thumbColor={settings?.biometric_enabled ? colors.accent : colors.textSecondary}
              />
            </View>
            <GlassButton title="Change Passcode" onPress={handleChangePasscode} variant="secondary" style={{ marginBottom: spacing.sm }} />
            <GlassButton title="Lock App Now" onPress={handleLock} variant="ghost" />
          </GlassCard>

          {/* Integrations */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Integrations</Text>
          <GlassCard style={styles.section}>
            <GlassInput
              label="Discord Webhook URL"
              value={discordWebhook}
              onChangeText={setDiscordWebhook}
              placeholder="https://discord.com/api/webhooks/..."
              autoCapitalize="none"
            />
            <GlassButton title="Save Webhook" onPress={handleSaveDiscord} variant="secondary" />
          </GlassCard>

          {/* About */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <GlassCard style={styles.section}>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              SnapQuote v2{'\n'}
              Professional quotation generator for freelancers and small businesses.
            </Text>
          </GlassCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },
  section: {
    marginBottom: spacing.sm,
  },
  themeRow: {
    marginBottom: spacing.md,
  },
  themeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  themeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  switchLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  aboutText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
