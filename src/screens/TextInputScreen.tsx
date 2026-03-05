import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { useQuotationStore } from '../stores/quotationStore';

export const TextInputScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { createNewQuotation, updateItem } = useQuotationStore();
    const [text, setText] = useState('');

    const handleGenerate = () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some items.');
            return;
        }

        // Extremely basic parsing logic for demonstration.
        // Format expected: "ItemName Qty Price" per line
        const lines = text.split('\n').filter(l => l.trim().length > 0);

        createNewQuotation(); // start fresh quote

        lines.forEach((line, index) => {
            // Very fuzzy matching: look for numbers
            const parts = line.trim().split(/\s+/);
            let name = parts[0] || 'Unknown Item';
            let qty = 1;
            let price = 0;

            // Try to figure out name (everything up to first number)
            const firstNumIdx = parts.findIndex(p => !isNaN(Number(p)));
            if (firstNumIdx > 0) {
                name = parts.slice(0, firstNumIdx).join(' ');
                qty = Number(parts[firstNumIdx]) || 1;
                price = Number(parts[firstNumIdx + 1]) || 0;
            } else if (firstNumIdx === 0) {
                name = 'Item ' + (index + 1);
                qty = Number(parts[0]);
                price = Number(parts[1]) || 0;
            }

            // Ensure empty slots exist
            while (useQuotationStore.getState().currentItems.length <= index) {
                useQuotationStore.getState().addItem();
            }

            updateItem(index, 'item_name', name);
            updateItem(index, 'quantity', qty);
            updateItem(index, 'rate', price);
        });

        navigation.navigate('QuotationEditor', { isNew: false });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Quick Text Input</Text>
                <View style={{ width: 48 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                    Paste or type your items here. We'll automatically convert them into a quotation table.
                </Text>
                <Text style={[styles.formatHint, { color: colors.accent }]}>
                    Format: Item Name • Quantity • Price
                </Text>

                <GlassCard style={styles.inputCard}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        multiline
                        autoFocus
                        placeholder={'E.g.\nCement Bag 5 350\nSteel Rods 10 1200\nLabor Charge 1 500'}
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { color: colors.text }]}
                        textAlignVertical="top"
                    />
                </GlassCard>

                <GlassButton
                    title="✨ Generate Table"
                    onPress={() => {
                        Keyboard.dismiss();
                        handleGenerate();
                    }}
                    variant="primary"
                    style={styles.generateBtn}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, height: 100,
        borderBottomWidth: 0.5,
    },
    backBtn: { fontSize: 16, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: {
        padding: 20,
        flex: 1,
    },
    instruction: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 8,
    },
    formatHint: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 20,
    },
    inputCard: {
        flex: 1,
        padding: 0,
        marginBottom: 24,
    },
    input: {
        flex: 1,
        padding: 20,
        fontSize: 16,
        lineHeight: 24,
    },
    generateBtn: {
        marginBottom: 40,
    },
});
