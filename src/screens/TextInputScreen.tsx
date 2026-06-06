import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import GlassContainer from '../components/GlassContainer';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { useTheme } from '../theme/ThemeProvider';
import { useQuotationStore } from '../stores/quotationStore';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme/tokens';
import { RootStackParamList } from '../navigation/navigationRef';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TextInputRouteProp = RouteProp<RootStackParamList, 'TextInput'>;

/**
 * Smart parser for text input.
 * Formats supported:
 *   - "ItemName Qty Rate" (space-separated)
 *   - "ItemName - Qty x Rate"
 *   - "1. ItemName ..." (numbered lines)
 *   - "ItemName @ Rate x Qty"
 */
function parseLine(line: string): { name: string; qty: number; rate: number } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Remove leading numbering: "1. " or "1) "
  let text = trimmed.replace(/^\d+[\.\)]\s*/, '');

  // Pattern 1: "Item @ Rate x Qty"
  const atMatch = text.match(/^(.+?)\s+@\s*(\d+[\.\d]*)\s*x\s*(\d+[\.\d]*)$/i);
  if (atMatch) {
    return { name: atMatch[1].trim(), rate: parseFloat(atMatch[2]), qty: parseFloat(atMatch[3]) };
  }

  // Pattern 2: "Item - Qty x Rate" or "Item Qty x Rate"
  const xMatch = text.match(/^(.+?)\s*-?\s*(\d+[\.\d]*)\s*x\s*(\d+[\.\d]*)$/i);
  if (xMatch) {
    return { name: xMatch[1].trim(), qty: parseFloat(xMatch[2]), rate: parseFloat(xMatch[3]) };
  }

  // Pattern 3: "ItemName Qty Rate" (last two tokens are numbers)
  const tokens = text.split(/\s+/);
  if (tokens.length >= 3) {
    const rate = parseFloat(tokens[tokens.length - 1]);
    const qty = parseFloat(tokens[tokens.length - 2]);
    if (!isNaN(qty) && !isNaN(rate) && tokens.length > 2) {
      const name = tokens.slice(0, tokens.length - 2).join(' ');
      return { name, qty, rate };
    }
  }

  // Pattern 4: Just item name and rate (qty=1)
  if (tokens.length === 2) {
    const rate = parseFloat(tokens[1]);
    if (!isNaN(rate)) {
      return { name: tokens[0], qty: 1, rate };
    }
  }

  // Return as name only, qty=1 rate=0
  return { name: text, qty: 1, rate: 0 };
}

export default function TextInputScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TextInputRouteProp>();
  const photoUri = route.params?.photoUri;
  const { createNewQuotation, addItem, updateItem, currentItems: items } = useQuotationStore();
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<{ name: string; qty: number; rate: number }[]>([]);

  useEffect(() => {
    createNewQuotation();
  }, []);

  const handleParse = () => {
    const lines = rawText.split('\n').filter((l) => l.trim());
    const results = lines
      .map(parseLine)
      .filter((r): r is NonNullable<typeof r> => r !== null);

    setParsed(results);
  };

  const handleApply = async () => {
    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i];
      if (i < items.length) {
        updateItem(i, 'item_name', p.name);
        updateItem(i, 'quantity', p.qty);
        updateItem(i, 'rate', p.rate);
        updateItem(i, 'unit', 'Pc');
      } else {
        addItem();
        setTimeout(() => {
          updateItem(i, 'item_name', p.name);
          updateItem(i, 'quantity', p.qty);
          updateItem(i, 'rate', p.rate);
          updateItem(i, 'unit', 'Pc');
        }, 0);
      }
    }

    navigation.navigate('NewQuotation');
  };

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Quick Entry</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            Enter items one per line. Format: "ItemName Qty Rate"{'\n'}
            Examples:{'\n'}
            "Cement Bag 50kg 2 350"{'\n'}
            "Paint 5L 3 x 450"{'\n'}
            "Screws @ 10 x 100"
          </Text>

          <GlassCard>
            <TextInput
              style={[
                styles.textArea,
                { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.glassBorder },
              ]}
              placeholder="Paste or type items here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={rawText}
              onChangeText={setRawText}
            />
            <GlassButton title="Parse Items" onPress={handleParse} style={{ marginTop: spacing.md }} />
          </GlassCard>

          {parsed.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PARSED ITEMS</Text>
              <GlassCard>
                {parsed.map((p, i) => (
                  <View
                    key={i}
                    style={[
                      styles.parsedItem,
                      i < parsed.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.parsedName, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[styles.parsedDetail, { color: colors.textSecondary }]}>
                      Qty: {p.qty} × ₹{p.rate.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </GlassCard>

              <GlassButton
                title="Apply & Edit"
                onPress={handleApply}
                size="lg"
                style={{ marginTop: spacing.lg }}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  scrollContent: { padding: spacing.lg },
  instructions: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 160,
  },
  sectionLabel: {
    fontSize: fontSize.sm, fontWeight: fontWeight.semibold, letterSpacing: 1,
    marginBottom: spacing.sm, marginTop: spacing.lg, marginLeft: spacing.xs,
  },
  parsedItem: {
    paddingVertical: spacing.sm,
  },
  parsedName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  parsedDetail: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
