import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, Animated, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { CATEGORIES, PRODUCTS } from '@/constants/data';
import { useCart } from '@/context/CartContext';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

const BANNERS = [
  { id: '1', title: 'Up to 40% OFF', subtitle: 'On fresh fruits & veggies', emoji: '🍓', bg: '#FF6B00' },
  { id: '2', title: 'Free Delivery', subtitle: 'On your first 3 orders', emoji: '🚀', bg: '#22C55E' },
  { id: '3', title: 'New Arrivals', subtitle: 'Organic & premium products', emoji: '✨', bg: '#3B82F6' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const { totalItems } = useCart();

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter(p => p.category === selectedCategory)
    : PRODUCTS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.locationRow}>
            <TouchableOpacity style={styles.locationBtn}>
              <Text style={styles.locationPin}>📍</Text>
              <View>
                <Text style={styles.locationLabel}>Delivering to</Text>
                <View style={styles.locationValueRow}>
                  <Text style={styles.locationValue}>Hyderabad, 500001</Text>
                  <Text style={styles.locationChevron}>▾</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => router.push('/(tabs)/cart')}>
              <Text style={styles.cartIcon}>🛒</Text>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.deliveryBanner}>
            <Text style={styles.deliveryEmoji}>⚡</Text>
            <Text style={styles.deliveryText}>
              Express delivery in <Text style={styles.deliveryHighlight}>10 minutes</Text>
            </Text>
          </View>
        </View>

        {/* Sticky Search */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search for fruits, veggies, dairy...</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Carousel */}
        <View style={{ marginTop: 16 }}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 12} decelerationRate="fast"
            onMomentumScrollEnd={(e) => setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12)))}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {BANNERS.map((item) => (
              <View key={item.id} style={[styles.bannerCard, { backgroundColor: item.bg, width: BANNER_WIDTH }]}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <View style={styles.shopBtn}>
                    <Text style={styles.shopBtnText}>Shop Now →</Text>
                  </View>
                </View>
                <Text style={styles.bannerEmoji}>{item.emoji}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.bannerDot, i === bannerIndex && styles.bannerDotActive]} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          <TouchableOpacity
            style={[styles.catChip, !selectedCategory && styles.catChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.catEmoji}>🏠</Text>
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
              <Text style={styles.catEmoji}>{cat.icon}</Text>
              <Text style={[styles.catText, selectedCategory === cat.name && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickGrid}>
          {[
            { label: 'Fresh Fruits', emoji: '🍎', bg: '#FFF3E0' },
            { label: 'Dairy & Eggs', emoji: '🥚', bg: '#E3F2FD' },
            { label: 'Bakery', emoji: '🥐', bg: '#FFF8E1' },
            { label: 'Beverages', emoji: '🧃', bg: '#F3E5F5' },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickCard, { backgroundColor: a.bg }]}
              onPress={() => router.push('/product-listing')}
              activeOpacity={0.85}
            >
              <Text style={styles.quickEmoji}>{a.emoji}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hot Deals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Hot Deals</Text>
          <TouchableOpacity onPress={() => router.push('/product-listing')}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
        >
          {filteredProducts.slice(0, 5).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.featuredCard}
              onPress={() => router.push({ pathname: '/product-detail', params: { id: p.id } })}
              activeOpacity={0.92}
            >
              <Image source={{ uri: p.image }} style={styles.featuredImage} />
              {p.discount && (
                <View style={styles.featuredDiscount}>
                  <Text style={styles.featuredDiscountText}>{p.discount}% OFF</Text>
                </View>
              )}
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredDelivery}>⚡ {p.deliveryTime}</Text>
                <Text style={styles.featuredName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.featuredPrice}>₹{p.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedCategory || 'All Products'}</Text>
          <TouchableOpacity onPress={() => router.push('/product-listing')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productGrid}>
          {filteredProducts.slice(0, 4).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.gridCard}
              onPress={() => router.push({ pathname: '/product-detail', params: { id: p.id } })}
              activeOpacity={0.92}
            >
              <Image source={{ uri: p.image }} style={styles.gridImage} />
              <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={2}>{p.name}</Text>
                <View style={styles.gridBottom}>
                  <Text style={styles.gridPrice}>₹{p.price}</Text>
                  <View style={styles.gridRating}>
                    <Text style={styles.star}>★</Text>
                    <Text style={styles.ratingVal}>{p.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Cart */}
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
          <Text style={styles.floatingArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },

  headerContainer: { backgroundColor: Colors.white, paddingBottom: 12 },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8,
  },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationPin: { fontSize: 22 },
  locationLabel: { fontSize: FontSize.xs, color: Colors.gray400, fontWeight: '500' },
  locationValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900 },
  locationChevron: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  cartHeaderBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  cartIcon: { fontSize: 20 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  deliveryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md,
  },
  deliveryEmoji: { fontSize: 14 },
  deliveryText: { fontSize: FontSize.sm, color: Colors.gray600, fontWeight: '500' },
  deliveryHighlight: { color: Colors.primary, fontWeight: '800' },

  searchWrapper: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.gray100, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, gap: 10, height: 46,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { fontSize: FontSize.md, color: Colors.gray400 },

  bannerCard: {
    borderRadius: BorderRadius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', height: 120, overflow: 'hidden',
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: -0.3 },
  bannerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  shopBtn: {
    marginTop: 10, backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  shopBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xs },
  bannerEmoji: { fontSize: 60, marginLeft: 8 },
  bannerDots: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginTop: 10,
  },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray200 },
  bannerDotActive: { width: 18, backgroundColor: Colors.primary },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  catScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.full, backgroundColor: Colors.gray100,
  },
  catChipActive: { backgroundColor: Colors.primary },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  catTextActive: { color: Colors.white },

  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginTop: 16,
  },
  quickCard: {
    width: (width - 52) / 4, aspectRatio: 0.9,
    borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: Colors.gray700, textAlign: 'center' },

  featuredCard: {
    width: 150, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm,
  },
  featuredImage: { width: '100%', height: 110, resizeMode: 'cover' },
  featuredDiscount: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  featuredDiscountText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  featuredInfo: { padding: 10 },
  featuredDelivery: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  featuredName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800, marginTop: 2 },
  featuredPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900, marginTop: 4 },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  gridCard: {
    width: (width - 40) / 2, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.sm,
  },
  gridImage: { width: '100%', height: 130, resizeMode: 'cover' },
  gridInfo: { padding: 10 },
  gridName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800 },
  gridBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 6,
  },
  gridPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900 },
  gridRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: 11, color: Colors.warning },
  ratingVal: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray600 },

  floatingCart: {
    position: 'absolute', bottom: 90, left: 16, right: 16,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    paddingHorizontal: 20, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadow.lg,
  },
  floatingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floatingBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCount: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  floatingText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  floatingArrow: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '700' },
});
