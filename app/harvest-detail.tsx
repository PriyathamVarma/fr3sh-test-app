import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { harvestsApi, Harvest } from '@/services/api';
import { useUser } from '@/context/UserContext';

function daysUntil(dateStr: string) {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export default function HarvestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await harvestsApi.detail(id);
        setHarvest(res.data);
      } catch (err: any) {
        setError(err.message ?? 'Could not load this harvest. Please try again.');
        setHarvest(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePreBook = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to pre-book a harvest.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    if (qty < 1) { Alert.alert('Invalid Quantity', 'Please select at least 1 unit.'); return; }

    setBooking(true);
    try {
      await harvestsApi.prebook(id, {
        qty,
        buyerId: user.id,
        estimatedTotal: qty * (harvest?.pricePerUnit ?? 0),
      });
      setBooked(true);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message ?? 'Could not complete pre-booking. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (error || !harvest) {
    return (
      <View style={styles.loader}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.statusDanger} />
        <Text style={styles.errorTitle}>Harvest unavailable</Text>
        <Text style={styles.errorSub}>{error ?? 'This harvest was not returned by the API.'}</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const days = daysUntil(harvest.harvestDate);
  const pct = Math.min(100, Math.round((harvest.totalPreBooked / harvest.expectedQty) * 100));
  const remaining = harvest.expectedQty - harvest.totalPreBooked;
  const isFull = harvest.status === 'fully_booked' || remaining <= 0;
  const estimatedTotal = qty * harvest.pricePerUnit;

  if (booked) {
    return (
      <View style={styles.successScreen}>
        <Ionicons name="checkmark-circle-outline" size={64} color={Colors.primary} />
        <Text style={styles.successTitle}>Pre-booking Confirmed!</Text>
        <Text style={styles.successSub}>
          You've reserved <Text style={styles.bold}>{qty} {harvest.unit}</Text> of{' '}
          <Text style={styles.bold}>{harvest.crop}</Text> from{' '}
          <Text style={styles.bold}>{harvest.farmerName}</Text>.
        </Text>
        <Text style={styles.successSub}>
          You'll receive a notification when your order is ready for delivery (est.{' '}
          {new Date(harvest.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}).
        </Text>
        <View style={styles.successTotal}>
          <Text style={styles.successTotalLabel}>Estimated Total</Text>
          <Text style={styles.successTotalValue}>₹{estimatedTotal}</Text>
        </View>
        <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.successBtnText}>Back to Home →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.successSecBtn} onPress={() => router.push('/prebookings')}>
          <Text style={styles.successSecBtnText}>View My Pre-bookings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Ionicons name="leaf-outline" size={56} color={Colors.secondary} />
            <View style={[styles.statusPill, isFull ? styles.statusFull : styles.statusOpen]}>
              <Text style={styles.statusText}>{isFull ? 'Fully Booked' : `${days} days until harvest`}</Text>
            </View>
            <Text style={styles.heroCrop}>{harvest.crop}</Text>
            <Text style={styles.heroFarmer}>by {harvest.farmerName} • {harvest.location}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>₹{harvest.pricePerUnit}</Text>
            <Text style={styles.statLbl}>per {harvest.unit}</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statVal}>{harvest.expectedQty}</Text>
            <Text style={styles.statLbl}>total {harvest.unit}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{remaining}</Text>
            <Text style={styles.statLbl}>available</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Pre-booking Progress</Text>
            <Text style={styles.progressPct}>{pct}% reserved</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${pct}%` as any },
              isFull && styles.progressFillFull,
            ]} />
          </View>
          <Text style={styles.progressNote}>
            {isFull
              ? 'This harvest is fully booked. Join the waitlist for next season.'
              : `${remaining} ${harvest.unit} remaining out of ${harvest.expectedQty} ${harvest.unit}`
            }
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Harvest</Text>
          <Text style={styles.desc}>{harvest.description}</Text>
        </View>

        {/* Harvest timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harvest Timeline</Text>
          {[
            { step: '1', label: 'Pre-book now', sub: 'Reserve your quantity', done: true },
            { step: '2', label: 'Farmer harvests', sub: `Est. ${new Date(harvest.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, done: false },
            { step: '3', label: 'Processing & packing', sub: '24-48 hours after harvest', done: false },
            { step: '4', label: 'Delivery to you', sub: 'Within 2 days of harvest', done: false },
          ].map((t, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={[styles.timelineDot, t.done && styles.timelineDotDone]}>
                <Text style={styles.timelineDotText}>{t.done ? '✓' : t.step}</Text>
              </View>
              {i < 3 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, t.done && styles.timelineLabelDone]}>{t.label}</Text>
                <Text style={styles.timelineSub}>{t.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {[
            { icon: 'shield-checkmark-outline' as const, text: 'Verified farmer' },
            { icon: 'leaf-outline' as const, text: 'Pesticide-free' },
            { icon: 'snow-outline' as const, text: 'Cold-chain delivery' },
          ].map((t, i) => (
            <View key={i} style={styles.trustBadge}>
              <Ionicons name={t.icon} size={18} color={Colors.primary} />
              <Text style={styles.trustText}>{t.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky pre-book CTA */}
      {!isFull && (
        <View style={styles.stickyBar}>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity ({harvest.unit})</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={String(qty)}
                onChangeText={(v) => setQty(Math.max(1, Math.min(remaining, parseInt(v) || 1)))}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(q => Math.min(remaining, q + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.preBookBtn, booking && styles.preBookBtnDisabled]}
            onPress={handlePreBook}
            disabled={booking}
            activeOpacity={0.9}
          >
            {booking ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <View style={styles.preBookBtnInner}>
                <Text style={styles.preBookTotal}>₹{estimatedTotal}</Text>
                <Text style={styles.preBookBtnText}>Pre-book Now →</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading, marginTop: 12 },
  errorSub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', marginTop: 6, paddingHorizontal: 24 },
  errorBtn: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 18 },
  errorBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.sm },

  hero: { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 24 },
  backBtn: {
    position: 'absolute', top: 52, left: 16, zIndex: 1,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: Colors.white },
  heroContent: { alignItems: 'center', paddingTop: 20, gap: 8 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: BorderRadius.full },
  statusOpen: { backgroundColor: Colors.secondarySubtle },
  statusFull: { backgroundColor: Colors.statusWarningSurface },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundHeading },
  heroCrop: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  heroFarmer: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },

  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading },
  statLbl: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },

  progressCard: {
    backgroundColor: Colors.surfaceCard, padding: 16,
    borderBottomWidth: 1, borderTopWidth: 1, borderColor: Colors.border, marginTop: 10,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  progressPct: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primary },
  progressBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progressFillFull: { backgroundColor: Colors.statusWarning },
  progressNote: { fontSize: FontSize.xs, color: Colors.foregroundMuted },

  section: {
    backgroundColor: Colors.surfaceCard, padding: 16, marginTop: 10,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, gap: 10,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  desc: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 22 },

  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, position: 'relative' },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotDone: { backgroundColor: Colors.primary },
  timelineDotText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  timelineLine: {
    position: 'absolute', left: 13, top: 28, width: 2, height: 32,
    backgroundColor: Colors.border,
  },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  timelineLabelDone: { color: Colors.primary },
  timelineSub: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },

  trustRow: {
    flexDirection: 'row', backgroundColor: Colors.secondarySubtle,
    padding: 14, marginTop: 10, gap: 0,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.secondary,
  },
  trustBadge: { flex: 1, alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10, fontWeight: '600', color: Colors.foregroundHeading, textAlign: 'center' },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 16, paddingBottom: 28, gap: 12,
    ...Shadow.md,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  qtyBtn: { padding: 10, paddingHorizontal: 14 },
  qtyBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  qtyInput: {
    fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading,
    textAlign: 'center', minWidth: 48, padding: 8,
  },
  preBookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, paddingVertical: 15, alignItems: 'center',
    ...Shadow.lg,
  },
  preBookBtnDisabled: { opacity: 0.6 },
  preBookBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preBookTotal: {
    color: Colors.secondary, fontWeight: '900', fontSize: FontSize.md,
    paddingRight: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.3)',
  },
  preBookBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },

  successScreen: {
    flex: 1, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12,
  },
  successTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.foregroundHeading, textAlign: 'center' },
  successSub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', lineHeight: 20 },
  bold: { fontWeight: '700', color: Colors.foregroundBody },
  successTotal: {
    backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.lg,
    padding: 16, alignItems: 'center', width: '100%', marginTop: 8,
  },
  successTotalLabel: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  successTotalValue: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.primary },
  successBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 15, paddingHorizontal: 32, width: '100%', alignItems: 'center', ...Shadow.lg,
  },
  successBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },
  successSecBtn: { padding: 12 },
  successSecBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
