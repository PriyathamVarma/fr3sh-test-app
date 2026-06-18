import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { farmersApi } from '@/services/api';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem { icon: IoniconsName; label: string; route: string; }
interface MenuSection { title: string; items: MenuItem[]; }

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'My Account',
    items: [
      { icon: 'receipt-outline',      label: 'My Orders',       route: '/order-history' },
      { icon: 'leaf-outline',         label: 'Pre-bookings',    route: '/prebookings'   },
      { icon: 'wallet-outline',       label: 'FR3SH Wallet',    route: '/wallet'        },
      { icon: 'trophy-outline',       label: 'My Badges',       route: '/badges'        },
      { icon: 'gift-outline',         label: 'Refer & Earn',    route: '/referral'      },
      { icon: 'people-outline',       label: 'Community Groups',route: '/community'     },
    ],
  },
  {
    title: 'Discover',
    items: [
      { icon: 'person-circle-outline', label: 'Browse Farmers',       route: '/farmer-list'  },
      { icon: 'leaf-outline',          label: 'Harvest Pre-bookings', route: '/harvest-list' },
      { icon: 'star-outline',          label: 'FR3SH Plus',           route: '/frsh-plus'    },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      { icon: 'create-outline',       label: 'Edit Profile',    route: '/edit-profile' },
      { icon: 'settings-outline',     label: 'Settings',        route: '/settings'     },
    ],
  },
];

const FARMER_MENU: MenuSection = {
  title: 'Farmer Tools',
  items: [
    { icon: 'bar-chart-outline',   label: 'Farmer Dashboard', route: '/farmer-dashboard' },
    { icon: 'leaf-outline',        label: 'My Harvests',      route: '/harvest-list'    },
    { icon: 'cube-outline',        label: 'My Orders',        route: '/order-history'   },
  ],
};

const DELIVERY_MENU: MenuSection = {
  title: 'Delivery Tools',
  items: [
    { icon: 'bicycle-outline', label: 'Delivery Dashboard', route: '/delivery-dashboard' },
  ],
};

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const [hasFarmerProfile, setHasFarmerProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasFarmerProfile(false);

    if (user?.type !== 'Farmer' || !user.id) return;

    farmersApi.byProfileId(user.id)
      .then(() => {
        if (!cancelled) setHasFarmerProfile(true);
      })
      .catch(() => {
        if (!cancelled) setHasFarmerProfile(false);
      });

    return () => { cancelled = true; };
  }, [user?.id, user?.type]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.guestRoot}>
        <StatusBar barStyle="light-content" />
        <View style={styles.guestHero}>
          <Ionicons name="person-circle-outline" size={72} color="rgba(255,255,255,0.8)" />
          <Text style={styles.guestTitle}>Welcome to FR3SH</Text>
          <Text style={styles.guestSub}>Sign in to view orders, pre-bookings, wallet, and more.</Text>
        </View>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.signInBtnText}>Sign In / Create Account</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.primaryForeground} />
        </TouchableOpacity>
        <View style={styles.guestMenu}>
          {([
            { icon: 'person-circle-outline' as IoniconsName, label: 'Browse Farmers',         route: '/farmer-list'  },
            { icon: 'leaf-outline'          as IoniconsName, label: 'Harvest Pre-bookings',   route: '/harvest-list' },
          ]).map((item, i) => (
            <TouchableOpacity key={i} style={styles.guestMenuItem}
              onPress={() => router.push(item.route as any)}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
              <Text style={styles.guestMenuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.foregroundMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const sections = [...MENU_SECTIONS];
  if (user.type === 'Farmer' && hasFarmerProfile) sections.splice(1, 0, FARMER_MENU);
  if (user.type === 'Logistics Provider') sections.splice(1, 0, DELIVERY_MENU);
  const displayName = user.name?.trim() || 'FR3SH user';
  const displayEmail = user.email || user.phoneNumber || user.phone || 'Account details unavailable';
  const role = user.type || 'Buyer';
  const avatarInitial = displayName[0]?.toUpperCase() || 'F';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarEditBtn} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="pencil" size={12} color={Colors.foregroundHeading} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>{role}</Text></View>
          {(user.isSubscribed || user.subscription?.active) && (
            <View style={styles.plusBadge}>
              <Ionicons name="star" size={12} color={Colors.foregroundHeading} />
              <Text style={styles.plusText}>FR3SH Plus Member</Text>
            </View>
          )}
        </View>

        {sections.map((sec, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{sec.title}</Text>
            {sec.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[styles.menuRow, ii > 0 && styles.menuRowBorder]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.foregroundMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.statusDanger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>FR3SH v1.0.0 · Pick fresh. Eat fresh.</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  guestRoot: { flex: 1, backgroundColor: Colors.surface },
  guestHero: { backgroundColor: Colors.primary, padding: 32, paddingTop: 60, alignItems: 'center', gap: 10 },
  guestTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  guestSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  signInBtn: { margin: 16, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: 'center', ...Shadow.lg, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  signInBtnText: { color: Colors.primaryForeground, fontWeight: '800', fontSize: FontSize.md },
  guestMenu: { margin: 16, marginTop: 4, gap: 8 },
  guestMenuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  guestMenuLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundHeading },
  profileHero: { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 24, alignItems: 'center', gap: 6 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.secondary },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.secondary },
  avatarInitial: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.white },
  avatarEditBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  profileEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  plusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full, marginTop: 4 },
  plusText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundHeading },
  statsStrip: { flexDirection: 'row', backgroundColor: Colors.surfaceCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderLeftWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.foregroundMuted, marginTop: 2 },
  menuSection: { marginTop: 12 },
  menuSectionTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceCard, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.foregroundHeading },
  logoutBtn: { margin: 16, borderWidth: 1.5, borderColor: Colors.statusDanger, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  logoutText: { color: Colors.statusDanger, fontWeight: '800', fontSize: FontSize.md },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.foregroundMuted, marginBottom: 8 },
});
