import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Switch, Alert, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { ORDERS } from '@/constants/data';

const USER = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@gmail.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  totalOrders: 24,
  savedAmount: 1840,
};

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [express, setExpress] = useState(true);

  const statusColor = (s: string) =>
    s === 'delivered' ? Colors.success : s === 'processing' ? Colors.warning : Colors.error;
  const statusLabel = (s: string) =>
    s === 'delivered' ? '✓ Delivered' : s === 'processing' ? '⏳ Processing' : '✕ Cancelled';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerBg} />
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: USER.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{USER.name}</Text>
              <Text style={styles.userEmail}>{USER.email}</Text>
              <View style={styles.memberBadge}>
                <Text style={styles.memberTxt}>🌟 Premium Member</Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            {[
              { label: 'Orders', value: USER.totalOrders },
              { label: 'Saved ₹', value: USER.savedAmount },
              { label: 'Since', value: 'Mar 25' },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity><Text style={styles.seeAll}>View all</Text></TouchableOpacity>
          </View>
          {ORDERS.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.9}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusTxt, { color: statusColor(order.status) }]}>
                    {statusLabel(order.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderItems} numberOfLines={1}>{order.items.join(', ')}</Text>
              <View style={styles.orderBottom}>
                <Text style={styles.orderDate}>📅 {order.date}</Text>
                <Text style={styles.orderTotal}>₹{order.total}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {[
            { icon: '👤', label: 'Edit Profile' },
            { icon: '📍', label: 'Saved Addresses' },
            { icon: '💳', label: 'Payment Methods' },
            { icon: '🎁', label: 'Refer & Earn' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <View style={styles.menuIconBox}><Text style={styles.menuIcon}>{item.icon}</Text></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {[
            { icon: '🔔', label: 'Notifications', val: notifications, set: setNotifications },
            { icon: '🌙', label: 'Dark Mode', val: darkMode, set: setDarkMode },
            { icon: '⚡', label: 'Express Delivery', val: express, set: setExpress },
          ].map((item, i) => (
            <View key={i} style={styles.menuItem}>
              <View style={styles.menuIconBox}><Text style={styles.menuIcon}>{item.icon}</Text></View>
              <Text style={[styles.menuLabel, { flex: 1 }]}>{item.label}</Text>
              <Switch
                value={item.val}
                onValueChange={item.set}
                trackColor={{ false: Colors.gray200, true: Colors.primary + '60' }}
                thumbColor={item.val ? Colors.primary : Colors.gray300}
              />
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => router.replace('/onboarding') },
          ])}
        >
          <Text style={styles.logoutTxt}>🚪  Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Fr3sh v1.0.0 · Made with 🧡</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  profileHeader: { backgroundColor: Colors.white, paddingBottom: 20, ...Shadow.sm },
  headerBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 120, backgroundColor: Colors.primary,
  },
  avatarRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 52, gap: 16, marginBottom: 16,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.white },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  editIcon: { fontSize: 12 },
  userInfo: { flex: 1, paddingBottom: 4 },
  userName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.gray900 },
  userEmail: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2 },
  memberBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: BorderRadius.full, marginTop: 6,
  },
  memberTxt: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20,
    backgroundColor: Colors.gray50, borderRadius: BorderRadius.lg, overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderRightWidth: 1, borderRightColor: Colors.gray200 },
  statVal: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.gray900 },
  statLbl: { fontSize: FontSize.xs, color: Colors.gray400, marginTop: 2 },

  section: {
    backgroundColor: Colors.white, marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.gray900, marginBottom: 12 },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  orderCard: {
    backgroundColor: Colors.gray50, borderRadius: BorderRadius.md,
    padding: 12, marginBottom: 10,
  },
  orderTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  orderId: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray800 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  orderItems: { fontSize: FontSize.sm, color: Colors.gray500, marginBottom: 8 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: FontSize.xs, color: Colors.gray400 },
  orderTotal: { fontSize: FontSize.md, fontWeight: '900', color: Colors.gray900 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.gray50,
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.gray800 },
  menuChevron: { fontSize: 22, color: Colors.gray300, marginLeft: 'auto' },

  logoutBtn: {
    margin: 16, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.error + '40',
  },
  logoutTxt: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.gray300, marginBottom: 8 },
});
