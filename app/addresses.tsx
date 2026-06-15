import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';

interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', name: '', line1: '', line2: '', city: '', pincode: '', phone: '' });

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddr = (id: string) => {
    Alert.alert('Delete Address?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAddresses(prev => prev.filter(a => a.id !== id)) },
    ]);
  };

  const addAddress = () => {
    if (!form.name || !form.line1 || !form.city || !form.pincode) {
      Alert.alert('Required', 'Please fill in name, address, city and pincode.');
      return;
    }
    setAddresses(prev => [...prev, { ...form, id: `a${Date.now()}`, isDefault: false }]);
    setShowForm(false);
    setForm({ label: 'Home', name: '', line1: '', line2: '', city: '', pincode: '', phone: '' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>

        {addresses.length === 0 && !showForm ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySub}>Add an address when the account address API is connected.</Text>
          </View>
        ) : null}

        {addresses.map(addr => (
          <View key={addr.id} style={styles.addrCard}>
            <View style={styles.addrTop}>
              <View style={styles.labelRow}>
                <Text style={styles.addrLabel}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.addrActions}>
                {!addr.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(addr.id)}>
                    <Text style={styles.actionLink}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteAddr(addr.id)}>
                  <Text style={[styles.actionLink, { color: Colors.statusDanger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addrName}>{addr.name}</Text>
            <Text style={styles.addrText}>{addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}</Text>
            <Text style={styles.addrText}>{addr.city} – {addr.pincode}</Text>
            <Text style={styles.addrPhone}>{addr.phone}</Text>
          </View>
        ))}

        {!showForm ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnIcon}>+</Text>
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Address</Text>
            <View style={styles.labelTabs}>
              {['Home', 'Work', 'Other'].map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelTab, form.label === l && styles.labelTabActive]}
                  onPress={() => setForm(f => ({ ...f, label: l }))}
                >
                  <Text style={[styles.labelTabText, form.label === l && styles.labelTabTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {[
              { key: 'name', label: 'Full Name' },
              { key: 'line1', label: 'Address Line 1' },
              { key: 'line2', label: 'Address Line 2 (optional)' },
              { key: 'city', label: 'City' },
              { key: 'pincode', label: 'Pincode', keyboardType: 'numeric' },
              { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
            ].map(f => (
              <View key={f.key} style={{ gap: 4 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  placeholder={f.label}
                  placeholderTextColor={Colors.foregroundMuted}
                  keyboardType={(f as any).keyboardType ?? 'default'}
                />
              </View>
            ))}
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addAddress}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  addrCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 14, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 4 },
  addrTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  defaultBadge: { backgroundColor: Colors.primaryMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  addrActions: { flexDirection: 'row', gap: 12 },
  actionLink: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  addrName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  addrText: { fontSize: FontSize.sm, color: Colors.foregroundBody },
  addrPhone: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  emptyCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 6 },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, lineHeight: 20 },
  addBtn: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed' },
  addBtnIcon: { fontSize: 22, color: Colors.primary, fontWeight: '700' },
  addBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  formCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 12 },
  formTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading },
  labelTabs: { flexDirection: 'row', gap: 8 },
  labelTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  labelTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  labelTabText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  labelTabTextActive: { color: Colors.primaryForeground },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  input: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.foregroundHeading },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  saveBtn: { flex: 2, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.primary, ...Shadow.lg },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primaryForeground },
});
