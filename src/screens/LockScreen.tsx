import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../stores/authStore';

export const LockScreen: React.FC = () => {
    const { colors, mode } = useTheme();
    const [password, setPassword] = useState('');
    const { checkPassword, error, initPassword } = useAuthStore();
    const shakeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        initPassword();
    }, []);

    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [error]);

    const handleUnlock = async () => {
        const success = await checkPassword(password);
        if (!success) {
            setPassword('');
        }
    };

    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={mode === 'dark'
                    ? ['#000000', '#0a0a1a', '#111133']
                    : ['#E0ECFF', '#F0F4FF', '#FFFFFF']
                }
                style={StyleSheet.absoluteFill}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
                    {/* App Logo */}
                    <LinearGradient
                        colors={[colors.gradientStart, colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logo}
                    >
                        <Text style={styles.logoText}>SQ</Text>
                    </LinearGradient>

                    <Text style={[styles.title, { color: colors.text }]}>SnapQuote</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>🔒 Locked</Text>

                    {/* Glass Container */}
                    <View style={[styles.glassCard, {
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                        borderColor: colors.glassBorder,
                    }]}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                        <View style={[styles.inputContainer, {
                            backgroundColor: colors.inputBg,
                            borderColor: error ? colors.error : colors.border,
                        }]}>
                            <Text style={styles.lockIcon}>🔑</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter password"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry
                                style={[styles.input, { color: colors.text }]}
                                onSubmitEditing={handleUnlock}
                                autoFocus
                            />
                        </View>

                        {error ? (
                            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                                <Text style={[styles.errorText, { color: colors.error }]}>⚠️ {error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity onPress={handleUnlock} activeOpacity={0.85} style={styles.unlockWrapper}>
                            <LinearGradient
                                colors={[colors.gradientStart, colors.gradientEnd]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.unlockButton}
                            >
                                <Text style={styles.unlockText}>Unlock</Text>
                                <Text style={styles.unlockArrow}>→</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Password dots indicator */}
                    <View style={styles.dotsRow}>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: i < password.length ? colors.accent : (mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#E5E7EB'),
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: { flex: 1 },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 32,
    },
    logo: {
        width: 88,
        height: 88,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        fontWeight: '500',
    },
    glassCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    inputContainer: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    lockIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    errorContainer: {
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    unlockWrapper: {
        borderRadius: 26,
        overflow: 'hidden',
    },
    unlockButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    unlockText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    unlockArrow: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
