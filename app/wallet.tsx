import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { walletApi, WalletTransaction } from '@/services/api';
import { useUser } from '@/context/UserContext';

export default function WalletScreen() {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setTransactions([]);
      setBalance(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      walletApi.balance(user.id)
        .then(r => setBalance(Number(r.data?.balance ?? 0)))
        .catch((e: any) => {
          setBalance(0);
          setError(e?.message ?? 'Could not load wallet balance.');
        }),
      walletApi.transactions(user.id)
        .then(r => setTransactions(Array.isArray(r.data) ? r.data : []))
        .catch((e: any) => {
          setTransactions([]);
          setError(e?.message ?? 'Could not load wallet transactions.');
        }),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FR3SH Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmt}>₹{balance}</Text>
          <Text style={styles.balanceSub}>Use wallet balance for instant checkout</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBanner}>
          <Ionicons name="bulb-outline" size={16} color={Colors.foregroundBody} />
          <Text style={styles.infoText}>
            Earn ₹100 for every friend you refer. Your wallet is auto-credited when they place their first order.
          </Text>
        </View>

        {/* Transactions */}
        <Text style={styles.txnTitle}>Transaction History</Text>
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color={Colors.statusDanger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : transactions.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
            <Ionicons name="wallet-outline" size={40} color={Colors.foregroundMuted} />
            <Text style={{ fontSize: FontSize.sm, color: Colors.foregroundMuted }}>No transactions yet</Text>
          </View>
        ) : transactions.map((t, index) => {
          const transactionId = t._id || t.id || `${t.createdAt}-${index}`;
          const createdAt = t.createdAt ? new Date(t.createdAt) : null;
          return (
          <View key={transactionId} style={styles.txnRow}>
            <View style={[styles.txnIcon, t.type === 'credit' ? styles.txnIconCredit : styles.txnIconDebit]}>
              <Ionicons
                name={t.type === 'credit' ? 'arrow-down-outline' : 'arrow-up-outline'}
                size={16}
                color={t.type === 'credit' ? Colors.statusSuccess : Colors.statusDanger}
              />
            </View>
            <View style={styles.txnInfo}>
              <Text style={styles.txnDesc}>{t.description || 'Wallet transaction'}</Text>
              <Text style={styles.txnDate}>
                {createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString('en-IN') : 'Date unavailable'}
              </Text>
            </View>
            <View style={styles.txnAmt}>
              <Text style={[styles.txnAmtVal, t.type === 'credit' ? styles.creditAmt : styles.debitAmt]}>
                {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount ?? 0)}
              </Text>
              <Text style={styles.txnBal}>Bal: ₹{Number(t.balanceAfter ?? 0)}</Text>
            </View>
          </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },

  balanceCard: {
    backgroundColor: Colors.primary, padding: 24, alignItems: 'center', gap: 6,
  },
  balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  balanceAmt: { fontSize: 48, fontWeight: '900', color: Colors.white },
  balanceSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.secondarySubtle, padding: 12, margin: 16,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.secondary,
  },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.foregroundBody, lineHeight: 17 },

  txnTitle: {
    fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: 16, marginBottom: 8,
  },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.statusDangerSurface, borderRadius: BorderRadius.md, padding: 12, marginHorizontal: 16, marginBottom: 12 },
  errorText: { flex: 1, color: Colors.statusDanger, fontSize: FontSize.sm, fontWeight: '700' },
  txnRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, padding: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  txnIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  txnIconCredit: { backgroundColor: Colors.statusSuccessSurface },
  txnIconDebit: { backgroundColor: Colors.statusDangerSurface },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundHeading },
  txnDate: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
  txnAmt: { alignItems: 'flex-end' },
  txnAmtVal: { fontSize: FontSize.md, fontWeight: '800' },
  creditAmt: { color: Colors.statusSuccess },
  debitAmt: { color: Colors.statusDanger },
  txnBal: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
});
