import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { farmersApi, productsApi, FarmerProfile, ProductDetail } from '@/services/api';
import { useCart } from '@/context/CartContext';

function farmerId(farmer: FarmerProfile) {
  return farmer.id || farmer._id;
}

function toArray(value?: string[] | string | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function locationFor(farmer: FarmerProfile) {
  return [farmer.village, farmer.mandal, farmer.district, farmer.state, farmer.pincode].filter(Boolean).join(', ');
}

function profileImageFor(farmer: FarmerProfile) {
  return farmer.avatar || farmer.photo || farmer.photoPath || farmer.farmImages?.[0];
}

function farmAreaFor(farmer: FarmerProfile) {
  if (farmer.farmArea) return farmer.farmArea;
  if (farmer.totalLandArea) return `${farmer.totalLandArea} acres`;
  return undefined;
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Chip({ label, tone = 'green' }: { label: string; tone?: 'green' | 'lime' | 'amber' | 'blue' }) {
  const style =
    tone === 'lime' ? styles.chipLime :
    tone === 'amber' ? styles.chipAmber :
    tone === 'blue' ? styles.chipBlue :
    styles.chipGreen;

  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, getItemQuantity } = useCart();
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const [fRes, pRes] = await Promise.all([
        farmersApi.detail(id),
        productsApi.byFarmer(id),
      ]);
      setFarmer(fRes.data);
      setProducts(pRes.data?.items ?? []);
    } catch (err: any) {
      setFarmer(null);
      setProducts([]);
      setError(err?.message ?? 'Unable to load this farmer from the web app API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const profile = useMemo(() => {
    if (!farmer) return null;
    const seasonalCrops = toArray(farmer.seasonalCrops);
    const perennialCrops = toArray(farmer.perennialCrops);
    const subCategories = toArray(farmer.subCategories);
    const awards = toArray(farmer.awards);
    const deliveryPinCodes = toArray(farmer.deliveryPinCodes);

    return {
      image: profileImageFor(farmer),
      location: locationFor(farmer),
      area: farmAreaFor(farmer),
      crops: [farmer.category, ...subCategories, ...seasonalCrops, ...perennialCrops].filter(Boolean) as string[],
      seasonalCrops,
      perennialCrops,
      subCategories,
      awards,
      deliveryPinCodes,
      about: farmer.about || farmer.bio,
    };
  }, [farmer]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading farmer profile...</Text>
      </View>
    );
  }

  if (!farmer || !profile) {
    return (
      <View style={styles.errorRoot}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backFloating} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.errorTitle}>Farmer unavailable</Text>
        <Text style={styles.errorText}>{error || 'This farmer profile could not be loaded.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const idForCart = farmerId(farmer);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backFloating} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroInitials}>
              <Text style={styles.heroInitialsText}>{farmer.name?.[0] ?? 'F'}</Text>
            </View>
          )}

          <View style={styles.heroContent}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>Farmer profile</Text>
            </View>
            <Text style={styles.heroName}>{farmer.name}</Text>
            {!!farmer.farmName && <Text style={styles.heroFarm}>{farmer.farmName}</Text>}
            {!!profile.location && <Text style={styles.heroLocation}>{profile.location}</Text>}

            <View style={styles.heroBadges}>
              {(farmer.verified || farmer.kycStatus === 'verified') && <Chip label="Verified" />}
              {farmer.organicCertified && <Chip label="Organic" tone="lime" />}
              {farmer.delivery && <Chip label="Delivery" tone="blue" />}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.area || '-'}</Text>
            <Text style={styles.statLabel}>Farm area</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.rating ? farmer.rating.toFixed(1) : '-'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.reviewsCount ?? 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        {!!profile.about && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{profile.about}</Text>
            {!!farmer.experienceDescription && (
              <Text style={styles.bodyText}>{farmer.experienceDescription}</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Details</Text>
          <DetailRow label="Farm name" value={farmer.farmName} />
          <DetailRow label="Farm area" value={profile.area} />
          <DetailRow label="Owned land" value={farmer.ownedLandArea ? `${farmer.ownedLandArea} acres` : undefined} />
          <DetailRow label="Leased land" value={farmer.leasedLandArea ? `${farmer.leasedLandArea} acres` : undefined} />
          <DetailRow label="Irrigation" value={farmer.irrigationType} />
          <DetailRow label="Soil type" value={farmer.soilType} />
          <DetailRow label="Water source" value={farmer.waterSource} />
          <DetailRow label="Experience" value={farmer.farmingExperienceYears ? `${farmer.farmingExperienceYears} years` : undefined} />
        </View>

        {profile.crops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crops</Text>
            <View style={styles.tagGrid}>
              {profile.crops.map((crop) => <Chip key={crop} label={crop} tone="lime" />)}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Delivery</Text>
          <DetailRow label="Phone" value={farmer.phone} />
          <DetailRow label="WhatsApp" value={farmer.whatsappNumber} />
          <DetailRow label="Email" value={farmer.email} />
          <DetailRow label="Pickup" value={farmer.pickupLocation?.address} />
          <DetailRow label="Delivery radius" value={farmer.deliveryRadiusKm ? `${farmer.deliveryRadiusKm} km` : undefined} />
          {profile.deliveryPinCodes.length > 0 && (
            <View style={styles.tagGrid}>
              {profile.deliveryPinCodes.map((pin) => <Chip key={pin} label={pin} tone="blue" />)}
            </View>
          )}

          <View style={styles.actionRow}>
            {!!farmer.phone && (
              <TouchableOpacity style={styles.outlineBtn} onPress={() => Linking.openURL(`tel:${farmer.phone}`)}>
                <Text style={styles.outlineBtnText}>Call</Text>
              </TouchableOpacity>
            )}
            {!!farmer.whatsappNumber && (
              <TouchableOpacity style={styles.outlineBtn} onPress={() => Linking.openURL(`https://wa.me/${farmer.whatsappNumber?.replace(/\D/g, '')}`)}>
                <Text style={styles.outlineBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {profile.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awards & Recognition</Text>
            <View style={styles.tagGrid}>
              {profile.awards.map((award) => <Chip key={award} label={award} tone="amber" />)}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Products</Text>
              <Text style={styles.sectionSub}>{products.length} listed from this farmer</Text>
            </View>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>No products added yet.</Text>
            </View>
          ) : (
            products.map((product) => {
              const qty = getItemQuantity(product._id);
              const image = product.image || product.images?.[0];
              return (
                <View key={product._id} style={styles.productRow}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.productImg} />
                  ) : (
                    <View style={styles.productPlaceholder}>
                      <Text style={styles.productPlaceholderText}>{product.name?.[0] ?? 'P'}</Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    {!!product.category && <Text style={styles.productCat}>{product.category}</Text>}
                    {product.price != null && <Text style={styles.productPrice}>₹{product.price}</Text>}
                  </View>
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addToCart({
                        id: product._id,
                        name: product.name,
                        price: product.price ?? 0,
                        image,
                        category: product.category,
                        farmerId: product.farmerId || idForCart,
                        farmerName: farmer.name,
                      })}
                    >
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyControl}>
                      <Text style={styles.qtyVal}>{qty} in cart</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.trustBlock}>
          <Text style={styles.trustTitle}>Direct from farm</Text>
          <Text style={styles.trustText}>
            Products and profile details here are loaded from the Farmers Republic backend, which reads the farmer data from MongoDB.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.surface },
  loaderText: { fontSize: FontSize.sm, color: Colors.foregroundMuted },
  errorRoot: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: FontSize.xxl, color: Colors.white, fontWeight: '900', textAlign: 'center' },
  errorText: { marginTop: 10, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: 20 },
  retryBtn: { marginTop: 18, backgroundColor: Colors.secondary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: BorderRadius.md },
  retryText: { color: Colors.secondaryForeground, fontWeight: '900', fontSize: FontSize.sm },

  hero: { minHeight: 420, backgroundColor: Colors.primary, position: 'relative', justifyContent: 'flex-end' },
  backFloating: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.white, fontWeight: '300' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.82 },
  heroInitials: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  heroInitialsText: { fontSize: 76, color: Colors.primary, fontWeight: '900' },
  heroContent: { padding: 20, paddingTop: 120, backgroundColor: 'rgba(2,44,34,0.68)' },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyebrowText: { color: Colors.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  heroName: { marginTop: 12, fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.white },
  heroFarm: { marginTop: 4, fontSize: FontSize.md, color: 'rgba(255,255,255,0.84)', fontWeight: '700' },
  heroLocation: { marginTop: 8, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.76)', lineHeight: 20 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  statValue: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading, textAlign: 'center' },
  statLabel: { fontSize: 10, color: Colors.foregroundMuted, textAlign: 'center', fontWeight: '700' },

  section: {
    backgroundColor: Colors.surfaceCard,
    marginTop: 10,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading },
  sectionSub: { marginTop: 2, fontSize: FontSize.xs, color: Colors.foregroundMuted },
  bodyText: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 22 },

  detailRow: {
    backgroundColor: '#f8faf5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 11,
  },
  detailLabel: { fontSize: 10, color: Colors.foregroundMuted, fontWeight: '900', textTransform: 'uppercase' },
  detailValue: { marginTop: 3, fontSize: FontSize.sm, color: Colors.foregroundHeading, fontWeight: '800' },

  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: BorderRadius.full, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1 },
  chipGreen: { backgroundColor: Colors.statusSuccessSurface, borderColor: '#bbf7d0' },
  chipLime: { backgroundColor: Colors.secondarySubtle, borderColor: Colors.secondary },
  chipAmber: { backgroundColor: Colors.statusWarningSurface, borderColor: '#fcd34d' },
  chipBlue: { backgroundColor: Colors.statusInfoSurface, borderColor: '#bfdbfe' },
  chipText: { fontSize: FontSize.xs, color: Colors.foregroundHeading, fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineBtnText: { color: Colors.primary, fontWeight: '900', fontSize: FontSize.sm },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productImg: { width: 62, height: 62, borderRadius: BorderRadius.md, resizeMode: 'cover', backgroundColor: Colors.primaryMuted },
  productPlaceholder: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productPlaceholderText: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '900' },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundHeading },
  productCat: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  productPrice: { fontSize: FontSize.md, fontWeight: '900', color: Colors.primary },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.md },
  addBtnText: { color: Colors.primaryForeground, fontWeight: '900', fontSize: FontSize.sm },
  qtyControl: { backgroundColor: Colors.primaryMuted, paddingHorizontal: 10, paddingVertical: 8, borderRadius: BorderRadius.md },
  qtyVal: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary },
  emptyProducts: { padding: 16, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.border, borderRadius: BorderRadius.md },
  emptyProductsText: { fontSize: FontSize.sm, color: Colors.foregroundMuted },

  trustBlock: {
    margin: 16,
    backgroundColor: Colors.secondarySubtle,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    ...Shadow.sm,
  },
  trustTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.foregroundHeading, marginBottom: 6 },
  trustText: { fontSize: FontSize.sm, color: Colors.foregroundBody, lineHeight: 20 },
});
