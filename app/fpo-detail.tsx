import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { fposApi, FPO } from '@/services/api';

export default function FPODetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fpo, setFpo] = useState<FPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFpo() {
      setLoading(true);
      setError(null);
      try {
        const res = await fposApi.detail(id);
        if (!cancelled) setFpo(res.data);
      } catch (err: any) {
        if (!cancelled) {
          setFpo(null);
          setError(err.message ?? 'FPO API is not available.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFpo();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error || !fpo) {
    return (
      <View style={styles.loader}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.statusDanger} />
        <Text style={styles.errorTitle}>FPO unavailable</Text>
        <Text style={styles.errorSub}>{error ?? 'This FPO was not returned by the API.'}</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FPO Details</Text>
      </View>
      <ScrollView>
        <View style={styles.hero}>
          <Ionicons name="business-outline" size={60} color={Colors.secondary} />
          <Text style={styles.heroName}>{fpo.name}</Text>
          <View style={styles.heroLocRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroLoc}>{fpo.district}, {fpo.state}</Text>
          </View>
          {fpo.certifications?.[0] ? (
            <View style={styles.heroBadge}>
              <Ionicons name="ribbon-outline" size={13} color={Colors.foregroundHeading} />
              <Text style={styles.heroBadgeText}>{fpo.certifications[0]}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          {[
            { val: String(fpo.farmerCount ?? 0), lbl: 'Farmers' },
            { val: String(fpo.productCount ?? 0), lbl: 'Products' },
            { val: String(fpo.certifications?.length ?? 0), lbl: 'Certifications' },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, i > 0 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>
            {fpo.description || 'No FPO description has been added in MongoDB yet.'}
          </Text>
        </View>

        {fpo.certifications?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {fpo.certifications.map((cert) => (
              <View key={cert} style={styles.certRow}>
                <Ionicons name="ribbon-outline" size={18} color={Colors.primary} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/product-listing')}>
          <Ionicons name="basket-outline" size={18} color={Colors.primaryForeground} />
          <Text style={styles.shopBtnText}>Shop FPO Products</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
  },
  errorTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.foregroundHeading, marginTop: 12 },
  errorSub: { fontSize: FontSize.sm, color: Colors.foregroundMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  errorBtn: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 18 },
  errorBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.sm },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  hero: {
    backgroundColor: Colors.primary, padding: 24, alignItems: 'center', gap: 8,
  },
  heroName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  heroLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLoc: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.secondarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.foregroundHeading },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary },
  statLbl: { fontSize: FontSize.xs, color: Colors.foregroundMuted, marginTop: 2 },
  section: {
    backgroundColor: Colors.surfaceCard, padding: 16, marginTop: 10,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, gap: 8,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  body: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 22 },
  certRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  certText: { fontSize: FontSize.sm, color: Colors.foregroundBody, fontWeight: '600' },
  shopBtn: {
    flexDirection: 'row',
    gap: 8,
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  shopBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },
});
