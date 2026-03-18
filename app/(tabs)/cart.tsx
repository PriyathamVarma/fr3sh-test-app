import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Animated, Alert, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/constants/data';

function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem } = useCart();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleRemove = () => {
    Animated.timing(slideAnim, { toValue: -400, duration: 250, useNativeDriver: true }).start(() => removeItem(item.id));
  };

  return (
    <Animated.View style={[styles.itemCard, { transform: [{ translateX: slideAnim }] }]}>
      <Image source={{ uri: item.image }} style={styles.itemImg} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemCat}>{item.category}</Text>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          {item.originalPrice && <Text style={styles.itemOgPrice}>₹{item.originalPrice}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        <TouchableOpacity onPress={handleRemove} style={styles.removeBtn}>
          <Text style={styles.removeTxt}>✕</Text>
        </TouchableOpacity>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decrement(item.id)}>
            <Text style={styles.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyTxt}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => increment(item.id)}>
            <Text style={styles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
      </View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCart();

  const deliveryFee = totalPrice > 0 ? (totalPrice >= 499 ? 0 : 29) : 0;
  const platformFee = totalPrice > 0 ? 5 : 0;
  const savings = items.reduce((sum, i) => sum + ((i.originalPrice || i.price) - i.price) * i.quantity, 0);
  const grandTotal = totalPrice + deliveryFee + platformFee;

  const handleCheckout = () => {
    Alert.alert(
      '🎉 Order Placed!',
      `Your order of ₹${grandTotal} is confirmed!\nEstimated delivery: 10–15 mins.`,
      [{ text: 'Track Order', onPress: () => { clearCart(); router.push('/(tabs)'); } }]
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}><Text style={styles.headerTitle}>My Cart</Text></View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items to get started</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopBtnTxt}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart ({totalItems})</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear cart?', '', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCart },
        ])}>
          <Text style={styles.clearTxt}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Progress */}
      {deliveryFee > 0 ? (
        <View style={styles.deliveryNotice}>
          <Text style={styles.deliveryNoticeTxt}>
            🚀 Add <Text style={{ fontWeight: '900' }}>₹{499 - totalPrice}</Text> more for free delivery!
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min((totalPrice / 499) * 100, 100)}%` }]} />
          </View>
        </View>
      ) : (
        <View style={[styles.deliveryNotice, { backgroundColor: '#E8FFF1' }]}>
          <Text style={[styles.deliveryNoticeTxt, { color: Colors.success }]}>🎉 You've unlocked <Text style={{ fontWeight: '800' }}>FREE delivery!</Text></Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CartItemRow item={item} />}
        ListFooterComponent={
          <View>
            {savings > 0 && (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsEmoji}>💰</Text>
                <Text style={styles.savingsTxt}>
                  You're saving <Text style={styles.savingsAmt}>₹{savings}</Text> on this order!
                </Text>
              </View>
            )}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <BillRow label="Item Total" value={`₹${totalPrice}`} />
              {savings > 0 && <BillRow label="Discount" value={`−₹${savings}`} green />}
              <BillRow label="Delivery Fee" value={deliveryFee === 0 ? '₹29' : `₹${deliveryFee}`} strike={deliveryFee === 0} free={deliveryFee === 0} />
              <BillRow label="Platform Fee" value={`₹${platformFee}`} />
              <View style={styles.billDivider} />
              <BillRow label="Grand Total" value={`₹${grandTotal}`} bold />
            </View>
            <View style={styles.safetyRow}>
              <Text>🛡  Safe & contactless delivery guaranteed</Text>
            </View>
            <View style={{ height: 160 }} />
          </View>
        }
      />

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutLabel}>Total</Text>
          <Text style={styles.checkoutTotal}>₹{grandTotal}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.88}>
          <Text style={styles.checkoutBtnTxt}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BillRow({
  label, value, green, strike, free, bold
}: { label: string; value: string; green?: boolean; strike?: boolean; free?: boolean; bold?: boolean }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && styles.billLabelBold, green && { color: Colors.success }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {free && (
          <View style={styles.freeTag}><Text style={styles.freeTxt}>FREE</Text></View>
        )}
        <Text style={[
          styles.billValue, bold && styles.billValueBold,
          green && { color: Colors.success },
          strike && { textDecorationLine: 'line-through', color: Colors.gray400 },
        ]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white, paddingHorizontal: 16,
    paddingTop: 52, paddingBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Colors.gray900 },
  clearTxt: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '700' },

  deliveryNotice: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 16, paddingVertical: 10, gap: 6,
  },
  deliveryNoticeTxt: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  progressBg: { height: 4, backgroundColor: Colors.gray200, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  listContent: { padding: 16, gap: 12 },
  itemCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    flexDirection: 'row', overflow: 'hidden', ...Shadow.sm,
  },
  itemImg: { width: 100, height: 100, resizeMode: 'cover' },
  itemInfo: { flex: 1, padding: 10 },
  itemName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800 },
  itemCat: { fontSize: FontSize.xs, color: Colors.gray400, marginTop: 2 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  itemPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900 },
  itemOgPrice: { fontSize: FontSize.xs, color: Colors.gray400, textDecorationLine: 'line-through' },
  itemRight: {
    paddingVertical: 10, paddingHorizontal: 10,
    alignItems: 'flex-end', justifyContent: 'space-between',
  },
  removeBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  removeTxt: { fontSize: 10, color: Colors.gray500, fontWeight: '700' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  qtyTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm, minWidth: 22, textAlign: 'center' },
  itemTotal: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray800 },

  savingsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E8FFF1', borderRadius: BorderRadius.md,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  savingsEmoji: { fontSize: 20 },
  savingsTxt: { fontSize: FontSize.sm, color: Colors.gray700, flex: 1 },
  savingsAmt: { color: Colors.success, fontWeight: '800' },

  billCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: 16, marginBottom: 12, ...Shadow.sm,
  },
  billTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900, marginBottom: 12 },
  billRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  billLabel: { fontSize: FontSize.sm, color: Colors.gray600 },
  billLabelBold: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900 },
  billValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800 },
  billValueBold: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.gray900 },
  billDivider: { height: 1, backgroundColor: Colors.gray100, marginVertical: 8 },
  freeTag: {
    backgroundColor: '#E8FFF1', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 4,
  },
  freeTxt: { fontSize: 10, color: Colors.success, fontWeight: '800' },

  safetyRow: { alignItems: 'center', paddingVertical: 8 },

  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Colors.gray100,
    gap: 16, ...Shadow.md,
  },
  checkoutLabel: { fontSize: FontSize.xs, color: Colors.gray400 },
  checkoutTotal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.gray900 },
  checkoutBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: 'center', ...Shadow.lg,
  },
  checkoutBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray800 },
  emptySub: { fontSize: FontSize.md, color: Colors.gray400, marginTop: 8, marginBottom: 32 },
  shopBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 36,
    paddingVertical: 16, borderRadius: BorderRadius.lg, ...Shadow.lg,
  },
  shopBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
});
