import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { communityApi, CommunityGroup } from '@/services/api';

export default function CommunityScreen() {
  const [code, setCode] = useState('');
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityApi.list()
      .then(r => {
        setGroups(Array.isArray(r.data) ? r.data : []);
        setError(null);
      })
      .catch((e: any) => {
        setGroups([]);
        setError(e?.message ?? 'Could not load community groups.');
      })
      .finally(() => setLoading(false));
  }, []);

  const joinGroup = async (groupId?: string, joinCode?: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const targetId = groupId ?? groups.find(g => g.joinCode === normalizedCode)?._id;
    const targetCode = joinCode ?? code.trim().toUpperCase();
    if (!targetId) {
      Alert.alert('Invalid Code', "That code doesn't match any group. Please check and try again.");
      return;
    }
    if (!targetCode) {
      Alert.alert('Join Code Required', 'Please enter the group code.');
      return;
    }
    setJoining(targetId);
    try {
      await communityApi.join(targetId, targetCode);
      Alert.alert('Joined!', "You've joined the group. You can now participate in group orders.");
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not join group.');
    } finally {
      setJoining(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Community Buying</Text>
          <Text style={styles.headerSub}>Split bulk orders with your group</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Join with code */}
        <View style={styles.joinCard}>
          <Text style={styles.joinTitle}>Join a Group</Text>
          <Text style={styles.joinSub}>Enter the group code from your community admin</Text>
          <View style={styles.joinRow}>
            <TextInput
              style={styles.joinInput}
              placeholder="Enter group code..."
              placeholderTextColor={Colors.foregroundMuted}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup()}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Active Groups Near You</Text>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : error ? (
          <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.statusDanger} />
            <Text style={{ color: Colors.foregroundMuted, textAlign: 'center' }}>{error}</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
            <Ionicons name="people-outline" size={40} color={Colors.foregroundMuted} />
            <Text style={{ color: Colors.foregroundMuted }}>No groups found in your area</Text>
          </View>
        ) : groups.map((g, index) => {
          const groupId = g._id || g.id || `${g.joinCode}-${index}`;
          const type = String(g.type ?? '').toLowerCase();
          return (
          <View key={groupId} style={styles.groupCard}>
            <View style={styles.groupTop}>
              <View style={styles.groupIcon}>
                <Ionicons
                  name={type === 'apartment' ? 'business-outline' : type === 'workplace' ? 'briefcase-outline' : 'people-outline'}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{g.name || 'Community group'}</Text>
                <Text style={styles.groupLoc}>{g.location || 'Location unavailable'}</Text>
                <Text style={styles.groupMeta}>{g.type || 'Community'} • {g.memberCount ?? 0} members</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.groupBtn}
              onPress={() => joinGroup(groupId, g.joinCode)}
              disabled={joining === groupId}
            >
              {joining === groupId
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Text style={styles.groupBtnText}>Request to Join</Text>
              }
            </TouchableOpacity>
          </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  joinCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 10 },
  joinTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  joinSub: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  joinRow: { flexDirection: 'row', gap: 8 },
  joinInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FontSize.md, color: Colors.foregroundHeading, fontWeight: '700', letterSpacing: 2 },
  joinBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 16, justifyContent: 'center', ...Shadow.lg },
  joinBtnText: { color: Colors.primaryForeground, fontWeight: '800' },
  groupCard: { backgroundColor: Colors.surfaceCard, borderRadius: BorderRadius.xl, padding: 14, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm, gap: 10 },
  groupTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  groupIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  groupInfo: { flex: 1, gap: 2 },
  groupName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.foregroundHeading },
  groupLoc: { fontSize: FontSize.xs, color: Colors.foregroundMuted },
  groupMeta: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  groupBtn: { backgroundColor: Colors.primaryMuted, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  groupBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
});
