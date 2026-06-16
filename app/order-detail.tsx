import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { ordersApi, Order } from '@/services/api';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending:            { color: Colors.statusWarning, bg: Colors.statusWarningSurface, label: 'Pending' },
  confirmed:          { color: Colors.statusInfo, bg: Colors.statusInfoSurface, label: 'Confirmed' },
  packed:             { color: Colors.statusInfo, bg: Colors.statusInfoSurface, label: 'Packed' },
  picked_up:          { color: Colors.statusInfo, bg: Colors.statusInfoSurface, label: 'Picked Up' },
  in_transit:         { color: Colors.primary, bg: Colors.primaryMuted, label: 'In Transit' },
  out_for_delivery:   { color: Colors.primary, bg: Colors.primaryMuted, label: 'Out for Delivery' },
  delivered:          { color: Colors.statusSuccess, bg: Colors.statusSuccessSurface, label: 'Delivered' },
  cancelled:          { color: Colors.statusDanger, bg: Colors.statusDangerSurface, label: 'Cancelled' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    ordersApi.orderDetail(id as string)
      .then(res => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusMeta = STATUS_META[order.status] ?? STATUS_META.pending;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const orderId = order._id || order.id || String(id ?? '');
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const dateLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date unavailable';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Order #{orderId.slice(-8).toUpperCase()}</Text>
          <Text style={styles.headerSub}>{dateLabel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>

        {/* Delivery timeline */}
        {order.status !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Tracking</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const label = STATUS_META[step]?.label ?? step;
                return (
                  <View key={step} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                        {isDone && !isCurrent && <Text style={styles.dotCheck}>✓</Text>}
                        {isCurrent && <View style={styles.dotPulse} />}
                      </View>
                      {idx < STATUS_STEPS.length - 1 && (
                        <View style={[styles.line, isDone && styles.lineDone]} />
                      )}
                    </View>
                    <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent, isDone && !isCurrent && styles.stepLabelDone]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {(order.items ?? []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name || 'Item'}</Text>
                <Text style={styles.itemQty}>× {item.qty ?? 1}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{Number(item.price ?? 0) * Number(item.qty ?? 1)}</Text>
            </View>
          ))}
        </View>

        {/* Bill */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={{ gap: 6 }}>
            <BillRow label="Items Total" value={`₹${order.subtotal}`} />
            <View style={styles.billDivider} />
            <BillRow label="Total Paid" value={`₹${order.total}`} bold />
          </View>
        </View>

        {/* Delivery address */}
        {order.deliveryAddress ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <Text style={styles.addrLine}>{order.deliveryAddress}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => Linking.openURL(`mailto:support@fr3sh.in?subject=FR3SH%20Order%20Support%20${encodeURIComponent(orderId)}`)}
        >
          <Text style={styles.supportBtnText}>Need Help? Contact Support</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function BillRow({ label, value, green, bold }: { label: string; value: string; green?: boolean; bold?: boolean }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && styles.billBold]}>{label}</Text>
      <Text style={[styles.billValue, bold && styles.billBold, green && { color: Colors.statusSuccess }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white, flex: 1 },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  card: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 10 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  deliveryEst: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  timeline: { gap: 0, marginTop: 4 },
  timelineStep: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', minHeight: 40 },
  timelineLeft: { alignItems: 'center', width: 20 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotCurrent: { backgroundColor: Colors.white, borderColor: Colors.primary, borderWidth: 3 },
  dotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  dotCheck: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 2 },
  lineDone: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: FontSize.sm, color: Colors.foregroundMuted, paddingTop: 1, lineHeight: 18 },
  stepLabelDone: { color: Colors.foregroundBody },
  stepLabelCurrent: { color: Colors.primary, fontWeight: '800' },
  farmerTag: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border },
  itemIcon: { fontSize: 26 },
  itemName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  itemQty: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  itemPrice: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontSize: FontSize.sm, color: Colors.foregroundBody },
  billValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  billBold: { fontWeight: '900', fontSize: FontSize.md },
  billDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  addrName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  addrLine: { fontSize: FontSize.sm, color: Colors.foregroundBody },
  addrPhone: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  supportBtn: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  supportBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
});
