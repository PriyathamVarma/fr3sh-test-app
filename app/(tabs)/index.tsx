import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Animated, StatusBar, FlatList, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { CATEGORIES } from '@/constants/data';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { farmersApi, productsApi, FarmerProfile, ProductDetail } from '@/services/api';

const { width } = Dimensions.get('window');
const BANNER_W = width - 32;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<string, IoniconName> = {
  Groceries: 'basket-outline',
  Fruits: 'nutrition-outline',
  Vegetables: 'leaf-outline',
  Dairy: 'water-outline',
  Grains: 'grid-outline',
  Spices: 'flame-outline',
};

const BANNERS = [
  {
    id: '1',
    label: 'HARVEST SEASON',
    title: 'From Farm to\nYour Table',
    subtitle: 'Direct from listed FR3SH farmers',
    icon: 'leaf-outline' as IoniconName,
    bg: Colors.primary,
    accent: Colors.secondary,
  },
  {
    id: '2',
    label: 'FARM FRESH',
    title: 'Fresh Organic\nProduce',
    subtitle: 'Browse natural and organic listings',
    icon: 'nutrition-outline' as IoniconName,
    bg: '#047857',
    accent: '#d9f99d',
  },
  {
    id: '3',
    label: 'PRE-BOOK NOW',
    title: 'Upcoming\nHarvests',
    subtitle: 'Reserve before they sell out',
    icon: 'calendar-outline' as IoniconName,
    bg: '#022c22',
    accent: '#bef264',
  },
];

const QUICK_ACTIONS = [
  { label: 'Farmers', icon: 'people-outline' as IoniconName, route: '/farmer-list', bg: '#eff6e8' },
  { label: 'Harvests', icon: 'leaf-outline' as IoniconName, route: '/harvest-list', bg: '#fefce8' },
  { label: 'Community', icon: 'chatbubbles-outline' as IoniconName, route: '/community', bg: '#f0f9ff' },
];

const TRUST_BADGES = [
  { icon: 'shield-checkmark-outline' as IoniconName, label: 'Listed\nFarmers' },
  { icon: 'leaf-outline' as IoniconName, label: 'Organic\nOptions' },
  { icon: 'home-outline' as IoniconName, label: 'Farm\nDirect' },
  { icon: 'snow-outline' as IoniconName, label: 'Fresh\nDelivery' },
];

function farmerId(farmer: FarmerProfile) {
  return farmer.id || farmer._id;
}

