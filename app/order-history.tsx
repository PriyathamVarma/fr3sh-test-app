import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { ordersApi, Order } from '@/services/api';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: Colors.statusWarning, bg: Colors.statusWarningSurface },
  confirmed: { label: 'Confirmed', color: Colors.statusInfo, bg: Colors.statusInfoSurface },
  packed: { label: 'Packed', color: Colors.statusInfo, bg: Colors.statusInfoSurface },
  picked_up: { label: 'Picked Up', color: Colors.statusInfo, bg: Colors.statusInfoSurface },
  in_transit: { label: 'In Transit', color: Colors.statusInfo, bg: Colors.statusInfoSurface },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.statusInfo, bg: Colors.statusInfoSurface },
  delivered: { label: 'Delivered', color: Colors.statusSuccess, bg: Colors.statusSuccessSurface },
  cancelled: { label: 'Cancelled', color: Colors.statusDanger, bg: Colors.statusDangerSurface },
};

const FILTER_TABS = ['All', 'Active', 'Delivered', 'Cancelled'];

export default function OrderHistoryScreen() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const res = await ordersApi.buyerOrders(user.id);
      setOrders(res.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const filtered = orders.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'Delivered') return o.status === 'delivered';
    if (filter === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const renderOrder = ({ item: o }: { item: Order }) => {
    const meta = STATUS_META[o.status] ?? STATUS_META.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/order-detail', params: { id: o._id } })}
        activeOpacity={0.9}
      >
        <View style={styles.cardTop}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>{o._id.slice(-8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.statusText, { color: meta.color }]}>
                {meta.label}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            {new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.itemsList}>
          {(o.items ?? []).slice(0, 3).map((item, i) => (
            <Text key={i} style={styles.itemText} numberOfLines={1}>
              • {item.name} × {item.qty}
            </Text>
          ))}
          {(o.items?.length ?? 0) > 3 && (
            <Text style={styles.moreItems}>+{(o.items?.length ?? 0) - 3} more items</Text>
          )}
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.total}>₹{o.total}</Text>
          {o.status === 'delivered' ? (
            <TouchableOpacity style={styles.reorderBtn}>
              <Text style={styles.reorderText}>Reorder →</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.trackLink}>Track Order →</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={50} color={Colors.foregroundMuted} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySub}>Your orders will appear here</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
                <Text style={styles.shopBtnText}>Start Shopping →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  filterRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.foregroundMuted },
  filterTabTextActive: { color: Colors.white },

  list: { padding: 16, paddingTop: 12 },

  card: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 10,
  },
  cardTop: { gap: 4 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  orderDate: { fontSize: FontSize.xs, color: Colors.foregroundMuted },

  itemsList: { gap: 3 },
  itemText: { fontSize: FontSize.xs, color: Colors.foregroundBody },
  moreItems: { fontSize: FontSize.xs, color: Colors.foregroundMuted, fontStyle: 'italic' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border },
  total: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading },
  reorderBtn: { backgroundColor: Colors.primaryMuted, paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.md },
  reorderText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  trackLink: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.statusInfo },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  shopBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.sm },
});
