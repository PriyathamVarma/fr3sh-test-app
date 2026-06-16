import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { farmersApi, FarmerProfile } from '@/services/api';

type FilterKey = 'All' | 'Verified' | 'Organic' | 'Delivery';
type SortKey = 'Newest' | 'Name' | 'Rating';

const FILTERS: FilterKey[] = ['All', 'Verified', 'Organic', 'Delivery'];
const SORTS: Array<{ label: SortKey; value: string }> = [
  { label: 'Newest', value: 'createdAt_desc' },
  { label: 'Name', value: 'name_asc' },
  { label: 'Rating', value: 'rating_desc' },
];

function farmerId(farmer: FarmerProfile) {
  return farmer.id || farmer._id;
}

function locationFor(farmer: FarmerProfile) {
  return [farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ');
}

function cropsFor(farmer: FarmerProfile) {
  return [
    farmer.category,
    ...(farmer.subCategories ?? []),
    ...(farmer.seasonalCrops ?? []),
    ...(farmer.perennialCrops ?? []),
  ].filter((crop): crop is string => Boolean(crop));
}

function profileImageFor(farmer: FarmerProfile) {
  return farmer.avatar || farmer.photo || farmer.photoPath || farmer.farmImages?.[0];
}

export default function FarmerListScreen() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [place, setPlace] = useState('');
  const [filter, setFilter] = useState<FilterKey>('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await farmersApi.list({
        limit: 50,
        q: search.trim() || undefined,
        place: place.trim() || undefined,
        sort: sort.value,
      });

      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setFarmers(items);
      setTotal(res.data?.meta?.total ?? items.length);
      setSource(res.data?.source);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load farmers from the web app API.');
      setFarmers([]);
      setTotal(0);
      setSource(undefined);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [place, search, sort.value]);

  useEffect(() => {
    const timer = setTimeout(() => load(false), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => {
    return farmers.filter((farmer) => {
      if (filter === 'Verified') return !!farmer.verified || farmer.kycStatus === 'verified';
      if (filter === 'Organic') return !!farmer.organicCertified || cropsFor(farmer).some((crop) => crop.toLowerCase().includes('organic'));
      if (filter === 'Delivery') return !!farmer.delivery;
      return true;
    });
  }, [farmers, filter]);

  const renderFarmer = ({ item }: { item: FarmerProfile }) => {
    const id = farmerId(item);
    const image = profileImageFor(item);
    const crops = cropsFor(item);
    const location = locationFor(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/farmer-profile', params: { id } })}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{item.name?.[0] ?? 'F'}</Text>
            </View>
          )}
          {(item.verified || item.kycStatus === 'verified') && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {item.kycStatus === 'verified' && (
              <View style={styles.kycBadge}>
                <Text style={styles.kycText}>KYC</Text>
              </View>
            )}
          </View>
          {!!item.farmName && <Text style={styles.farmName} numberOfLines={1}>{item.farmName}</Text>}
          <Text style={styles.location} numberOfLines={1}>{location || 'Location pending'}</Text>
          <Text style={styles.bio} numberOfLines={2}>
            {item.about || item.bio || 'No profile bio available.'}
          </Text>

          <View style={styles.metaRow}>
            {!!(item.farmArea || item.totalLandArea) && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{item.farmArea || `${item.totalLandArea} acres`}</Text>
              </View>
            )}
            {!!item.delivery && (
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>Delivery</Text>
              </View>
            )}
            {crops.slice(0, 2).map((crop) => (
              <View key={crop} style={styles.cropChip}>
                <Text style={styles.cropText}>{crop}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>Farmer directory</Text>
          <Text style={styles.headerTitle}>Meet the growers</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading farmers...' : `${filtered.length} shown of ${total} farmers`}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name, farm, crop, district"
            placeholderTextColor={Colors.foregroundMuted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>Place</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Village or district"
            placeholderTextColor={Colors.foregroundMuted}
            value={place}
            onChangeText={setPlace}
            autoCapitalize="words"
          />
          {!!place && (
            <TouchableOpacity onPress={() => setPlace('')}>
              <Text style={styles.clearIcon}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View>
        <FlatList
          horizontal
          data={SORTS}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sortChip, sort.label === item.label && styles.sortChipActive]}
              onPress={() => setSort(item)}
            >
              <Text style={[styles.sortText, sort.label === item.label && styles.sortTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {!!source && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Showing sample farmers because the live farmer data is temporarily unavailable.</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading farmers...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => farmerId(item)}
          renderItem={renderFarmer}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{error ? 'Could not load farmers' : 'No farmers found'}</Text>
              <Text style={styles.emptySub}>
                {error || 'Try changing the search, place, filter, or sort.'}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => load(false)}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerCopy: { flex: 1 },
  headerEyebrow: { fontSize: 10, fontWeight: '800', color: Colors.secondary, textTransform: 'uppercase' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginTop: 2 },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.76)', marginTop: 3 },

  controls: {
    backgroundColor: Colors.surfaceCard,
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    gap: 8,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 11, fontWeight: '800', color: Colors.primary, width: 44 },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.foregroundHeading },
  clearIcon: { fontSize: 11, color: Colors.foregroundMuted, fontWeight: '700' },

  filterScroll: { paddingHorizontal: 12, paddingTop: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  filterTextActive: { color: Colors.white },

  sortScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f8faf5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.secondarySubtle, borderColor: Colors.secondary },
  sortText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundBody },
  sortTextActive: { color: Colors.secondaryForeground },

  notice: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#fbbf24',
    backgroundColor: Colors.statusWarningSurface,
    padding: 10,
  },
  noticeText: { fontSize: FontSize.xs, color: Colors.statusWarning, fontWeight: '700' },

  list: { padding: 16, paddingTop: 4, paddingBottom: 40 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: 12,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageWrap: { position: 'relative', marginRight: 12 },
  image: { width: 72, height: 82, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryMuted },
  initials: {
    width: 72,
    height: 82,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontSize: 28, color: Colors.primary, fontWeight: '900' },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.statusSuccess,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceCard,
  },
  verifiedIcon: { fontSize: 10, color: Colors.white, fontWeight: '900' },

  cardBody: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading },
  farmName: { fontSize: FontSize.xs, color: Colors.foregroundMuted, fontWeight: '700' },
  kycBadge: {
    backgroundColor: Colors.statusSuccessSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  kycText: { fontSize: 9, fontWeight: '800', color: Colors.statusSuccess },
  location: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  bio: { fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 17, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  metaChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  metaText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  cropChip: {
    backgroundColor: Colors.secondarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  cropText: { fontSize: 10, fontWeight: '800', color: Colors.secondaryForeground },

  chevron: { fontSize: 22, color: Colors.foregroundMuted, alignSelf: 'center', marginLeft: 6 },
  sep: { height: 10 },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: FontSize.sm, color: Colors.foregroundMuted },

  empty: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 24, gap: 10 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.foregroundHeading, textAlign: 'center' },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  retryText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
});