function farmerLocation(farmer: FarmerProfile) {
  return [farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ');
}

function farmerCrops(farmer: FarmerProfile) {
  return [
    farmer.category,
    ...(farmer.subCategories ?? []),
    ...(farmer.seasonalCrops ?? []),
    ...(farmer.perennialCrops ?? []),
  ].filter((crop): crop is string => Boolean(crop)).slice(0, 2).join(' • ');
}

function farmerImage(farmer: FarmerProfile) {
  return farmer.avatar || farmer.photo || farmer.photoPath || farmer.farmImages?.[0];
}

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [spotlightFarmers, setSpotlightFarmers] = useState<FarmerProfile[]>([]);
  const [farmerTotal, setFarmerTotal] = useState(0);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { totalItems } = useCart();
  const { user } = useUser();
  const bannerRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const farmerCountLabel = useMemo(() => {
    if (farmerTotal > 0) return `${farmerTotal} farmers`;
    if (spotlightFarmers.length > 0) return `${spotlightFarmers.length} farmers`;
    return 'Farmers';
  }, [farmerTotal, spotlightFarmers.length]);
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'there';

  // Auto-advance banner
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBannerIndex(prev => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (BANNER_W + 12), animated: true });
        return next;
      });
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFarmers() {
      try {
        const res = await farmersApi.list({ page: 1, limit: 8, sort: 'rating_desc' });
        if (cancelled) return;
        setSpotlightFarmers(res.data.items ?? []);
        setFarmerTotal(res.data.meta?.total ?? res.data.items?.length ?? 0);
      } catch {
        if (!cancelled) {
          setSpotlightFarmers([]);
          setFarmerTotal(0);
        }
      }
    }

    loadFarmers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      setProductsLoading(true);
      try {
        const res = await productsApi.list({ limit: 20 });
        if (!cancelled) setProducts(res.data.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceCard} />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.locationBlock}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.locationGreeting}>
                  {user ? `${greeting()}, ${firstName}` : 'Delivering to'}
                </Text>
                <TouchableOpacity style={styles.locationRow}>
                  <Text style={styles.locationValue}>Set delivery location</Text>
                  <Text style={styles.locationChevron}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/(tabs)/cart')}>
              <Ionicons name="cart-outline" size={22} color={Colors.primary} />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Trust strip */}
          <View style={styles.trustStrip}>
            <Ionicons name="leaf-outline" size={14} color={Colors.primary} />
              <Text style={styles.trustText}>
                <Text style={styles.trustBold}>{farmerCountLabel}</Text>
              {' '}• Direct from farm • Fresh listings
              </Text>
          </View>
        </View>

        {/* ─── Sticky Search ───────────────────────────────────────────────── */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={16} color={Colors.foregroundMuted} />
            <Text style={styles.searchPlaceholder}>Search for fresh produce, farmers...</Text>
            <View style={styles.searchTag}>
              <Text style={styles.searchTagText}>FR3SH</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Banner Carousel ─────────────────────────────────────────────── */}
        <View style={{ marginTop: 16 }}>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_W + 12}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) =>
              setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12)))
            }
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {BANNERS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.banner, { backgroundColor: b.bg, width: BANNER_W }]}
                activeOpacity={0.95}
              >
                <View style={styles.bannerLeft}>
                  <View style={[styles.bannerLabel, { backgroundColor: b.accent }]}>
                    <Text style={[styles.bannerLabelText, { color: b.bg }]}>{b.label}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSub}>{b.subtitle}</Text>
                  <View style={styles.bannerCTA}>
                    <Text style={[styles.bannerCTAText, { color: b.accent }]}>Explore →</Text>
                  </View>
                </View>
                <Ionicons name={b.icon} size={62} color={b.accent} style={styles.bannerIcon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ─── Trust Badges ────────────────────────────────────────────────── */}
        <View style={styles.trustRow}>
          {TRUST_BADGES.map((b, i) => (
            <View key={i} style={styles.trustBadge}>
              <Ionicons name={b.icon} size={22} color={Colors.primary} />
              <Text style={styles.trustBadgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── Quick Actions ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore FR3SH</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickCard, { backgroundColor: a.bg }]}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.85}
              >
                <Ionicons name={a.icon} size={28} color={Colors.primary} />
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Categories ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <TouchableOpacity
              style={[styles.catChip, !selectedCategory && styles.catChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Ionicons name="apps-outline" size={15} color={!selectedCategory ? Colors.primaryForeground : Colors.primary} />
              <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  selectedCategory === cat.name && styles.catChipActive,
                  { backgroundColor: selectedCategory === cat.name ? Colors.primary : cat.color },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat.name] ?? 'leaf-outline'}
                  size={15}
                  color={selectedCategory === cat.name ? Colors.primaryForeground : Colors.primary}
                />
                <Text style={[styles.catText, selectedCategory === cat.name && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Hot Deals ───────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Deals</Text>
            <TouchableOpacity onPress={() => router.push('/product-listing')}>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
          >
            {productsLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginLeft: 16 }} />
            ) : filteredProducts.slice(0, 5).map((p) => {
              const img = p.images?.[0] ?? p.image;
              return (
              <TouchableOpacity
                key={p._id}
                style={styles.dealCard}
                onPress={() => router.push({ pathname: '/product-detail', params: { id: p._id } })}
                activeOpacity={0.92}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.dealImage} />
                ) : (
                  <View style={[styles.dealImage, styles.dealImagePlaceholder]}>
                    <Ionicons name="leaf-outline" size={32} color={Colors.primary} />
                  </View>
                )}
                {p.badge && (
                  <View style={styles.dealTag}>
                    <Text style={styles.dealTagText}>{p.badge}</Text>
                  </View>
                )}
                <View style={styles.dealInfo}>
                  <Text style={styles.dealName} numberOfLines={1}>{p.name}</Text>
                  <View style={styles.dealPriceRow}>
                    <Text style={styles.dealPrice}>₹{p.price}</Text>
                    {p.mrp && p.mrp > (p.price ?? 0) && (
                      <Text style={styles.dealOriginal}>₹{p.mrp}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Farmer Spotlight ────────────────────────────────────────────── */}
        <View style={styles.farmerSpotlight}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.primaryForeground }]}>Farmer Spotlight</Text>
            <TouchableOpacity onPress={() => router.push('/farmer-list')}>
              <Text style={[styles.seeAll, { color: Colors.secondary }]}>Meet farmers</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.spotlightSub}>
            Every product has a story. Know your farmer.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}>
            {spotlightFarmers.length === 0 ? (
              <TouchableOpacity
                style={styles.farmerCard}
                onPress={() => router.push('/farmer-list')}
                activeOpacity={0.9}
              >
                <View style={styles.farmerAvatarBg}>
                  <Text style={styles.farmerInitial}>F</Text>
                </View>
                <Text style={styles.farmerName}>Browse farmers</Text>
                <Text style={styles.farmerDistrict}>Connect the backend</Text>
                <Text style={styles.farmerCrops} numberOfLines={1}>Verified profiles</Text>
              </TouchableOpacity>
            ) : spotlightFarmers.map((f) => {
              const image = farmerImage(f);
              return (
              <TouchableOpacity
                key={farmerId(f)}
                style={styles.farmerCard}
                onPress={() => router.push({ pathname: '/farmer-profile', params: { id: farmerId(f) } })}
                activeOpacity={0.9}
              >
                <View style={styles.farmerAvatarBg}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.farmerAvatarImage} />
                  ) : (
                    <Text style={styles.farmerInitial}>{f.name?.[0] ?? 'F'}</Text>
                  )}
                </View>
                <Text style={styles.farmerName}>{f.name}</Text>
                <Text style={styles.farmerDistrict} numberOfLines={1}>{farmerLocation(f) || 'Location pending'}</Text>
                <Text style={styles.farmerCrops} numberOfLines={1}>{farmerCrops(f) || f.farmName || 'Farm profile'}</Text>
                <View style={styles.farmerRating}>
                  <Ionicons name="star" size={12} color={Colors.secondary} />
                  <Text style={styles.farmerRatingVal}>{f.rating ? f.rating.toFixed(1) : 'New'}</Text>
                </View>
              </TouchableOpacity>
            );})}
          </ScrollView>
        </View>

        {/* ─── All Products Grid ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{selectedCategory ?? 'Fresh Picks'}</Text>
            <TouchableOpacity onPress={() => router.push('/product-listing')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {productsLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
            ) : filteredProducts.slice(0, 6).map((p) => {
              const img = p.images?.[0] ?? p.image;
              return (
              <TouchableOpacity
                key={p._id}
                style={styles.gridCard}
                onPress={() => router.push({ pathname: '/product-detail', params: { id: p._id } })}
                activeOpacity={0.92}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.gridImage} />
                ) : (
                  <View style={[styles.gridImage, styles.dealImagePlaceholder]}>
                    <Ionicons name="leaf-outline" size={28} color={Colors.primary} />
                  </View>
                )}
                {p.isOrganic && (
                  <View style={styles.vegDot}>
                    <View style={styles.vegInner} />
                  </View>
                )}
                <View style={styles.gridInfo}>
                  <Text style={styles.gridName} numberOfLines={2}>{p.name}</Text>
                  <View style={styles.gridBottom}>
                    <View>
                      <Text style={styles.gridPrice}>₹{p.price}</Text>
                      {p.mrp && p.mrp > (p.price ?? 0) && (
                        <Text style={styles.gridOriginal}>₹{p.mrp}</Text>
                      )}
                    </View>
                    {p.rating ? (
                      <View style={styles.gridRating}>
                        <Ionicons name="star" size={11} color={Colors.warning} />
                        <Text style={styles.ratingVal}>{p.rating}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Harvest Pre-booking CTA ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.harvestCTA}
          onPress={() => router.push('/harvest-list')}
          activeOpacity={0.9}
        >
          <View style={styles.harvestCTALeft}>
            <Text style={styles.harvestCTABadge}>NEW</Text>
            <Text style={styles.harvestCTATitle}>Pre-book Upcoming Harvests</Text>
            <Text style={styles.harvestCTASub}>
              Reserve fresh produce before it's harvested. Get the freshest possible food.
            </Text>
            <View style={styles.harvestCTABtn}>
              <Text style={styles.harvestCTABtnText}>Explore Harvests →</Text>
            </View>
          </View>
          <Ionicons name="leaf-outline" size={58} color={Colors.secondary} style={styles.harvestCTAIcon} />
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ─── Floating Cart Bar ───────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => router.push('/(tabs)/cart')}
          activeOpacity={0.92}
        >
          <View style={styles.floatingLeft}>
            <View style={styles.floatingBadge}>
              <Text style={styles.floatingCount}>{totalItems}</Text>
            </View>
            <Text style={styles.floatingText}>View Cart</Text>
          </View>
          <Text style={styles.floatingArrow}>View →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  // Header
  header: { backgroundColor: Colors.surfaceCard, paddingBottom: 10 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10,
  },
  locationBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationGreeting: { fontSize: FontSize.xs, color: Colors.foregroundMuted, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  locationChevron: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  cartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.statusDanger,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },

  trustStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, backgroundColor: Colors.surface,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md,
  },
  trustText: { fontSize: FontSize.xs, color: Colors.foregroundBody },
  trustBold: { fontWeight: '700', color: Colors.primary },

  // Search
  searchWrapper: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, gap: 10, height: 46,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchPlaceholder: { flex: 1, fontSize: FontSize.sm, color: Colors.foregroundMuted },
  searchTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  searchTagText: { color: Colors.primaryForeground, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  // Banners
  banner: {
    borderRadius: BorderRadius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', height: 140, overflow: 'hidden',
  },
  bannerLeft: { flex: 1 },
  bannerLabel: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full, marginBottom: 8,
  },
  bannerLabelText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, lineHeight: 26 },
  bannerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  bannerCTA: { marginTop: 10 },
  bannerCTAText: { fontSize: FontSize.sm, fontWeight: '800' },
  bannerIcon: { marginLeft: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 20, backgroundColor: Colors.primary },

  // Trust badges
  trustRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    marginTop: 20, gap: 8,
  },
  trustBadge: {
    flex: 1, backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.md, padding: 10,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  trustBadgeLabel: { fontSize: 9, fontWeight: '600', color: Colors.foregroundBody, textAlign: 'center', lineHeight: 13 },

  // Section
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  // Quick actions
  quickGrid: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10,
  },
  quickCard: {
    flex: 1, borderRadius: BorderRadius.lg,
    paddingVertical: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickLabel: { fontSize: 11, fontWeight: '700', color: Colors.foregroundHeading },

  // Categories
  catScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundBody },
  catTextActive: { color: Colors.primaryForeground },

  // Deal cards
  dealCard: {
    width: 148, backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  dealImage: { width: '100%', height: 110, resizeMode: 'cover' },
  dealImagePlaceholder: { backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  dealBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.statusDanger,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  dealBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  dealTag: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  dealTagText: { color: Colors.foregroundHeading, fontSize: 9, fontWeight: '700' },
  dealInfo: { padding: 10 },
  dealDelivery: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  dealName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading, marginTop: 2 },
  dealPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dealPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  dealOriginal: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textDecorationLine: 'line-through' },

  // Farmer spotlight
  farmerSpotlight: {
    backgroundColor: Colors.primary,
    marginTop: 24, paddingTop: 20, paddingBottom: 20,
  },
  spotlightSub: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16, marginTop: -6, marginBottom: 14,
  },
  farmerCard: {
    width: 140, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  farmerAvatarBg: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    overflow: 'hidden',
  },
  farmerAvatarImage: { width: 56, height: 56, resizeMode: 'cover' },
  farmerInitial: { fontSize: 24, color: Colors.secondary, fontWeight: '900' },
  farmerName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  farmerDistrict: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },
  farmerCrops: { fontSize: 10, color: Colors.secondary, marginTop: 4, textAlign: 'center' },
  farmerRating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  farmerRatingVal: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.secondary },

  // Product grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  gridCard: {
    width: (width - 40) / 2, backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  gridImage: { width: '100%', height: 130, resizeMode: 'cover' },
  vegDot: {
    position: 'absolute', top: 8, right: 8,
    width: 16, height: 16, borderRadius: 2,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.statusSuccess,
  },
  vegInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusSuccess },
  gridInfo: { padding: 10 },
  gridName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  gridBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginTop: 6,
  },
  gridPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  gridOriginal: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textDecorationLine: 'line-through' },
  gridRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingVal: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundMuted },

  // Harvest CTA
  harvestCTA: {
    marginHorizontal: 16, marginTop: 24,
    backgroundColor: Colors.foregroundHeading,
    borderRadius: BorderRadius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', overflow: 'hidden',
  },
  harvestCTALeft: { flex: 1 },
  harvestCTABadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full,
    fontSize: 9, fontWeight: '800', color: Colors.foregroundHeading, marginBottom: 8,
    overflow: 'hidden',
  },
  harvestCTATitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.white, lineHeight: 22 },
  harvestCTASub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 17 },
  harvestCTABtn: {
    marginTop: 12, alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full,
  },
  harvestCTABtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  harvestCTAIcon: { marginLeft: 8 },

  // Floating cart
  floatingCart: {
    position: 'absolute', bottom: 90, left: 16, right: 16,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl, paddingHorizontal: 20, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadow.lg,
  },
  floatingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floatingBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCount: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  floatingText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  floatingArrow: { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '800' },
});
