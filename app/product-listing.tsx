import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { PRODUCTS, CATEGORIES } from '@/constants/data';
import ProductCard from '@/components/ProductCard';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating'];
const FILTERS = ['Under ₹100', 'Under ₹200', 'Veg Only', 'Best Rated', 'On Sale'];

export default function ProductListingScreen() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('Relevance');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);

  const toggleFilter = (f: string) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const products = useMemo(() => {
    let p = [...PRODUCTS];
    if (category) p = p.filter(x => x.category === category);
    if (activeFilters.includes('Veg Only')) p = p.filter(x => x.isVeg);
    if (activeFilters.includes('Under ₹100')) p = p.filter(x => x.price < 100);
    if (activeFilters.includes('Under ₹200')) p = p.filter(x => x.price < 200);
    if (activeFilters.includes('Best Rated')) p = p.filter(x => x.rating >= 4.6);
    if (activeFilters.includes('On Sale')) p = p.filter(x => x.discount);
    if (sort === 'Price: Low to High') p.sort((a, b) => a.price - b.price);
    if (sort === 'Price: High to Low') p.sort((a, b) => b.price - a.price);
    if (sort === 'Rating') p.sort((a, b) => b.rating - a.rating);
    return p;
  }, [category, activeFilters, sort]);

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
              <Text style={[styles.toggleIcon, layout === l && styles.toggleIconActive]}>
                {l === 'grid' ? '⊞' : '☰'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sort + Filters */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={styles.sortIcon}>↕</Text>
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
            <Text style={styles.catEmoji}>{c.icon}</Text>
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

      <FlatList
        data={products}
        key={layout}
        numColumns={layout === 'grid' ? 2 : 1}
        keyExtractor={(i) => i.id}
        contentContainerStyle={layout === 'grid' ? styles.gridPad : styles.listPad}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            layout={layout}
            onPress={() => router.push({ pathname: '/product-detail', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>Try removing some filters</Text>
          </View>
        }
      />

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
  toggleIcon: { fontSize: 18, color: Colors.gray400 },
  toggleIconActive: { color: Colors.primary },

  controlRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: 10,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortIcon: { fontSize: 14, color: Colors.primary },
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
  catEmoji: { fontSize: 13 },
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
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
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
