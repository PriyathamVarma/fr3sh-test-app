import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { userApi } from '@/services/api';

export default function EditProfileScreen() {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [village, setVillage] = useState(user?.village ?? '');
  const [district, setDistrict] = useState(user?.district ?? '');
  const [state, setState] = useState(user?.state ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name cannot be empty.'); return; }
    setSaving(true);
    try {
      const updates: Record<string, string> = { name, phone, bio, village, district, state };
      await userApi.update(updates);
      updateUser(updates);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const isFarmer = user?.type === 'Farmer';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.emailLabel}>{user?.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Personal Info</Text>
        <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
        <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

        {isFarmer && (
          <>
            <Text style={styles.sectionLabel}>Farmer Info</Text>
            <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell buyers about your farm..." multiline />
            <Field label="Village / Area" value={village} onChange={setVillage} placeholder="e.g. Nalgonda Village" />
            <Field label="District" value={district} onChange={setDistrict} placeholder="e.g. Nalgonda" />
            <Field label="State" value={state} onChange={setState} placeholder="e.g. Telangana" />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, multiline, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.foregroundMuted}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  input: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.md, color: Colors.foregroundHeading,
  },
  inputMulti: { minHeight: 90, paddingTop: 12 },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, gap: 8,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, flex: 1 },
  saveBtn: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.secondary,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary },
  emailLabel: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
});
