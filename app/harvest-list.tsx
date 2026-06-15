import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { harvestsApi, Harvest } from '@/services/api';

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function getProgressPct(booked: number, total: number) {
  return Math.min(100, Math.round((booked / total) * 100));
}

const STATUS_FILTERS = ['All', 'Available', 'Upcoming', 'Fully Booked'];

export default function HarvestListScreen() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await harvestsApi.list({ status: 'open' });
      setHarvests(res.data.items ?? []);
    } catch {
      setHarvests([]);
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = harvests.filter(h => {
    if (filter === 'All') return true;
    if (filter === 'Available') return h.status === 'open' && h.totalPreBooked < h.expectedQty;
    if (filter === 'Fully Booked') return h.status === 'fully_booked';
    if (filter === 'Upcoming') return daysUntil(h.harvestDate) > 14;
    return true;
  });

  const renderHarvest = ({ item: h }: { item: Harvest }) => {
    const days = daysUntil(h.harvestDate);
    const pct = getProgressPct(h.totalPreBooked, h.expectedQty);
    const isFull = h.status === 'fully_booked';

    return (
      <TouchableOpacity
        style={[styles.card, isFull && styles.cardFull]}
        onPress={() => router.push({ pathname: '/harvest-detail', params: { id: h._id } })}
        activeOpacity={0.9}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cropIcon}>
            <Ionicons name="leaf-outline" size={26} color={Colors.primary} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cropName}>{h.crop}</Text>
            <Text style={styles.farmerName}>by {h.farmerName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={Colors.foregroundMuted} />
              <Text style={styles.location}>{h.location || 'Location pending'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isFull ? styles.statusFull : styles.statusOpen]}>
            <Text style={[styles.statusText, isFull ? styles.statusTextFull : styles.statusTextOpen]}>
              {isFull ? 'Fully Booked' : `${days}d left`}
            </Text>
          </View>
        </View>

        {/* Description */}
        {h.description && (
          <Text style={styles.desc} numberOfLines={2}>{h.description}</Text>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Pre-booked</Text>
            <Text style={styles.progressValue}>{h.totalPreBooked}/{h.expectedQty} {h.unit}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${pct}%` as any },
              isFull && styles.progressFillFull,
            ]} />
          </View>
          <Text style={styles.progressPct}>{pct}% reserved</Text>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>₹{h.pricePerUnit}/{h.unit}</Text>
          </View>
          <View>
            <Text style={styles.harvestDateLabel}>Harvest date</Text>
            <Text style={styles.harvestDate}>
              {new Date(h.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          {!isFull && (
            <View style={styles.preBookBtn}>
              <Text style={styles.preBookBtnText}>Pre-book →</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Harvest Pre-bookings</Text>
          <Text style={styles.headerSub}>Reserve fresh produce before it's harvested</Text>
        </View>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={17} color={Colors.primary} />
        <Text style={styles.infoText}>
          Pre-book upcoming harvests to get the freshest produce at the best price. You'll be notified when it's ready.
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
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
          keyExtractor={h => h._id}
          renderItem={renderHarvest}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={56} color={Colors.foregroundMuted} />
              <Text style={styles.emptyTitle}>No harvests found</Text>
              <Text style={styles.emptySub}>Check back soon for upcoming harvests</Text>
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
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.secondarySubtle, padding: 12, marginHorizontal: 16, marginTop: 12,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.secondary,
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 17 },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.foregroundBody },
  filterTextActive: { color: Colors.white },

  list: { padding: 16, paddingTop: 4 },

  card: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 12,
  },
  cardFull: { opacity: 0.75 },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cropIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  cardMeta: { flex: 1, gap: 2 },
  cropName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  farmerName: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  location: { fontSize: FontSize.xs, color: Colors.foregroundMuted },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusOpen: { backgroundColor: Colors.statusSuccessSurface },
  statusFull: { backgroundColor: Colors.statusWarningSurface },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  statusTextOpen: { color: Colors.statusSuccess },
  statusTextFull: { color: Colors.statusWarning },

  desc: { fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 18 },

  progressSection: { gap: 5 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.xs, color: Colors.foregroundMuted, fontWeight: '600' },
  progressValue: { fontSize: FontSize.xs, color: Colors.foregroundBody, fontWeight: '700' },
  progressBar: {
    height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 3,
  },
  progressFillFull: { backgroundColor: Colors.statusWarning },
  progressPct: { fontSize: 10, color: Colors.foregroundMuted },

  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  priceLabel: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  price: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  harvestDateLabel: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  harvestDate: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  preBookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.md,
  },
  preBookBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.sm },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
});
