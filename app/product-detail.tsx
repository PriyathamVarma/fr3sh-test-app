import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { PRODUCTS } from '@/constants/data';
import { useCart } from '@/context/CartContext';

const { width } = Dimensions.get('window');

const RELATED = [
  { id: 'r1', emoji: '🥝', name: 'Kiwi', price: 99 },
  { id: 'r2', emoji: '🫐', name: 'Blueberries', price: 179 },
  { id: 'r3', emoji: '🍇', name: 'Red Grapes', price: 139 },
  { id: 'r4', emoji: '🍋', name: 'Lemons', price: 49 },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  const { addItem, getItemQuantity, increment, decrement } = useCart();
  const quantity = getItemQuantity(product.id);
  const [wishlist, setWishlist] = useState(false);
  const heartAnim = useRef(new Animated.Value(1)).current;
  const addAnim = useRef(new Animated.Value(1)).current;

  const handleWishlist = () => {
    setWishlist(!wishlist);
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleAdd = () => {
    addItem(product);
    Animated.sequence([
      Animated.timing(addAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(addAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top actions */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
          <Text style={styles.actionIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.actionGroup}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleWishlist}>
              <Text style={[styles.actionIcon, { color: wishlist ? '#EF4444' : Colors.gray600 }]}>
                {wishlist ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.heroImage} resizeMode="cover" />
          {product.discount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTxt}>{product.discount}% OFF</Text>
            </View>
          )}
          {product.isVeg && (
            <View style={styles.vegTag}>
              <View style={styles.vegDot} />
              <Text style={styles.vegTxt}>Veg</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{product.badge}</Text>
            </View>
          )}

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingVal}>{product.rating}</Text>
              <Text style={styles.ratingCount}>({product.reviews} reviews)</Text>
            </View>
            {product.deliveryTime && (
              <View style={styles.deliveryBadge}>
                <Text style={styles.deliveryBadgeTxt}>⚡ {product.deliveryTime} delivery</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.ogPrice}>₹{product.originalPrice}</Text>
            )}
            {product.discount && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsTxt}>Save ₹{product.originalPrice! - product.price}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            {[
              { icon: '🏷', label: 'Category', val: product.category },
              { icon: '⭐', label: 'Rating', val: `${product.rating}/5` },
              { icon: '💬', label: 'Reviews', val: product.reviews.toString() },
              { icon: '🚀', label: 'Delivery', val: product.deliveryTime || '15 min' },
            ].map((info, i) => (
              <View key={i} style={styles.infoCard}>
                <Text style={styles.infoIcon}>{info.icon}</Text>
                <Text style={styles.infoVal}>{info.val}</Text>
                <Text style={styles.infoLbl}>{info.label}</Text>
              </View>
            ))}
          </View>

          {/* Related */}
          <Text style={styles.sectionLabel}>You might also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
              {RELATED.map((item) => (
                <View key={item.id} style={styles.relatedCard}>
                  <Text style={styles.relatedEmoji}>{item.emoji}</Text>
                  <Text style={styles.relatedName}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>₹{item.price}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{product.price * (quantity || 1)}</Text>
        </View>

        {quantity === 0 ? (
          <Animated.View style={[styles.addBtnWrap, { transform: [{ scale: addAnim }] }]}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.addBtnTxt}>🛒  Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.qtyBar}>
            <TouchableOpacity style={styles.qtyBarBtn} onPress={() => decrement(product.id)}>
              <Text style={styles.qtyBarBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyBarTxt}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBarBtn} onPress={() => increment(product.id)}>
              <Text style={styles.qtyBarBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  topActions: {
    position: 'absolute', top: 48, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10,
  },
  actionGroup: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  actionIcon: { fontSize: 18, color: Colors.gray700, fontWeight: '600' },

  imageWrap: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  discountTag: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.sm,
  },
  discountTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  vegTag: {
    position: 'absolute', bottom: 16, right: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5, borderColor: Colors.success,
  },
  vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  vegTxt: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },

  content: { padding: 20 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, marginBottom: 8,
  },
  badgeTxt: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  productName: {
    fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray900,
    lineHeight: 32, marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 14, color: Colors.warning },
  ratingVal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray800 },
  ratingCount: { fontSize: FontSize.sm, color: Colors.gray400 },
  deliveryBadge: {
    backgroundColor: '#E8FFF1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  deliveryBadgeTxt: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  price: { fontSize: 30, fontWeight: '900', color: Colors.gray900 },
  ogPrice: {
    fontSize: FontSize.xl, color: Colors.gray400,
    textDecorationLine: 'line-through', fontWeight: '500',
  },
  savingsBadge: {
    backgroundColor: '#E8FFF1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm,
  },
  savingsTxt: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.gray100, marginBottom: 16 },
  sectionLabel: {
    fontSize: FontSize.md, fontWeight: '800', color: Colors.gray800, marginBottom: 8, marginTop: 4,
  },
  description: {
    fontSize: FontSize.md, color: Colors.gray500, lineHeight: 24, marginBottom: 20,
  },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  infoCard: {
    flex: 1, backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md, padding: 12, alignItems: 'center', gap: 4,
  },
  infoIcon: { fontSize: 20 },
  infoVal: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray800 },
  infoLbl: { fontSize: 10, color: Colors.gray400 },
  relatedCard: {
    width: 100, backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md, padding: 12, alignItems: 'center', gap: 6,
  },
  relatedEmoji: { fontSize: 30 },
  relatedName: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray700, textAlign: 'center' },
  relatedPrice: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
    gap: 16, ...Shadow.md,
  },
  totalLabel: { fontSize: FontSize.xs, color: Colors.gray400 },
  totalPrice: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.gray900 },
  addBtnWrap: { flex: 1 },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', ...Shadow.lg,
  },
  addBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  qtyBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, height: 52, overflow: 'hidden',
  },
  qtyBarBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  qtyBarBtnTxt: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  qtyBarTxt: {
    color: Colors.white, fontSize: FontSize.lg, fontWeight: '900',
    minWidth: 40, textAlign: 'center',
  },
});
