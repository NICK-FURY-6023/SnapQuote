import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface GlassInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    numberOfLines?: number;
    style?: ViewStyle;
    secureTextEntry?: boolean;
    editable?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label, value, onChangeText, placeholder, keyboardType = 'default',
    multiline = false, numberOfLines = 1, style, secureTextEntry = false, editable = true,
}) => {
    const { colors, mode } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#9CA3AF'}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                secureTextEntry={secureTextEntry}
                editable={editable}
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                        ...(multiline ? { height: numberOfLines * 24 + 24, textAlignVertical: 'top' } : {}),
                        ...(mode === 'light' ? {
                            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                        } : {}),
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
});
