import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { fposApi, FPO } from '@/services/api';

export default function FPOListScreen() {
  const [search, setSearch] = useState('');
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFpos() {
      setLoading(true);
      setError(null);
      try {
        const res = await fposApi.list();
        if (!cancelled) setFpos(res.data?.fpos ?? []);
      } catch (err: any) {
        if (!cancelled) {
          setFpos([]);
          setError(err.message ?? 'FPO API is not available.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFpos();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => fpos.filter(f =>
    !search ||
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase())
  ), [fpos, search]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Farmer Producer Orgs</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading FPOs from MongoDB' : `${filtered.length} FPOs from API`}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color={Colors.foregroundMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FPOs..."
            placeholderTextColor={Colors.foregroundMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={17} color={Colors.primary} />
        <Text style={styles.infoText}>
          FPOs are shown only when the web backend exposes a live MongoDB API for them.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={f => f._id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={error ? 'alert-circle-outline' : 'business-outline'}
                size={56}
                color={error ? Colors.statusDanger : Colors.foregroundMuted}
              />
              <Text style={styles.emptyTitle}>{error ? 'FPO API unavailable' : 'No FPOs found'}</Text>
              <Text style={styles.emptySub}>
                {error ?? 'No FPO records were returned from MongoDB.'}
              </Text>
            </View>
          }
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/fpo-detail', params: { id: f._id } })}
              activeOpacity={0.9}
            >
              <View style={styles.cardTop}>
                <View style={styles.fpoIcon}>
                  <Ionicons name="business-outline" size={27} color={Colors.primary} />
                </View>
                <View style={styles.fpoMeta}>
                  <Text style={styles.fpoName} numberOfLines={2}>{f.name}</Text>
                  <View style={styles.fpoLocRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.foregroundMuted} />
                    <Text style={styles.fpoLoc}>{f.district}, {f.state}</Text>
                  </View>
                  {f.established ? <Text style={styles.fpoEst}>Est. {f.established}</Text> : null}
                </View>
              </View>
              {f.description ? <Text style={styles.fpoDesc} numberOfLines={2}>{f.description}</Text> : null}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{f.farmerCount ?? 0}</Text>
                  <Text style={styles.statLbl}>Farmers</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                  <Text style={styles.statVal}>{f.productCount ?? 0}</Text>
                  <Text style={styles.statLbl}>Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{f.certifications?.length ?? 0}</Text>
                  <Text style={styles.statLbl}>Certifications</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
  searchWrap: { backgroundColor: Colors.surfaceCard, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, paddingHorizontal: 12, gap: 8, height: 42,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.foregroundHeading },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.primaryMuted, padding: 12, marginHorizontal: 16, marginTop: 12,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 17 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
  card: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  fpoIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
  },
  fpoMeta: { flex: 1, gap: 2 },
  fpoName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  fpoLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  fpoLoc: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  fpoEst: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  fpoDesc: { fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 17 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primary },
  statLbl: { fontSize: 10, color: Colors.foregroundMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading, marginTop: 12 },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
