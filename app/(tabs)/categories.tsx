import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { CATEGORIES } from '@/constants/data';
import { productsApi, ProductDetail } from '@/services/api';

const { width } = Dimensions.get('window');
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<string, IoniconName> = {
  'All Products': 'apps-outline',
  Groceries: 'basket-outline',
  Fruits: 'nutrition-outline',
  Vegetables: 'leaf-outline',
  Dairy: 'water-outline',
  Grains: 'grid-outline',
  Spices: 'flame-outline',
};

const COLLECTION_CARDS = [
  { label: 'Organic Certified', icon: 'leaf-outline' as IoniconName, bg: '#f0fdf4', border: '#bbf7d0', tag: 'Organic products' },
  { label: 'Pre-book Harvests', icon: 'calendar-outline' as IoniconName, bg: '#fefce8', border: '#fde68a', tag: 'Reserve early' },
  { label: 'From Your Region', icon: 'location-outline' as IoniconName, bg: '#eff6ff', border: '#bfdbfe', tag: 'Local farms' },
  { label: 'Farm-to-Table Sets', icon: 'basket-outline' as IoniconName, bg: '#fff7ed', border: '#fed7aa', tag: 'Curated boxes' },
];

const EXPLORE_MORE = [
  { icon: 'people-outline' as IoniconName, label: 'Meet Our Farmers', sub: 'Verified farmer profiles', route: '/farmer-list' },
  { icon: 'leaf-outline' as IoniconName, label: 'Harvest Pre-bookings', sub: 'Reserve before harvest', route: '/harvest-list' },
  { icon: 'chatbubbles-outline' as IoniconName, label: 'Community Buying', sub: 'Split orders with your group', route: '/community' },
];

export default function CategoriesScreen() {
  const [active, setActive] = useState('all');
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await productsApi.list({ limit: 100 });
        if (!cancelled) setProducts(res.data.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const allCats = useMemo(() => [
    { id: 'all', name: 'All Products', color: Colors.primaryMuted, count: products.length },
    ...CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      count: products.filter(p => p.category === c.name).length,
    })),
  ], [products]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceCard} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.subtitle}>
          {loading ? 'Loading fresh products...' : `${products.length} fresh products from farmers`}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Featured Collections */}
        <Text style={styles.sectionLabel}>Collections</Text>
        <View style={styles.collectionGrid}>
          {COLLECTION_CARDS.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.collectionCard, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => router.push('/product-listing')}
              activeOpacity={0.85}
            >
              <Ionicons name={c.icon} size={28} color={Colors.primary} style={styles.collectionIcon} />
              <Text style={styles.collectionLabel}>{c.label}</Text>
              <Text style={styles.collectionTag}>{c.tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Browse by Category */}
        <Text style={styles.sectionLabel}>Browse by Category</Text>
        <View style={styles.catGrid}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ margin: 24 }} />
          ) : allCats.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catCard,
                { backgroundColor: cat.color },
                active === cat.id && styles.catCardActive,
              ]}
              onPress={() => {
                setActive(cat.id);
                router.push({
                  pathname: '/product-listing',
                  params: cat.id === 'all' ? {} : { category: cat.name },
                });
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat.name] ?? 'leaf-outline'}
                size={26}
                color={active === cat.id ? Colors.primary : Colors.foregroundHeading}
              />
              <Text style={[styles.catName, active === cat.id && styles.catNameActive]}>
                {cat.name}
              </Text>
              <Text style={[styles.catCount, active === cat.id && styles.catCountActive]}>
                {cat.count} items
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* All FR3SH Features */}
        <Text style={styles.sectionLabel}>Explore More</Text>
        {EXPLORE_MORE.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.exploreRow}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.85}
          >
            <View style={styles.exploreIcon}>
              <Ionicons name={item.icon} size={22} color={Colors.primary} />
            </View>
            <View style={styles.exploreText}>
              <Text style={styles.exploreLabel}>{item.label}</Text>
              <Text style={styles.exploreSub}>{item.sub}</Text>
            </View>
            <Text style={styles.exploreChevron}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.foregroundHeading },
  subtitle: { fontSize: FontSize.sm, color: Colors.foregroundMuted, marginTop: 2 },

  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 16, marginTop: 20, marginBottom: 10,
  },

  collectionGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10,
  },
  collectionCard: {
    width: (width - 44) / 2,
    borderRadius: BorderRadius.lg, padding: 14,
    borderWidth: 1,
  },
  collectionIcon: { marginBottom: 6 },
  collectionLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  collectionTag: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 3 },

  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10,
  },
  catCard: {
    width: (width - 52) / 3,
    borderRadius: BorderRadius.lg, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  catCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  catName: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundHeading, textAlign: 'center' },
  catNameActive: { color: Colors.primary },
  catCount: { fontSize: 10, color: Colors.foregroundMuted },
  catCountActive: { color: Colors.primary },

  exploreRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, marginHorizontal: 16,
    marginBottom: 8, borderRadius: BorderRadius.lg, padding: 14,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  exploreIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  exploreText: { flex: 1 },
  exploreLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  exploreSub: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
  exploreChevron: { fontSize: 22, color: Colors.foregroundMuted, fontWeight: '300' },
});
