import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { ordersApi } from '@/services/api';
import { useUser } from '@/context/UserContext';

const STATUS_META: Record<string, { color: string; bg: string }> = {
  pending:   { color: Colors.statusWarning, bg: Colors.statusWarningSurface },
  confirmed: { color: Colors.statusSuccess, bg: Colors.statusSuccessSurface },
  fulfilled: { color: Colors.statusInfo,    bg: Colors.statusInfoSurface    },
  cancelled: { color: Colors.statusDanger,  bg: Colors.statusDangerSurface  },
};

export default function PrebookingsScreen() {
  const { user } = useUser();
  const [prebookings, setPrebookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    ordersApi.prebookings(user.id)
      .then(r => setPrebookings(r.data ?? []))
      .catch(() => setPrebookings([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pre-bookings</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {prebookings.map((pb, i) => {
            const status = pb.status ?? 'pending';
            const meta = STATUS_META[status] ?? STATUS_META.pending;
            return (
              <View key={pb._id ?? i} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cropName}>{pb.crop ?? pb.harvestId?.crop ?? 'Harvest'}</Text>
                  <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.badgeText, { color: meta.color }]}>{status}</Text>
                  </View>
                </View>
                {pb.farmerName && <Text style={styles.farmer}>by {pb.farmerName}</Text>}
                <Text style={styles.detail}>Quantity: {pb.qty} {pb.unit ?? 'units'}</Text>
                {pb.harvestDate && (
                  <Text style={styles.detail}>
                    Harvest: {new Date(pb.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                )}
                <View style={styles.footer}>
                  <Text style={styles.total}>₹{pb.estimatedTotal ?? pb.total ?? 0} estimated</Text>
                </View>
              </View>
            );
          })}
          {prebookings.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
              <Ionicons name="leaf-outline" size={56} color={Colors.foregroundMuted} />
              <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading }}>No pre-bookings yet</Text>
              <TouchableOpacity style={styles.cta} onPress={() => router.push('/harvest-list')}>
                <Text style={styles.ctaText}>Browse Harvests</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cropName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  farmer: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  detail: { fontSize: FontSize.sm, color: Colors.foregroundBody },
  footer: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 4 },
  total: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  cta: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 24, paddingVertical: 12 },
  ctaText: { color: Colors.primaryForeground, fontWeight: '800' },
});
