import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

const TAB_CONFIG = [
  { name: 'index', label: 'Home', icon: '🏠' },
  { name: 'search', label: 'Search', icon: '🔍' },
  { name: 'cart', label: 'Cart', icon: '🛒' },
  { name: 'profile', label: 'Profile', icon: '👤' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { totalItems } = useCart();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[index];

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => !isFocused && navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Text style={styles.tabIcon}>{config?.icon}</Text>
              {config?.name === 'cart' && totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {config?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: {
    width: 46, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  iconWrapActive: { backgroundColor: Colors.primaryMuted },
  tabIcon: { fontSize: 20 },
  badge: {
    position: 'absolute', top: -3, right: -3,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  tabLabel: { fontSize: 11, color: Colors.gray400, fontWeight: '600' },
  tabLabelActive: { color: Colors.primary, fontWeight: '800' },
});
