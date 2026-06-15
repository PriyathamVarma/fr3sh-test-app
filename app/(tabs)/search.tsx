import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, StatusBar, ActivityIndicator, Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { CATEGORIES } from '@/constants/data';
import { productsApi, ProductDetail } from '@/services/api';
import { useCart } from '@/context/CartContext';

const TRENDING = ['Tomatoes', 'Rice', 'Organic Milk', 'Spinach', 'Dal', 'Mangoes'];
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const CATEGORY_ICONS: Record<string, IoniconName> = {
  Groceries: 'basket-outline',
  Fruits: 'nutrition-outline',
  Vegetables: 'leaf-outline',
  Dairy: 'water-outline',
  Grains: 'grid-outline',
  Spices: 'flame-outline',
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem, getItemQuantity, increment, decrement } = useCart();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ search: query.trim(), limit: 30 });
        setResults(res.data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function SearchProductCard({ p }: { p: ProductDetail }) {
    const qty = getItemQuantity(p._id);
    const img = p.images?.[0] ?? (p as any).image;
    const cartItem = { id: p._id, name: p.name, price: p.price ?? 0, image: img, category: p.category };
    return (
      <TouchableOpacity
        style={cardStyles.card}
        onPress={() => router.push({ pathname: '/product-detail', params: { id: p._id } })}
        activeOpacity={0.85}
      >
        <View style={cardStyles.imgWrap}>
          {img
            ? <Image source={{ uri: img }} style={cardStyles.img} resizeMode="cover" />
            : <View style={cardStyles.imgPlaceholder}><Ionicons name="leaf-outline" size={28} color={Colors.primary} /></View>
          }
          {p.isOrganic && (
            <View style={cardStyles.organicBadge}><Text style={cardStyles.organicText}>Organic</Text></View>
          )}
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.name} numberOfLines={2}>{p.name}</Text>
          <Text style={cardStyles.unit}>{p.unit}</Text>
          <View style={cardStyles.priceRow}>
            <Text style={cardStyles.price}>₹{p.price ?? p.mrp ?? 0}</Text>
            {p.mrp && p.price && p.mrp > p.price && (
              <Text style={cardStyles.mrp}>₹{p.mrp}</Text>
            )}
          </View>
          {qty === 0 ? (
            <TouchableOpacity style={cardStyles.addBtn} onPress={() => addItem(cartItem)}>
              <Ionicons name="add" size={18} color={Colors.primaryForeground} />
            </TouchableOpacity>
          ) : (
            <View style={cardStyles.qtyRow}>
              <TouchableOpacity style={cardStyles.qtyBtn} onPress={() => decrement(p._id)}>
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={cardStyles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={cardStyles.qtyBtn} onPress={() => increment(p._id)}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={18} color={focused ? Colors.primary : Colors.foregroundMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search groceries, fruits, dairy..."
            placeholderTextColor={Colors.foregroundMuted}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close" size={14} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        key="grid"
        numColumns={2}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          query.length === 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Trending</Text>
              <View style={styles.trendingWrap}>
                {TRENDING.map((t, i) => (
                  <TouchableOpacity key={i} style={styles.trendChip} onPress={() => setQuery(t)}>
                    <Ionicons name="trending-up-outline" size={13} color={Colors.primary} />
                    <Text style={styles.trendText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Browse Categories</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, { backgroundColor: cat.color }]}
                    onPress={() => setQuery(cat.name)}
                  >
                    <Ionicons name={CATEGORY_ICONS[cat.name] ?? 'leaf-outline'} size={26} color={Colors.primary} />
                    <Text style={styles.catName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.resultsHeader}>
              {loading
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Text style={styles.resultsText}>
                    {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                    <Text style={styles.queryBold}>"{query}"</Text>
                  </Text>
              }
            </View>
          )
        }
        ListEmptyComponent={
          query.length > 0 && !loading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={56} color={Colors.foregroundMuted} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <SearchProductCard p={item} />}
      />
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1, margin: 5, backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', ...Shadow.sm,
  },
  imgWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  organicBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: Colors.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  organicText: { fontSize: 9, fontWeight: '800', color: Colors.white },
  info: { padding: 8, gap: 3 },
  name: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading, lineHeight: 17 },
  unit: { fontSize: 10, color: Colors.foregroundMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  price: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  mrp: { fontSize: FontSize.xs, color: Colors.foregroundMuted, textDecorationLine: 'line-through' },
  addBtn: { marginTop: 4, backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, alignItems: 'center', paddingVertical: 6 },
  qtyRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.sm, paddingHorizontal: 4 },
  qtyBtn: { padding: 4 },
  qtyNum: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.foregroundHeading },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, gap: 10, height: 46,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchBarFocused: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.foregroundHeading },
  clearBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.foregroundMuted,
    alignItems: 'center', justifyContent: 'center',
  },

  listContent: { padding: 10, paddingBottom: 100 },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading,
    paddingHorizontal: 6, marginBottom: 12,
  },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 6 },
  trendChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  trendText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundHeading },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, paddingHorizontal: 6, paddingBottom: 8,
  },
  catCard: {
    width: '22%', aspectRatio: 0.9,
    borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  catName: { fontSize: 11, fontWeight: '600', color: Colors.foregroundHeading, textAlign: 'center' },
  resultsHeader: { paddingHorizontal: 6, paddingVertical: 8 },
  resultsText: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  queryBold: { fontWeight: '700', color: Colors.foregroundHeading },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.foregroundHeading },
  emptySub: { fontSize: FontSize.md, color: Colors.foregroundMuted },
});
