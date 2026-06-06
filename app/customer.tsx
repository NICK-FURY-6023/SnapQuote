import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassContainer from '../src/components/GlassContainer';
import GlassCard from '../src/components/GlassCard';
import GlassInput from '../src/components/GlassInput';
import GlassButton from '../src/components/GlassButton';
import GlassChip from '../src/components/GlassChip';
import { useTheme } from '../src/theme/ThemeProvider';
import { useClientStore } from '../src/stores/clientStore';
import { useQuotationStore } from '../src/stores/quotationStore';
import { spacing, fontSize, fontWeight } from '../src/theme/tokens';

export default function CustomerDetailsScreen() {
  const { colors } = useTheme();
  const { clients, searchResults, loading, searchClients, loadClients, saveClient, clearSearch } = useClientStore();
  const { currentQuotation: quote, setCustomerDetails } = useQuotationStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (quote) {
      setName(quote.customer_name || '');
      setPhone(quote.phone || '');
      setAddress(quote.address || '');
    }
  }, [quote?.id]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    searchClients(text);
  }, []);

  const selectClient = (client: typeof clients[0]) => {
    setName(client.name);
    setPhone(client.phone);
    setAddress(client.address);
    setEmail(client.email || '');
    clearSearch();
  };

  const handleSaveAndContinue = async () => {
    setCustomerDetails({ customer_name: name, phone, address });

    // Save to client DB if has name
    if (name.trim()) {
      try {
        await saveClient({ name, phone, address, email: email || null, user_id: 'local', notes: '' });
      } catch {
        // Non-critical — quote still saves
      }
    }

    router.push('/preview');
  };

  return (
    <GlassContainer>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.content}>
              {/* Search existing clients */}
              <GlassInput
                label="Search Existing Clients"
                placeholder="Type name or phone..."
                value={searchQuery}
                onChangeText={handleSearch}
                icon={<Ionicons name="search" size={18} color={colors.textSecondary} />}
              />

              {/* Search results */}
              {searchResults.length > 0 && (
                <GlassCard style={styles.searchResults}>
                  {searchResults.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      onPress={() => selectClient(client)}
                      style={[styles.clientItem, { borderBottomColor: colors.border }]}
                    >
                      <View>
                        <Text style={[styles.clientName, { color: colors.text }]}>{client.name}</Text>
                        <Text style={[styles.clientPhone, { color: colors.textSecondary }]}>{client.phone}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </GlassCard>
              )}

              {/* Customer form */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NEW / EDIT CUSTOMER</Text>
              <GlassCard>
                <GlassInput
                  label="Customer Name *"
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  required
                />
                <GlassInput
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                />
                <GlassInput
                  label="Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Delivery address"
                  multiline
                />
                <GlassInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </GlassCard>

              <GlassButton
                title="Save & Preview"
                onPress={handleSaveAndContinue}
                size="lg"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          }
          contentContainerStyle={styles.scrollContent}
        />
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
  content: { flex: 1 },
  sectionLabel: {
    fontSize: fontSize.sm, fontWeight: fontWeight.semibold, letterSpacing: 1,
    marginBottom: spacing.sm, marginTop: spacing.lg, marginLeft: spacing.xs,
  },
  searchResults: {
    marginBottom: spacing.md,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  clientName: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  clientPhone: { fontSize: fontSize.sm, marginTop: 2 },
});
