import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { authApi } from '@/services/api';

type Step = 'email' | 'otp' | 'done';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email.trim()) { Alert.alert('Enter Email', 'Please enter your email address.'); return; }
    setLoading(true);
    try {
      await authApi.sendResetOtp(email.trim());
      Alert.alert('OTP Sent', `A reset code was sent to ${email}. Check your inbox.`);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Missing Fields', 'Enter the OTP and your new password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyResetOtp({ email: email.trim(), otp: otp.trim(), newPassword });
      setStep('done');
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message ?? 'The OTP is incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
      </View>

      <View style={styles.body}>
        {step === 'email' && (
          <>
            <Ionicons name="mail-outline" size={60} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.title}>Forgot your password?</Text>
            <Text style={styles.sub}>
              Enter your registered email and we'll send you a one-time code to reset your password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.foregroundMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={sendOtp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading
                ? <ActivityIndicator color={Colors.primaryForeground} />
                : <Text style={styles.btnText}>Send OTP →</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 'otp' && (
          <>
            <Ionicons name="lock-closed-outline" size={60} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.sub}>
              We sent a 6-digit code to <Text style={styles.bold}>{email}</Text>.
              Enter it below with your new password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>One-Time Password (OTP)</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="6-digit code"
                placeholderTextColor={Colors.foregroundMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.foregroundMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={verifyOtp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading
                ? <ActivityIndicator color={Colors.primaryForeground} />
                : <Text style={styles.btnText}>Reset Password →</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn} onPress={() => { setStep('email'); setOtp(''); setNewPassword(''); }}>
              <Text style={styles.resendText}>Didn't receive it? Go back</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'done' && (
          <>
            <Ionicons name="checkmark-circle-outline" size={60} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.title}>Password Reset!</Text>
            <Text style={styles.sub}>
              Your password has been updated. You can now sign in with your new password.
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.9}
            >
              <Text style={styles.btnText}>Sign In Now →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { marginRight: 12 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },

  body: {
    flex: 1, padding: 24, paddingTop: 32, alignItems: 'center',
  },
  stepIcon: { marginBottom: 16 },
  title: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.foregroundHeading,
    textAlign: 'center', marginBottom: 8,
  },
  sub: {
    fontSize: FontSize.sm, color: Colors.foregroundMuted,
    textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  bold: { fontWeight: '700', color: Colors.foregroundBody },

  field: { width: '100%', gap: 6, marginBottom: 14 },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  input: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: FontSize.md, color: Colors.foregroundHeading, width: '100%',
  },
  otpInput: {
    fontSize: FontSize.xxl, fontWeight: '900', textAlign: 'center',
    letterSpacing: 6, color: Colors.primary,
  },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, paddingVertical: 15,
    alignItems: 'center', width: '100%', marginTop: 8,
    ...Shadow.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },

  resendBtn: { marginTop: 14, padding: 8 },
  resendText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
});
