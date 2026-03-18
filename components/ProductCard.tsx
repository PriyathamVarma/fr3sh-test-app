import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Shadow } from '@/constants/theme';
import { Product } from '@/constants/data';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  layout?: 'grid' | 'list';
}

export default function ProductCard({ product, onPress, layout = 'grid' }: ProductCardProps) {
  const { addItem, getItemQuantity, increment, decrement } = useCart();
  const qty = getItemQuantity(product.id);

  if (layout === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.93}>
        <Image source={{ uri: product.image }} style={styles.listImage} />
        <View style={styles.listInfo}>
          {product.badge && (
            <View style={styles.badge}><Text style={styles.badgeTxt}>{product.badge}</Text></View>
          )}
          <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.listDesc} numberOfLines={1}>{product.description}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingTxt}>{product.rating}</Text>
            {product.deliveryTime && <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.deliveryTxt}>⚡ {product.deliveryTime}</Text>
            </>}
          </View>
          <View style={styles.listBottom}>
            <View>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.originalPrice && <Text style={styles.ogPrice}>₹{product.originalPrice}</Text>}
            </View>
            <QtyControl qty={qty} onAdd={() => addItem(product)} onInc={() => increment(product.id)} onDec={() => decrement(product.id)} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.93}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: product.image }} style={styles.gridImage} />
        {product.discount && (
          <View style={styles.discountBadge}><Text style={styles.discountTxt}>{product.discount}% OFF</Text></View>
        )}
        {product.isVeg && (
          <View style={styles.vegBadge}><View style={styles.vegDot} /></View>
        )}
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.deliveryChip}>⚡ {product.deliveryTime || '15 mins'}</Text>
        <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.gridRating}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingTxt}>{product.rating}</Text>
        </View>
        <View style={styles.gridBottom}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && <Text style={styles.ogPrice}>₹{product.originalPrice}</Text>}
          </View>
          <QtyControl qty={qty} onAdd={() => addItem(product)} onInc={() => increment(product.id)} onDec={() => decrement(product.id)} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QtyControl({ qty, onAdd, onInc, onDec }: { qty: number; onAdd: () => void; onInc: () => void; onDec: () => void }) {
  if (qty === 0) {
    return (
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnTxt}>+ ADD</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.qtyRow}>
      <TouchableOpacity onPress={onDec} style={styles.qtyBtn}><Text style={styles.qtyBtnTxt}>−</Text></TouchableOpacity>
      <Text style={styles.qtyTxt}>{qty}</Text>
      <TouchableOpacity onPress={onInc} style={styles.qtyBtn}><Text style={styles.qtyBtnTxt}>+</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Grid
  gridCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    overflow: 'hidden', flex: 1, margin: 6, ...Shadow.md,
  },
  imgWrap: { position: 'relative' },
  gridImage: { width: '100%', height: 140, resizeMode: 'cover' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.sm,
  },
  discountTxt: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
  vegBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderWidth: 1.5, borderColor: Colors.success,
    backgroundColor: Colors.white, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  gridInfo: { padding: 10 },
  deliveryChip: { fontSize: 10, color: Colors.primary, fontWeight: '600', marginBottom: 3 },
  gridName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800, lineHeight: 18 },
  gridRating: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 2 },
  gridBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 8,
  },
  // List
  listCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 6,
    overflow: 'hidden', ...Shadow.sm,
  },
  listImage: { width: 110, height: 120, resizeMode: 'cover' },
  listInfo: { flex: 1, padding: 12 },
  listName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: 3 },
  listDesc: { fontSize: FontSize.xs, color: Colors.gray400, marginBottom: 6 },
  listBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 8,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  // Shared
  badge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full, marginBottom: 4,
  },
  badgeTxt: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  star: { fontSize: 11, color: Colors.warning },
  ratingTxt: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray700 },
  dot: { color: Colors.gray300, fontSize: FontSize.xs },
  deliveryTxt: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  price: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900 },
  ogPrice: { fontSize: FontSize.xs, color: Colors.gray400, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: Colors.primaryMuted, borderWidth: 1.5, borderColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.sm,
  },
  addBtnTxt: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.xs, letterSpacing: 0.5 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  qtyTxt: {
    color: Colors.white, fontWeight: '800', fontSize: FontSize.sm,
    minWidth: 20, textAlign: 'center',
  },
});
