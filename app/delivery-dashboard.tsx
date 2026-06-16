import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { deliveryApi, Order } from '@/services/api';

const STATUS_META: Record<string, { label: string; color: string; bg: string; action: string }> = {
  confirmed:        { label: 'Confirmed', color: Colors.statusInfo, bg: Colors.statusInfoSurface, action: 'Mark Picked Up' },
  packed:           { label: 'Packed', color: Colors.statusWarning, bg: Colors.statusWarningSurface, action: 'Mark Picked Up' },
  picked_up:        { label: 'Picked Up', color: Colors.statusInfo, bg: Colors.statusInfoSurface, action: 'Start Delivery' },
  in_transit:       { label: 'In Transit', color: Colors.primary, bg: Colors.primaryMuted, action: 'Mark Delivered' },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.primary, bg: Colors.primaryMuted, action: 'Mark Delivered' },
  delivered:        { label: 'Delivered', color: Colors.statusSuccess, bg: Colors.statusSuccessSurface, action: '' },
};

const NEXT_STATUS: Record<string, string> = {
  confirmed: 'picked_up',
  packed: 'picked_up',
  picked_up: 'out_for_delivery',
  in_transit: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export default function DeliveryDashboardScreen() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await deliveryApi.orders({ status: 'all', limit: 50 });
      setOrders(res.data?.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.type !== 'Logistics Provider') {
      Alert.alert('Access Denied', 'This dashboard is only for delivery partners.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    fetchOrders();
  }, [fetchOrders, user?.type]);

  if (user?.type !== 'Logistics Provider') return null;

  const updateStatus = (id: string, current: string) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    const nextMeta = STATUS_META[next];
    Alert.alert('Update Status', `Mark order as "${nextMeta?.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => setOrders(prev => prev.map(o => o._id === id ? { ...o, status: next } : o)) },
    ]);
  };

  const activeCount = orders.filter(o => o.status !== 'delivered').length;
  const deliveredToday = orders.filter(o => o.status === 'delivered').length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />

      <View style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreet}>Delivery Dashboard</Text>
          <Text style={styles.heroName}>{user.name}</Text>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online • Available for pickup</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={Colors.primary} />}
      >
        <View style={styles.countRow}>
          <View style={[styles.countCard, { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted }]}>
            <Text style={styles.countNum}>{activeCount}</Text>
            <Text style={styles.countLabel}>Active Orders</Text>
          </View>
          <View style={[styles.countCard, { borderColor: Colors.statusSuccess, backgroundColor: Colors.statusSuccessSurface }]}>
            <Text style={[styles.countNum, { color: Colors.statusSuccess }]}>{deliveredToday}</Text>
            <Text style={styles.countLabel}>Delivered Today</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Your Orders ({orders.length})</Text>

        {orders.map(order => {
          const meta = STATUS_META[order.status] ?? { label: order.status, color: Colors.foregroundMuted, bg: Colors.border, action: '' };
          const hasAction = !!NEXT_STATUS[order.status];
          const itemSummary = (order.items ?? []).map(i => i.name).join(', ') || 'No items listed';
          const orderKey = order._id || (order as any).id || `${order.status}-${order.total}-${Math.random()}`;
          const orderIdShort = (order._id || (order as any).id || '').toString().slice(-8).toUpperCase() || 'N/A';
          return (
            <View key={orderKey} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>#{orderIdShort}</Text>
                <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              <Text style={styles.address}>{order.deliveryAddress ?? 'No address provided'}</Text>
              <Text style={styles.items} numberOfLines={2}>{itemSummary}</Text>

              <View style={styles.orderFoot}>
                <Text style={styles.total}>₹{order.total}</Text>
                {hasAction ? (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(order._id || (order as any).id, order.status)}>
                    <Text style={styles.actionBtnText}>{meta.action}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.deliveredTag}>
                    <Text style={styles.deliveredTagText}>Delivered</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={60} color={Colors.foregroundMuted} />
            <Text style={styles.emptyTitle}>No orders assigned yet</Text>
            <Text style={styles.emptySub}>Stay online to receive delivery assignments</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 10, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16, alignItems: 'flex-start' },
  backBtn: { padding: 4, paddingTop: 2 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  heroGreet: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  onlineText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  countRow: { flexDirection: 'row', gap: 10 },
  countCard: { flex: 1, borderRadius: BorderRadius.xl, padding: 14, alignItems: 'center', borderWidth: 1.5, gap: 4 },
  countNum: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary },
  countLabel: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  orderCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 14, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 6 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.foregroundHeading },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  address: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 18 },
  items: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  orderFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  total: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primaryForeground },
  deliveredTag: { backgroundColor: Colors.statusSuccessSurface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  deliveredTagText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.statusSuccess },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center' },
});
