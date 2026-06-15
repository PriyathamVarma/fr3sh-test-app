import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { productsApi, farmersApi, ProductDetail } from '@/services/api';
import { useCart } from '@/context/CartContext';

function productImage(product: ProductDetail) {
  return product.images?.[0] ?? product.image;
}

function productPrice(product: ProductDetail) {
  return product.price ?? product.mrp ?? 0;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, getItemQuantity, increment, decrement } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmer, setFarmer] = useState<{ name?: string; village?: string; district?: string } | null>(null);
  const [wishlist, setWishlist] = useState(false);
  const heartAnim = useRef(new Animated.Value(1)).current;
  const addAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError('Product id is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.detail(id);
        if (!cancelled) {
          setProduct(res.data);
          // Fetch farmer details to get name and location
          if (res.data?.farmerId) {
            farmersApi.detail(res.data.farmerId)
              .then(fr => { if (!cancelled) setFarmer(fr.data); })
              .catch(() => {});
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Could not load product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  const handleWishlist = () => {
    setWishlist(prev => !prev);
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product._id,
      name: product.name,
      price: productPrice(product),
      originalPrice: product.mrp ?? product.originalPrice,
      image: productImage(product),
      category: product.category,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      unit: product.unit,
    });
    Animated.sequence([
      Animated.timing(addAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(addAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.statusDanger} />
        <Text style={styles.emptyTitle}>Product unavailable</Text>
        <Text style={styles.emptySub}>{error ?? 'This product was not returned by the API.'}</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={Colors.primaryForeground} />
          <Text style={styles.secondaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const image = productImage(product);
  const price = productPrice(product);
  const originalPrice = product.mrp ?? product.originalPrice;
  const quantity = getItemQuantity(product._id);
  const reviews = product.reviewsCount ?? product.reviews ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.gray700} />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWishlist}>
            <Ionicons
              name={wishlist ? 'heart' : 'heart-outline'}
              size={21}
              color={wishlist ? Colors.statusDanger : Colors.gray600}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Ionicons name="leaf-outline" size={72} color={Colors.primary} />
            </View>
          )}
          {product.discount ? (
            <View style={styles.discountTag}>
              <Text style={styles.discountTxt}>{product.discount}% OFF</Text>
            </View>
          ) : null}
          {product.isOrganic || product.isVeg ? (
            <View style={styles.vegTag}>
              <Ionicons name="leaf" size={12} color={Colors.success} />
              <Text style={styles.vegTxt}>{product.isOrganic ? 'Organic' : 'Veg'}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{product.badge}</Text>
            </View>
          ) : null}

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.ratingVal}>{product.rating ? product.rating.toFixed(1) : 'New'}</Text>
              <Text style={styles.ratingCount}>({reviews} reviews)</Text>
            </View>
            <View style={styles.deliveryBadge}>
              <Ionicons name="flash-outline" size={12} color={Colors.success} />
              <Text style={styles.deliveryBadgeTxt}>{product.deliveryTime ?? 'Farm direct'}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {originalPrice && originalPrice > price ? (
              <Text style={styles.ogPrice}>₹{originalPrice}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>About this product</Text>
          <Text style={styles.description}>
            {product.description || 'Fresh from the farm. Sourced directly from verified FR3SH farmers with no middlemen.'}
          </Text>

          <View style={styles.infoGrid}>
            {[
              { icon: 'pricetag-outline' as const, label: 'Category', val: product.category || 'Uncategorized' },
              { icon: 'cube-outline' as const, label: 'Stock', val: `${product.stockQty ?? 0} ${product.unit ?? 'units'}` },
              { icon: 'person-outline' as const, label: 'Farmer', val: product.farmerName || farmer?.name || 'FR3SH Farmer' },
              { icon: 'leaf-outline' as const, label: 'Type', val: product.isOrganic ? 'Organic' : 'Fresh' },
            ].map((info) => (
              <View key={info.label} style={styles.infoCard}>
                <Ionicons name={info.icon} size={20} color={Colors.primary} />
                <Text style={styles.infoVal} numberOfLines={1}>{info.val}</Text>
                <Text style={styles.infoLbl}>{info.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <Ionicons name="person-outline" size={24} color={Colors.primaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerLabel}>Sold directly by</Text>
              <Text style={styles.farmerName}>{product.farmerName || farmer?.name || 'FR3SH Farmer'}</Text>
              <Text style={styles.farmerLoc}>
                {product.farmerLocation || (farmer?.village && farmer?.district ? `${farmer.village}, ${farmer.district}` : farmer?.village || farmer?.district || 'Verified FR3SH Farmer')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.farmerBtn}
              onPress={() => product.farmerId
                ? router.push({ pathname: '/farmer-profile', params: { id: product.farmerId } })
                : router.push('/farmer-list')
              }
            >
              <Text style={styles.farmerBtnText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustRow}>
            {[
              { icon: 'home-outline' as const, label: 'Farm\nDirect' },
              { icon: 'leaf-outline' as const, label: 'Fresh\nProduce' },
              { icon: 'snow-outline' as const, label: 'Cold\nChain' },
              { icon: 'shield-checkmark-outline' as const, label: 'Quality\nChecked' },
            ].map(t => (
              <View key={t.label} style={styles.trustBadge}>
                <Ionicons name={t.icon} size={19} color={Colors.primary} />
                <Text style={styles.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{price * (quantity || 1)}</Text>
        </View>

        {quantity === 0 ? (
          <Animated.View style={[styles.addBtnWrap, { transform: [{ scale: addAnim }] }]}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Ionicons name="cart-outline" size={19} color={Colors.white} />
              <Text style={styles.addBtnTxt}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.qtyBar}>
            <TouchableOpacity style={styles.qtyBarBtn} onPress={() => decrement(product._id)}>
              <Ionicons name="remove" size={20} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.qtyBarTxt}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBarBtn} onPress={() => increment(product._id)}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading, marginTop: 12 },
  emptySub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  secondaryBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.sm },
  topActions: {
    position: 'absolute', top: 48, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10,
  },
  actionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  imageWrap: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
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
    justifyContent: 'space-between', marginBottom: 14, gap: 10,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray800 },
  ratingCount: { fontSize: FontSize.sm, color: Colors.gray400 },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8FFF1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  deliveryBadgeTxt: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  price: { fontSize: 30, fontWeight: '900', color: Colors.gray900 },
  ogPrice: {
    fontSize: FontSize.xl, color: Colors.gray400,
    textDecorationLine: 'line-through', fontWeight: '500',
  },
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
  infoVal: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.gray800, textAlign: 'center' },
  infoLbl: { fontSize: 10, color: Colors.gray400 },
  farmerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.xl,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  farmerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  farmerLabel: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  farmerName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  farmerLoc: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  farmerBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  farmerBtnText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.white },
  trustRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  trustBadge: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg, padding: 10, borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  trustLabel: { fontSize: 9, color: Colors.foregroundMuted, textAlign: 'center', lineHeight: 12 },
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
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  addBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  qtyBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, height: 52, overflow: 'hidden',
  },
  qtyBarBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  qtyBarTxt: {
    color: Colors.white, fontSize: FontSize.lg, fontWeight: '900',
    minWidth: 40, textAlign: 'center',
  },
});
