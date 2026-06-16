import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share, Alert, Clipboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { referralApi, ReferralStats } from '@/services/api';

export default function ReferralScreen() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const fallbackCode = user?.id ? `FR3SH${user.id.slice(-6).toUpperCase()}` : 'FR3SH';
  const referralCode = stats?.referralCode || fallbackCode;

  useEffect(() => {
    if (!user?.id) return;
    referralApi.stats(user.id).then(r => setStats(r.data)).catch(() => {});
  }, [user?.id]);

  const copyCode = () => {
    if (Clipboard?.setString) {
      Clipboard.setString(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      Alert.alert('Referral Code', referralCode);
    }
  };

  const share = async () => {
    try {
      await Share.share({
        message: `Hey! I use FR3SH to buy fresh produce directly from farmers.\n\nUse my referral code ${referralCode} when you sign up and we both get ₹100 in our wallets!\n\nDownload the FR3SH app and eat fresher, support farmers.`,
        title: 'Join FR3SH — Farm-fresh produce',
      });
    } catch {}
  };

  const STEPS = [
    { label: 'Share your code', desc: 'Share your unique referral code with friends and family', icon: 'share-social-outline' as const },
    { label: 'Friend signs up', desc: 'They register on FR3SH using your code', icon: 'phone-portrait-outline' as const },
    { label: 'First order placed', desc: 'Your friend completes their first order', icon: 'cart-outline' as const },
    { label: 'Both get ₹100', desc: 'You and your friend both receive ₹100 wallet credit', icon: 'wallet-outline' as const },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Ionicons name="gift-outline" size={56} color={Colors.white} />
          <Text style={styles.heroTitle}>Earn ₹100 per referral</Text>
          <Text style={styles.heroSub}>
            Invite friends to FR3SH. When they place their first order, you both get ₹100 wallet credit — instantly!
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: String(stats?.totalReferrals ?? 0), lbl: 'Friends Referred' },
            { val: `₹${stats?.totalEarned ?? stats?.rewardsCredited ?? 0}`, lbl: 'Earned So Far' },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, i > 0 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Referral code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabelTxt}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={Colors.foregroundHeading} />
              <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={share}>
              <Ionicons name="share-social-outline" size={16} color={Colors.primaryForeground} />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepCircle}>
                <Ionicons name={s.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {stats?.referralCode && (
          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Your Referral Stats</Text>
            <View style={styles.referralRow}>
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>{stats.totalReferrals} friends referred</Text>
                <Text style={styles.referralDate}>₹{stats.totalEarned ?? stats.rewardsCredited ?? 0} total earned</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },

  hero: { backgroundColor: Colors.primary, padding: 24, alignItems: 'center', gap: 8, paddingTop: 8 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },

  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },
  statLbl: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },

  codeCard: {
    backgroundColor: Colors.surfaceCard, margin: 16, borderRadius: BorderRadius.xl,
    padding: 20, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  codeLabelTxt: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundMuted },
  codeBox: {
    backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.md,
    paddingHorizontal: 24, paddingVertical: 14,
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
  },
  codeText: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: 3 },
  codeActions: { flexDirection: 'row', gap: 10, width: '100%' },
  copyBtn: {
    flex: 1, flexDirection: 'row', gap: 6, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  shareBtn: {
    flex: 1, flexDirection: 'row', gap: 6, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center', ...Shadow.lg,
  },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryForeground },

  section: {
    backgroundColor: Colors.surfaceCard, padding: 16, marginTop: 10,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, gap: 12,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },

  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: 2 },
  stepLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  stepDesc: { fontSize: FontSize.xs, color: Colors.foregroundMuted, lineHeight: 17 },

  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  referralAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
  },
  referralAvatarText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  referralInfo: { flex: 1 },
  referralName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  referralDate: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  referralStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  referralStatusDone: { backgroundColor: Colors.statusSuccessSurface },
  referralStatusPending: { backgroundColor: Colors.statusWarningSurface },
  referralStatusText: { fontSize: FontSize.xs, fontWeight: '700' },
  referralStatusTextDone: { color: Colors.statusSuccess },
  referralStatusTextPending: { color: Colors.statusWarning },
});
