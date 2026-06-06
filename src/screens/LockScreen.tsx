import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';
import GlassContainer from '../components/GlassContainer';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../stores/authStore';
import { spacing, fontSize, fontWeight } from '../theme/tokens';

const { width } = Dimensions.get('window');

export default function LockScreen() {
  const { colors } = useTheme();
  const { unlockWithPasscode, unlockWithBiometric, isBiometricAvailable, biometricEnabled, error } = useAuthStore();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleUnlock = async () => {
    if (!passcode.trim()) return;
    setLoading(true);
    const success = await unlockWithPasscode(passcode);
    setLoading(false);

    if (!success) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setPasscode('');
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    await unlockWithBiometric();
    setLoading(false);
  };

  return (
    <GlassContainer gradient>
      <View style={styles.container}>
        <View style={styles.center}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logoCircle, { shadowColor: colors.accent }]}
          >
            <Text style={styles.logoText}>SQ</Text>
          </LinearGradient>

          <Text style={[styles.appName, { color: colors.text }]}>SnapQuote</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Professional quotes in seconds
          </Text>

          <Animated.View
            style={[styles.inputArea, { transform: [{ translateX: shakeAnim }] }]}
          >
            <GlassInput
              label="Enter Passcode"
              placeholder="Your passcode"
              secureTextEntry
              value={passcode}
              onChangeText={setPasscode}
              onSubmitEditing={handleUnlock}
              error={error ?? undefined}
              containerStyle={{ width: '100%' }}
              returnKeyType="go"
              autoFocus
            />

            <GlassButton
              title="Unlock"
              onPress={handleUnlock}
              loading={loading}
              size="lg"
              style={{ width: '100%', marginTop: spacing.md }}
            />
          </Animated.View>

          {isBiometricAvailable && biometricEnabled && (
            <GlassButton
              title="Use Face ID / Fingerprint"
              onPress={handleBiometric}
              variant="ghost"
              style={{ marginTop: spacing.lg }}
            />
          )}
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          SnapQuote v2
        </Text>
      </View>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },
  tagline: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  inputArea: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  version: {
    fontSize: fontSize.xs,
  },
});
