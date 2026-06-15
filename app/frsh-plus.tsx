import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { subscriptionApi } from '@/services/api';

const PERKS = [
  { icon: 'car-outline' as const, title: 'Free Delivery on All Orders', desc: 'No more ₹29 delivery fee — ever' },
  { icon: 'flash-outline' as const, title: 'Priority Processing', desc: 'Your orders get packed & shipped first' },
  { icon: 'leaf-outline' as const, title: 'Exclusive Harvest Access', desc: 'Pre-book harvests 48h before public listing' },
  { icon: 'wallet-outline' as const, title: '5% Extra Wallet Cashback', desc: 'On top of existing wallet rewards' },
  { icon: 'chatbubbles-outline' as const, title: 'Community Order Leader', desc: 'Create unlimited community groups' },
  { icon: 'gift-outline' as const, title: 'Monthly Surprise Box', desc: 'Curated seasonal produce from top farmers' },
];

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: 199, period: 'month', badge: null, saving: null },
  { id: 'annual', label: 'Annual', price: 1499, period: 'year', badge: 'BEST VALUE', saving: '₹889 saved' },
];

export default function FRSHPlusScreen() {
  const { user } = useUser();
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const isSubscribed = user?.isSubscribed;

  const subscribe = async () => {
    if (!user) { router.push('/(auth)/login'); return; }
    setLoading(true);
    try {
      await subscriptionApi.subscribe({ plan: selected, userId: user.id });
      Alert.alert('Welcome to FR3SH Plus', 'Your subscription is now active. Enjoy all the benefits!', [
        { text: 'Start Exploring', onPress: () => router.push('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Subscription Failed', e?.message ?? 'Could not activate FR3SH Plus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.foregroundHeading }}>
      <StatusBar barStyle="light-content" />

      {/* Dark green hero */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoGreen}>FR3SH</Text>
          <View style={styles.plusPill}>
            <Text style={styles.plusText}>PLUS</Text>
          </View>
        </View>
        <Text style={styles.heroTagline}>Farm fresh. Priority delivery. Zero fees.</Text>
        {isSubscribed && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>✓ Active Subscriber</Text>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 20, gap: 18 }}>

        {/* Perks grid */}
        <Text style={styles.sectionLabel}>What's Included</Text>
        <View style={styles.perksGrid}>
          {PERKS.map(p => (
            <View key={p.title} style={styles.perkCard}>
              <Ionicons name={p.icon} size={26} color={Colors.primary} style={styles.perkIcon} />
              <Text style={styles.perkTitle}>{p.title}</Text>
              <Text style={styles.perkDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        {!isSubscribed && (
          <>
            <Text style={styles.sectionLabel}>Choose Your Plan</Text>
            <View style={styles.planRow}>
              {PLANS.map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selected === plan.id && styles.planCardActive]}
                  onPress={() => setSelected(plan.id as any)}
                >
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.planLabel, selected === plan.id && styles.planLabelActive]}>{plan.label}</Text>
                  <Text style={[styles.planPrice, selected === plan.id && styles.planPriceActive]}>₹{plan.price}</Text>
                  <Text style={[styles.planPeriod, selected === plan.id && styles.planPeriodActive]}>per {plan.period}</Text>
                  {plan.saving && (
                    <Text style={styles.planSaving}>{plan.saving}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={[styles.subscribeBtn, loading && { opacity: 0.7 }]}
                onPress={subscribe}
                disabled={loading}
              >
                <Text style={styles.subscribeBtnText}>{loading ? 'Processing…' : `Subscribe for ₹${selectedPlan.price}/${selectedPlan.period}`}</Text>
              </TouchableOpacity>
              <Text style={styles.ctaSub}>Cancel anytime • Secure payment</Text>
            </View>
          </>
        )}

        {isSubscribed && (
          <View style={styles.activeCard}>
            <Text style={styles.activeCardTitle}>You're a FR3SH Plus member!</Text>
            <Text style={styles.activeCardSub}>All perks are active on your account. Enjoy priority access to the freshest produce in your region.</Text>
          </View>
        )}

        {/* Trust section */}
        <View style={styles.trustSection}>
          {[
            { icon: 'lock-closed-outline' as const, label: 'Secure Payments' },
            { icon: 'refresh-outline' as const, label: 'Cancel Anytime' },
            { icon: 'call-outline' as const, label: 'Priority Support' },
          ].map(t => (
            <View key={t.label} style={styles.trustItem}>
              <Ionicons name={t.icon} size={15} color={Colors.foregroundMuted} />
              <Text style={styles.trustItemText}>{t.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: Colors.foregroundHeading, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, gap: 10 },
  backBtn: { padding: 4, alignSelf: 'flex-start' },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoGreen: { fontSize: 34, fontWeight: '900', color: Colors.secondary },
  plusPill: { backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  plusText: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.foregroundHeading },
  heroTagline: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', lineHeight: 22 },
  activeBadge: { backgroundColor: Colors.statusSuccessSurface, paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  activeBadgeText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.statusSuccess },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  perksGrid: { gap: 10 },
  perkCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 14, borderWidth: 1, borderColor: Colors.border },
  perkIcon: { marginTop: 2 },
  perkTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  perkDesc: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
  planRow: { flexDirection: 'row', gap: 12 },
  planCard: { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: Colors.border, gap: 4, position: 'relative' },
  planCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  planBadge: { position: 'absolute', top: -10, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  planBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.foregroundHeading },
  planLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  planLabelActive: { color: Colors.primary },
  planPrice: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.foregroundHeading },
  planPriceActive: { color: Colors.primary },
  planPeriod: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  planPeriodActive: { color: Colors.primary },
  planSaving: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.statusSuccess, backgroundColor: Colors.statusSuccessSurface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ctaSection: { gap: 10, alignItems: 'center' },
  subscribeBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: 16, alignItems: 'center', ...Shadow.lg },
  subscribeBtnText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.primaryForeground },
  ctaSub: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  activeCard: { backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  activeCardTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primary },
  activeCardSub: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 20 },
  trustSection: { flexDirection: 'row', justifyContent: 'space-around' },
  trustItem: { alignItems: 'center', gap: 4, flex: 1 },
  trustItemText: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textAlign: 'center' },
});
