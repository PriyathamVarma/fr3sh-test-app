import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { badgesApi, UserBadge } from '@/services/api';
import { useUser } from '@/context/UserContext';

const BADGE_DEFS = [
  { id: 'first_order',       icon: 'cart-outline',          label: 'First Order',        desc: 'Placed your first order on FR3SH'           },
  { id: 'five_orders',       icon: 'star-outline',          label: 'Five Orders',         desc: "Completed 5 orders — you're a regular!"     },
  { id: 'loyal_buyer',       icon: 'heart-outline',         label: 'Loyal Buyer',         desc: 'Placed 10+ orders — true FR3SH fan!'        },
  { id: 'big_spender',       icon: 'wallet-outline',        label: 'Big Spender',         desc: 'Total spend over ₹10,000'                   },
  { id: 'early_adopter',     icon: 'rocket-outline',        label: 'Early Adopter',       desc: 'Joined FR3SH in the first cohort'           },
  { id: 'referral_champion', icon: 'trophy-outline',        label: 'Referral Champion',   desc: 'Referred 3+ friends to FR3SH'               },
  { id: 'harvest_explorer',  icon: 'leaf-outline',          label: 'Harvest Explorer',    desc: 'Pre-booked at least one harvest'            },
  { id: 'community_member',  icon: 'people-outline',        label: 'Community Member',    desc: 'Joined a community buying group'            },
] as const;

type BadgeDef = { id: string; icon: React.ComponentProps<typeof Ionicons>['name']; label: string; desc: string };

export default function BadgesScreen() {
  const { user } = useUser();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    badgesApi.list(user.id).then(r => setUserBadges(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const earnedIds = new Set(userBadges.map(b => b.badgeId));
  const earned = (BADGE_DEFS as readonly BadgeDef[]).filter(b => earnedIds.has(b.id));
  const locked = (BADGE_DEFS as readonly BadgeDef[]).filter(b => !earnedIds.has(b.id));

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Badges</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Badges</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {earned.length} / {BADGE_DEFS.length} badges earned
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(earned.length / BADGE_DEFS.length) * 100}%` as any },
            ]} />
          </View>
          <Text style={styles.progressSub}>
            {locked.length} more badges to unlock. Keep shopping!
          </Text>
        </View>

        {/* Earned */}
        <Text style={styles.sectionLabel}>Earned ({earned.length})</Text>
        <View style={styles.badgeGrid}>
          {earned.length === 0 ? (
            <Text style={{ padding: 16, color: Colors.foregroundMuted }}>No badges earned yet — start shopping!</Text>
          ) : earned.map(b => (
            <View key={b.id} style={styles.badgeCard}>
              <View style={styles.badgeIconWrap}>
                <Ionicons name={b.icon} size={28} color={Colors.primary} />
              </View>
              <Text style={styles.badgeLabel}>{b.label}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
        </View>

        {/* Locked */}
        <Text style={styles.sectionLabel}>Locked ({locked.length})</Text>
        <View style={styles.badgeGrid}>
          {locked.map(b => (
            <View key={b.id} style={[styles.badgeCard, styles.badgeCardLocked]}>
              <View style={styles.badgeIconWrapLocked}>
                <Ionicons name={b.icon} size={28} color={Colors.foregroundMuted} style={{ opacity: 0.35 }} />
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={12} color={Colors.foregroundMuted} />
                </View>
              </View>
              <Text style={[styles.badgeLabel, styles.badgeLabelLocked]}>{b.label}</Text>
              <Text style={[styles.badgeDesc, styles.badgeDescLocked]}>{b.desc}</Text>
            </View>
          ))}
        </View>

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

  progressCard: {
    backgroundColor: Colors.surfaceCard, padding: 20, margin: 16,
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 8,
  },
  progressTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading },
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 4 },
  progressSub: { fontSize: FontSize.sm, color: Colors.foregroundMuted },

  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
  badgeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 8,
  },
  badgeCard: {
    width: '46%', flex: 0,
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  badgeCardLocked: {
    backgroundColor: Colors.surface, borderColor: Colors.border,
  },
  badgeIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.secondary,
  },
  badgeIconWrapLocked: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: Colors.surfaceCard, borderRadius: 10, padding: 2,
  },
  badgeLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading, textAlign: 'center' },
  badgeLabelLocked: { color: Colors.foregroundMuted },
  badgeDesc: { fontSize: 10, color: Colors.foregroundBody, textAlign: 'center', lineHeight: 14 },
  badgeDescLocked: { color: Colors.gray400 },
});
