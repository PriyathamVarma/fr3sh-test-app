import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';

export default function SettingsScreen() {
  const { logout } = useUser();

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unable to Open Link', url);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(tabs)'); } },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Account', 'This will permanently delete all your data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Request Deletion',
        style: 'destructive',
        onPress: () => openUrl('https://fr3sh.in/data-deletion'),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        <Section label="Account">
          <LinkRow label="Change Password" onPress={() => router.push('/(auth)/forgot-password')} />
          <LinkRow label="Privacy Policy" onPress={() => openUrl('https://fr3sh.in/privacy')} />
          <LinkRow label="Terms of Service" onPress={() => openUrl('https://fr3sh.in/terms')} />
        </Section>

        <Section label="Support">
          <LinkRow label="Contact Support" onPress={() => openUrl('https://fr3sh.in/support')} />
          <LinkRow label="Report a Problem" onPress={() => openUrl('mailto:support@fr3sh.in?subject=FR3SH%20App%20Issue')} />
        </Section>

        <Section label="App Info">
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="2026.06" />
        </Section>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete My Account</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={secStyles.section}>
      <Text style={secStyles.label}>{label}</Text>
      <View style={secStyles.card}>{children}</View>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.info}>{value}</Text>
    </View>
  );
}

const secStyles = StyleSheet.create({
  section: { gap: 6 },
  label: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 4 },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  label: { flex: 1, fontSize: FontSize.md, color: Colors.foregroundHeading },
  sub: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 1 },
  arrow: { fontSize: 20, color: Colors.foregroundMuted },
  info: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  signOutBtn: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  signOutText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.statusDanger },
  deleteBtn: { padding: 12, alignItems: 'center' },
  deleteText: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textDecorationLine: 'underline' },
});
