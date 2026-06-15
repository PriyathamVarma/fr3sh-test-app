import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { authApi } from '@/services/api';
import { useUser } from '@/context/UserContext';

type Tab = 'login' | 'register';

const ROLES = [
  { value: 'Buyer', label: 'Buyer', icon: 'basket-outline' as const, desc: 'Browse and buy fresh produce' },
  { value: 'Farmer', label: 'Farmer', icon: 'leaf-outline' as const, desc: 'Sell your produce directly' },
  { value: 'Logistics Provider', label: 'Delivery', icon: 'car-outline' as const, desc: 'Deliver orders to buyers' },
];

export default function AuthScreen() {
  const { login } = useUser();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Buyer');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password });
      const loggedInUser = res.user ?? res.data;
      const token = res.token ?? res.data?.token;
      if (res.success && loggedInUser) {
        await login(loggedInUser, token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', res.message ?? 'Unable to sign in. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password, type: role });
      Alert.alert('Account Created', 'You can now log in with your credentials.', [
        { text: 'Log In', onPress: () => { setTab('login'); setPassword(''); } },
      ]);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (focused: boolean = false) => ({
    ...styles.input,
    borderColor: focused ? Colors.borderFocus : Colors.border,
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="leaf-outline" size={38} color={Colors.secondary} />
          </View>
          <Text style={styles.logoText}>FR3SH</Text>
          <Text style={styles.tagline}>Pick fresh. Eat fresh.</Text>
          <Text style={styles.heroSub}>
            India's direct-to-consumer farm marketplace
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Tab switcher */}
          <View style={styles.tabs}>
            {(['login', 'register'] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'login' ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Welcome back</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.foregroundMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.passWrap}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.foregroundMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.foregroundMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.primaryForeground} />
                ) : (
                  <Text style={styles.submitBtnText}>Sign In →</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Join FR3SH</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.foregroundMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.foregroundMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.passWrap}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={Colors.foregroundMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.foregroundMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>I am a...</Text>
                <View style={styles.roleGrid}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r.value}
                      style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                      onPress={() => setRole(r.value)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name={r.icon} size={22} color={role === r.value ? Colors.primary : Colors.foregroundBody} />
                      <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                        {r.label}
                      </Text>
                      <Text style={styles.roleDesc}>{r.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.primaryForeground} />
                ) : (
                  <Text style={styles.submitBtnText}>Create Account →</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.termsLink} onPress={() => Linking.openURL('https://fr3sh.in/terms')}>
                  Terms of Service
                </Text>
                {' & '}
                <Text style={styles.termsLink} onPress={() => Linking.openURL('https://fr3sh.in/privacy')}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Guest option */}
        <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.guestText}>Continue as guest →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center', paddingTop: 60, paddingBottom: 40,
  },
  logoWrap: {
    width: 70, height: 70, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  tagline: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: '700', marginTop: 4 },
  heroSub: {
    fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)',
    marginTop: 8, textAlign: 'center', paddingHorizontal: 32,
  },

  card: {
    backgroundColor: Colors.surfaceCard,
    marginHorizontal: 16, marginTop: -20,
    borderRadius: BorderRadius.xl, padding: 20,
    ...Shadow.md,
  },

  tabs: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: 4, marginBottom: 20,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: BorderRadius.md, alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.surfaceCard, ...Shadow.sm },
  tabLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundMuted },
  tabLabelActive: { color: Colors.primary, fontWeight: '800' },

  form: { gap: 14 },
  formTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.foregroundHeading, marginBottom: 4 },

  field: { gap: 6 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.md, color: Colors.foregroundHeading,
  },
  passWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: 14,
    overflow: 'hidden',
  },
  eyeBtn: { padding: 10 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, paddingVertical: 15,
    alignItems: 'center', marginTop: 6,
    ...Shadow.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },

  roleGrid: { flexDirection: 'column', gap: 8 },
  roleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  roleLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { flex: 1, fontSize: FontSize.xs, color: Colors.foregroundMuted },

  termsText: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: Colors.primary, fontWeight: '600' },

  guestBtn: { alignItems: 'center', marginTop: 16, padding: 12 },
  guestText: { fontSize: FontSize.sm, color: Colors.foregroundMuted, fontWeight: '600' },
});
