import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { farmersApi } from '@/services/api';

interface DashboardStats {
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  avgRating?: number;
  pendingOrders?: number;
  activeHarvests?: number;
  recentOrders?: any[];
}

const ORDER_COLORS: Record<string, string> = {
  pending: Colors.statusWarning,
  confirmed: Colors.statusInfo,
  packed: Colors.primary,
  in_transit: Colors.primary,
  delivered: Colors.statusSuccess,
  cancelled: Colors.statusDanger,
};

export default function FarmerDashboardScreen() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.type !== 'Farmer') {
      Alert.alert('Access Denied', 'This dashboard is only for farmers.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      setLoading(false);
      return;
    }
    if (!user?.id) {
      setError('Please sign in again to load your farmer dashboard.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    farmersApi.dashboard(user.id)
      .then(data => {
        if (data?.data) setStats(data.data);
      })
      .catch((err: any) => {
        setStats({});
        setError(err?.message ?? 'Could not load your farmer dashboard.');
      })
      .finally(() => setLoading(false));
  }, [user?.id, user?.type]);

  if (user?.type !== 'Farmer') return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />

      {/* Hero header */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreet}>Farmer Dashboard</Text>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroSub}>Manage your products, harvests, and orders</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={46} color={Colors.statusWarning} />
          <Text style={styles.errorTitle}>Farmer profile not connected</Text>
          <Text style={styles.errorText}>
            {error}
          </Text>
          <Text style={styles.errorHint}>
            Please complete or link your farmer profile on FR3SH web to view products, orders, revenue, and harvest stats here.
          </Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.push('/farmer-list')}>
            <Text style={styles.errorBtnText}>Browse Farmers</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Alert: pending orders */}
        {(stats.pendingOrders ?? 0) > 0 && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => {}}>
            <Ionicons name="warning-outline" size={18} color={Colors.statusWarning} />
            <Text style={styles.alertText}>{stats.pendingOrders} orders need your attention</Text>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="cube-outline" label="Products" value={stats.totalProducts ?? 0} />
          <StatCard icon="cart-outline" label="Orders" value={stats.totalOrders ?? 0} />
          <StatCard icon="cash-outline" label="Revenue" value={`₹${((stats.totalRevenue ?? 0) / 1000).toFixed(1)}k`} />
          <StatCard icon="star-outline" label="Rating" value={(stats.avgRating ?? 0).toFixed(1)} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'leaf-outline' as const, label: 'Add Harvest', route: '/harvest-list' },
            { icon: 'person-outline' as const, label: 'My Profile', route: '/edit-profile' },
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => router.push(a.route as any)}
            >
              <Ionicons name={a.icon} size={26} color={Colors.primary} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent orders from API */}
        {(stats.recentOrders ?? []).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent Orders</Text>
            {(stats.recentOrders ?? []).map((order: any, i: number) => (
              <View key={order._id ?? i} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderId}>{(order._id ?? '').slice(-8).toUpperCase()}</Text>
                  <View style={[styles.statusDot, { backgroundColor: ORDER_COLORS[order.status] ?? Colors.foregroundMuted }]}>
                    <Text style={styles.statusDotText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderBuyer}>{order.customerName ?? order.buyerName ?? 'Buyer'}</Text>
                <View style={styles.orderFoot}>
                  <Text style={styles.orderDate}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ''}</Text>
                  <Text style={styles.orderAmount}>₹{order.total ?? 0}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Active harvests */}
        <Text style={styles.sectionLabel}>Active Harvests ({stats.activeHarvests ?? 0})</Text>
        <TouchableOpacity style={styles.harvestCard} onPress={() => router.push('/harvest-list')}>
          <Text style={styles.harvestText}>View all harvest listings</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
      )}
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string | number }) {
  return (
    <View style={statStyles.card}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  value: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading },
  label: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
});

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 },
  backBtn: { padding: 4, paddingTop: 2 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  heroGreet: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  heroSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.statusWarningSurface, borderRadius: BorderRadius.lg, padding: 12, borderWidth: 1, borderColor: Colors.statusWarning },
  alertText: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.statusWarning },
  alertArrow: { fontSize: 20, color: Colors.statusWarning },
  statsGrid: { flexDirection: 'row', gap: 10 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '46%', flex: 0, backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  actionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  orderCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 4 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.foregroundHeading, fontVariant: ['tabular-nums'] },
  statusDot: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDotText: { fontSize: 10, fontWeight: '800', color: Colors.white, textTransform: 'capitalize' },
  orderBuyer: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  orderItems: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  orderFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  orderDate: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  orderAmount: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading },
  harvestCard: { backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.xl, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  harvestText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  errorTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading, textAlign: 'center' },
  errorText: { fontSize: FontSize.sm, color: Colors.foregroundBody, textAlign: 'center', lineHeight: 20 },
  errorHint: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textAlign: 'center', lineHeight: 18 },
  errorBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 18, paddingVertical: 11 },
  errorBtnText: { color: Colors.primaryForeground, fontSize: FontSize.sm, fontWeight: '800' },
});
