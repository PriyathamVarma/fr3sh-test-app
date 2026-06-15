import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { ordersApi } from '@/services/api';

type Step = 'address' | 'payment' | 'confirm';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const PAYMENT_OPTIONS = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: 'phone-portrait-outline' as IoniconName, sub: 'Instant • No charges' },
  { id: 'card', label: 'Debit / Credit Card', icon: 'card-outline' as IoniconName, sub: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'FR3SH Wallet', icon: 'wallet-outline' as IoniconName, sub: 'Account wallet' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' as IoniconName, sub: '₹20 COD fee applies' },
];

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const [step, setStep] = useState<Step>('address');

  // Address fields
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment
  const [paymentId, setPaymentId] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const deliveryFee = totalPrice >= 499 ? 0 : 29;
  const platformFee = 5;
  const codFee = paymentId === 'cod' ? 20 : 0;
  const grandTotal = totalPrice + deliveryFee + platformFee + codFee;

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in before placing an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Add products before placing an order.');
      return;
    }

    setPlacing(true);
    try {
      const deliveryAddress = [line1, line2, city, pincode].filter(Boolean).join(', ');
      const res: any = await ordersApi.create({
        buyerId: user.id,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.quantity,
          farmerId: item.farmerId ?? '',
          image: item.image,
        })),
        subtotal: totalPrice,
        total: grandTotal,
        deliveryAddress,
        deliveryFee,
        paymentMethod: paymentId,
      });
      setOrderId(res.data?._id ?? res.order?._id ?? null);
      setStep('confirm');
    } catch (err: any) {
      Alert.alert('Order Failed', err.message ?? 'Could not create the order in MongoDB.');
    } finally {
      setPlacing(false);
    }
  };

  if (step === 'confirm') {
    return (
      <View style={styles.successRoot}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successHero}>
          <Ionicons name="checkmark-circle-outline" size={70} color={Colors.secondary} />
          <Text style={styles.successTitle}>Order Placed!</Text>
          {orderId ? <Text style={styles.successOrderId}>{orderId.slice(-8).toUpperCase()}</Text> : null}
        </View>

        <View style={styles.successCard}>
          <Text style={styles.successMsg}>
            Your order of <Text style={styles.bold}>₹{grandTotal}</Text> has been confirmed!
            Expected delivery in <Text style={styles.bold}>15–30 minutes</Text>.
          </Text>

          <View style={styles.deliveryTrack}>
            {['Order Confirmed ✓', 'Packing', 'Out for Delivery', 'Delivered'].map((s, i) => (
              <View key={i} style={styles.trackStep}>
                <View style={[styles.trackDot, i === 0 && styles.trackDotActive]} />
                {i < 3 && <View style={styles.trackLine} />}
                <Text style={[styles.trackLabel, i === 0 && styles.trackLabelActive]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => { clearCart(); router.replace('/(tabs)'); }}
        >
          <Text style={styles.successBtnText}>Continue Shopping →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.successSecBtn}
          onPress={() => { clearCart(); router.replace('/order-history'); }}
        >
          <Text style={styles.successSecBtnText}>Track My Order</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'payment' ? setStep('address') : router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'address' ? 'Delivery Address' : 'Payment'}
        </Text>
        <Text style={styles.stepIndicator}>{step === 'address' ? '1 / 2' : '2 / 2'}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: step === 'address' ? '50%' : '100%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {step === 'address' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Where should we deliver?</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.foregroundMuted} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="10-digit" placeholderTextColor={Colors.foregroundMuted} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Address Line 1</Text>
              <TextInput style={styles.input} value={line1} onChangeText={setLine1} placeholder="Flat, building, street" placeholderTextColor={Colors.foregroundMuted} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Address Line 2 (optional)</Text>
              <TextInput style={styles.input} value={line2} onChangeText={setLine2} placeholder="Area, landmark" placeholderTextColor={Colors.foregroundMuted} />
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>City</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={Colors.foregroundMuted} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="6 digits" placeholderTextColor={Colors.foregroundMuted} keyboardType="number-pad" maxLength={6} />
              </View>
            </View>
          </View>
        )}

        {step === 'payment' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Choose Payment Method</Text>

            {PAYMENT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.paymentOption, paymentId === opt.id && styles.paymentOptionActive]}
                onPress={() => setPaymentId(opt.id)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={paymentId === opt.id ? Colors.primary : Colors.foregroundBody}
                />
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, paymentId === opt.id && styles.paymentLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.paymentSub}>{opt.sub}</Text>
                </View>
                <View style={[styles.radioOuter, paymentId === opt.id && styles.radioOuterActive]}>
                  {paymentId === opt.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Order summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              {items.map(item => (
                <View key={item.id} style={styles.summaryRow}>
                  <Text style={styles.summaryItem} numberOfLines={1}>{item.name} × {item.quantity}</Text>
                  <Text style={styles.summaryItemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>₹{totalPrice}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={[styles.summaryVal, deliveryFee === 0 && styles.freeText]}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform fee</Text>
                <Text style={styles.summaryVal}>₹{platformFee}</Text>
              </View>
              {codFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>COD fee</Text>
                  <Text style={styles.summaryVal}>₹{codFee}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBar}>
        {step === 'address' ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => {
              if (!name.trim() || !line1.trim() || !city.trim() || !pincode.trim()) {
                Alert.alert('Missing Fields', 'Please fill in all required address fields.');
                return;
              }
              setStep('payment');
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaBtnText}>Continue to Payment →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtn, placing && styles.ctaBtnDisabled]}
            onPress={handlePlaceOrder}
            disabled={placing}
            activeOpacity={0.9}
          >
            {placing ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <View style={styles.ctaBtnInner}>
                <Text style={styles.ctaBtnTotal}>₹{grandTotal}</Text>
                <Text style={styles.ctaBtnText}>Place Order →</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4, marginRight: 10 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  stepIndicator: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  progressBar: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: 3, backgroundColor: Colors.primary },

  form: { padding: 16, gap: 14 },
  formTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1, gap: 5 },
  field: { gap: 5 },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundBody },
  input: {
    backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: FontSize.sm, color: Colors.foregroundHeading,
  },

  paymentOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.lg,
    padding: 14, borderWidth: 1.5, borderColor: Colors.border, gap: 12,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  paymentLabelActive: { color: Colors.primary },
  paymentSub: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  summaryCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  summaryTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, fontSize: FontSize.xs, color: Colors.foregroundBody },
  summaryItemPrice: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundHeading },
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  summaryVal: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.foregroundHeading },
  freeText: { color: Colors.statusSuccess, fontWeight: '800' },
  grandTotalLabel: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  grandTotalVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 16, paddingBottom: 28, ...Shadow.md,
  },
  ctaBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', ...Shadow.lg,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaBtnTotal: {
    color: Colors.secondary, fontWeight: '900', fontSize: FontSize.md,
    paddingRight: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.3)',
  },
  ctaBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },

  successRoot: {
    flex: 1, backgroundColor: Colors.surface,
  },
  successHero: {
    backgroundColor: Colors.primary, padding: 40, alignItems: 'center', gap: 8,
  },
  successTitle: { fontSize: FontSize.display, fontWeight: '900', color: Colors.white },
  successOrderId: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: '700', letterSpacing: 1 },

  successCard: {
    backgroundColor: Colors.surfaceCard, margin: 16, borderRadius: BorderRadius.xl,
    padding: 20, borderWidth: 1, borderColor: Colors.border, gap: 16,
  },
  successMsg: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.foregroundHeading },

  deliveryTrack: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  trackStep: { alignItems: 'center', flex: 1, gap: 6 },
  trackDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.border },
  trackDotActive: { backgroundColor: Colors.primary },
  trackLine: {
    position: 'absolute', left: '50%', top: 7, width: '100%', height: 2, backgroundColor: Colors.border,
  },
  trackLabel: { fontSize: 9, textAlign: 'center', color: Colors.foregroundMuted, fontWeight: '600' },
  trackLabelActive: { color: Colors.primary, fontWeight: '800' },

  successBtn: {
    marginHorizontal: 16, backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', ...Shadow.lg,
  },
  successBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },
  successSecBtn: { padding: 16, alignItems: 'center' },
  successSecBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
