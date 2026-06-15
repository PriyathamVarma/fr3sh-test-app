import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Dimensions, StatusBar, ActivityIndicator, Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { CATEGORIES } from '@/constants/data';
import { productsApi, ProductDetail } from '@/services/api';
import { useCart } from '@/context/CartContext';

function ProductApiCard({ product: p, layout }: { product: ProductDetail; layout: 'grid' | 'list' }) {
  const { addItem, getItemQuantity, increment, decrement } = useCart();
  const qty = getItemQuantity(p._id);
  const img = p.images?.[0] ?? p.image;

  const cartItem = { id: p._id, name: p.name, price: p.price ?? 0, image: img, category: p.category };

  if (layout === 'list') {
    return (
      <TouchableOpacity
        style={cardStyles.listCard}
        onPress={() => router.push({ pathname: '/product-detail', params: { id: p._id } })}
        activeOpacity={0.9}
      >
        {img ? (
          <Image source={{ uri: img }} style={cardStyles.listImg} />
        ) : (
          <View style={[cardStyles.listImg, cardStyles.imgPlaceholder]}>
            <Ionicons name="leaf-outline" size={28} color={Colors.primary} />
          </View>
        )}
        <View style={cardStyles.listInfo}>
          {p.badge && <Text style={cardStyles.badge}>{p.badge}</Text>}
          <Text style={cardStyles.listName} numberOfLines={2}>{p.name}</Text>
          {p.farmerName && <Text style={cardStyles.listFarmer}>by {p.farmerName}</Text>}
          <View style={cardStyles.listBottom}>
            <View>
              <Text style={cardStyles.price}>₹{p.price}</Text>
              {p.mrp && p.mrp > (p.price ?? 0) && <Text style={cardStyles.mrp}>₹{p.mrp}</Text>}
            </View>
            <QtyControl id={p._id} qty={qty} onAdd={() => addItem(cartItem)} onInc={() => increment(p._id)} onDec={() => decrement(p._id)} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={cardStyles.gridCard}
      onPress={() => router.push({ pathname: '/product-detail', params: { id: p._id } })}
      activeOpacity={0.9}
    >
      {img ? (
        <Image source={{ uri: img }} style={cardStyles.gridImg} />
      ) : (
        <View style={[cardStyles.gridImg, cardStyles.imgPlaceholder]}>
          <Ionicons name="leaf-outline" size={28} color={Colors.primary} />
        </View>
      )}
      {p.isOrganic && <View style={cardStyles.organicDot}><Ionicons name="leaf" size={10} color={Colors.primary} /></View>}
      <View style={cardStyles.gridInfo}>
        {p.badge && <Text style={cardStyles.badge} numberOfLines={1}>{p.badge}</Text>}
        <Text style={cardStyles.gridName} numberOfLines={2}>{p.name}</Text>
        <View style={cardStyles.gridBottom}>
          <Text style={cardStyles.price}>₹{p.price}</Text>
          <QtyControl id={p._id} qty={qty} onAdd={() => addItem(cartItem)} onInc={() => increment(p._id)} onDec={() => decrement(p._id)} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QtyControl({ id, qty, onAdd, onInc, onDec }: { id: string; qty: number; onAdd: () => void; onInc: () => void; onDec: () => void }) {
  if (qty === 0) {
    return (
      <TouchableOpacity style={cardStyles.addBtn} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={16} color={Colors.primaryForeground} />
      </TouchableOpacity>
    );
  }
  return (
    <View style={cardStyles.qtyRow}>
      <TouchableOpacity style={cardStyles.qtyBtn} onPress={onDec}><Text style={cardStyles.qtyBtnTxt}>−</Text></TouchableOpacity>
      <Text style={cardStyles.qtyTxt}>{qty}</Text>
      <TouchableOpacity style={cardStyles.qtyBtn} onPress={onInc}><Text style={cardStyles.qtyBtnTxt}>+</Text></TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  gridCard: { width: '48%', margin: '1%', backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  gridImg: { width: '100%', height: 120, resizeMode: 'cover' },
  imgPlaceholder: { backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  organicDot: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primaryMuted, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: Colors.border },
  gridInfo: { padding: 8, gap: 4 },
  gridName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  gridBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  listCard: { flexDirection: 'row', backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg, marginBottom: 10, marginHorizontal: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  listImg: { width: 110, height: 110, resizeMode: 'cover' },
  listInfo: { flex: 1, padding: 10, justifyContent: 'space-between' },
  listName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  listFarmer: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  listBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: 10, color: Colors.primary, fontWeight: '700', backgroundColor: Colors.primaryMuted, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  price: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading },
  mrp: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textDecorationLine: 'line-through' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 6, paddingVertical: 3 },
  qtyBtnTxt: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  qtyTxt: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '800', minWidth: 18, textAlign: 'center' },
});

const { width } = Dimensions.get('window');
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating'];
const FILTERS = ['Under ₹100', 'Under ₹200', 'Organic Only', 'Best Rated'];
const CATEGORY_ICONS: Record<string, IoniconName> = {
  Groceries: 'basket-outline',
  Fruits: 'nutrition-outline',
  Vegetables: 'leaf-outline',
  Dairy: 'water-outline',
  Grains: 'grid-outline',
  Spices: 'flame-outline',
};

export default function ProductListingScreen() {
  const { category: initCategory } = useLocalSearchParams<{ category?: string }>();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('Relevance');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(initCategory ?? null);
  const [showSort, setShowSort] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleFilter = (f: string) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ category: category ?? undefined, limit: 50 });
        if (!cancelled) setAllProducts(res.data.products ?? []);
      } catch {
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [category]);

  const products = useMemo(() => {
    let p = [...allProducts];
    if (activeFilters.includes('Organic Only')) p = p.filter(x => x.isOrganic);
    if (activeFilters.includes('Under ₹100')) p = p.filter(x => (x.price ?? 0) < 100);
    if (activeFilters.includes('Under ₹200')) p = p.filter(x => (x.price ?? 0) < 200);
    if (activeFilters.includes('Best Rated')) p = p.filter(x => (x.rating ?? 0) >= 4.5);
    if (sort === 'Price: Low to High') p.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === 'Price: High to Low') p.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === 'Rating') p.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return p;
  }, [allProducts, activeFilters, sort]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.layoutToggle}>
          {(['grid', 'list'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.toggleBtn, layout === l && styles.toggleBtnActive]}
              onPress={() => setLayout(l)}
            >
              <Ionicons
                name={l === 'grid' ? 'grid-outline' : 'list-outline'}
                size={18}
                color={layout === l ? Colors.primary : Colors.gray400}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sort + Filters */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Ionicons name="swap-vertical-outline" size={14} color={Colors.primary} />
          <Text style={styles.sortTxt}>{sort}</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilters.includes(f) && styles.filterChipActive]}
              onPress={() => toggleFilter(f)}
            >
              <Text style={[styles.filterTxt, activeFilters.includes(f) && styles.filterTxtActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        <TouchableOpacity
          style={[styles.catChip, !category && styles.catChipActive]}
          onPress={() => setCategory(null)}
        >
          <Text style={[styles.catTxt, !category && styles.catTxtActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, category === c.name && styles.catChipActive]}
            onPress={() => setCategory(category === c.name ? null : c.name)}
          >
            <Ionicons
              name={CATEGORY_ICONS[c.name] ?? 'leaf-outline'}
              size={13}
              color={category === c.name ? Colors.white : Colors.primary}
            />
            <Text style={[styles.catTxt, category === c.name && styles.catTxtActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.resultRow}>
        <Text style={styles.resultTxt}>{products.length} items found</Text>
        {activeFilters.length > 0 && (
          <TouchableOpacity onPress={() => setActiveFilters([])}>
            <Text style={styles.clearTxt}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} size="large" />
      ) : (
        <FlatList
          data={products}
          key={layout}
          numColumns={layout === 'grid' ? 2 : 1}
          keyExtractor={(i) => i._id}
          contentContainerStyle={layout === 'grid' ? styles.gridPad : styles.listPad}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductApiCard product={item} layout={layout} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={56} color={Colors.gray400} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>Try removing some filters</Text>
            </View>
          }
        />
      )}

      {/* Sort Sheet */}
      {showSort && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.sortSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sort By</Text>
            {SORT_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.sortOption, sort === o && styles.sortOptionActive]}
                onPress={() => { setSort(o); setShowSort(false); }}
              >
                <Text style={[styles.sortOptTxt, sort === o && styles.sortOptTxtActive]}>{o}</Text>
                {sort === o && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: Colors.gray800, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  layoutToggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray100,
  },
  toggleBtnActive: { backgroundColor: Colors.primaryMuted },

  controlRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: 10,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortTxt: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  divider: { width: 1, height: 24, backgroundColor: Colors.gray200 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.gray200,
    marginRight: 8, backgroundColor: Colors.white,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray600 },
  filterTxtActive: { color: Colors.white },

  catScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catTxt: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray600 },
  catTxtActive: { color: Colors.white },

  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  resultTxt: { fontSize: FontSize.sm, color: Colors.gray500 },
  clearTxt: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  gridPad: { paddingHorizontal: 10, paddingBottom: 100 },
  listPad: { paddingBottom: 100 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray700 },
  emptySub: { fontSize: FontSize.md, color: Colors.gray400, marginTop: 8 },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.gray200, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: 16 },
  sortOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: BorderRadius.md, marginBottom: 4,
  },
  sortOptionActive: { backgroundColor: Colors.primaryMuted },
  sortOptTxt: { fontSize: FontSize.md, color: Colors.gray700 },
  sortOptTxtActive: { color: Colors.primary, fontWeight: '700' },
  check: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
});
