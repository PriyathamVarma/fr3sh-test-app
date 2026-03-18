import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { PRODUCTS, CATEGORIES } from '@/constants/data';
import ProductCard from '@/components/ProductCard';

const TRENDING = ['Organic Milk', 'Strawberries', 'Sourdough Bread', 'Cold Brew', 'Greek Yogurt', 'Avocados'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const results = query.length > 0
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search groceries, fruits, dairy..."
            placeholderTextColor={Colors.gray400}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        key="grid"
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          query.length === 0 ? (
            <View>
              <Text style={styles.sectionTitle}>🔥 Trending</Text>
              <View style={styles.trendingWrap}>
                {TRENDING.map((t, i) => (
                  <TouchableOpacity key={i} style={styles.trendChip} onPress={() => setQuery(t)}>
                    <Text style={styles.trendText}>🔍 {t}</Text>
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
                    <Text style={styles.catEmoji}>{cat.icon}</Text>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {results.length} results for <Text style={styles.queryBold}>"{query}"</Text>
              </Text>
            </View>
          )
        }
        ListEmptyComponent={
          query.length > 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            layout="grid"
            onPress={() => router.push({ pathname: '/product-detail', params: { id: item.id } })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.gray900 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.gray100, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, gap: 10, height: 46,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  searchBarFocused: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.gray800 },
  clearBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.gray300,
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  listContent: { padding: 10, paddingBottom: 100 },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900,
    paddingHorizontal: 6, marginBottom: 12,
  },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 6 },
  trendChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  trendText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, paddingHorizontal: 6, paddingBottom: 8,
  },
  catCard: {
    width: '22%', aspectRatio: 0.9,
    borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  catEmoji: { fontSize: 26 },
  catName: { fontSize: 11, fontWeight: '600', color: Colors.gray700, textAlign: 'center' },
  resultsHeader: { paddingHorizontal: 6, paddingVertical: 8 },
  resultsText: { fontSize: FontSize.sm, color: Colors.gray500 },
  queryBold: { fontWeight: '700', color: Colors.gray800 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray700 },
  emptySub: { fontSize: FontSize.md, color: Colors.gray400, marginTop: 6 },
});
