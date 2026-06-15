import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, BorderRadius } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IoniconsName; iconActive: IoniconsName }[] = [
  { name: 'index',      label: 'Home',    icon: 'home-outline',       iconActive: 'home'           },
  { name: 'categories', label: 'Shop',    icon: 'grid-outline',       iconActive: 'grid'           },
  { name: 'search',     label: 'Search',  icon: 'search-outline',     iconActive: 'search'         },
  { name: 'cart',       label: 'Cart',    icon: 'cart-outline',       iconActive: 'cart'           },
  { name: 'profile',    label: 'Profile', icon: 'person-outline',     iconActive: 'person'         },
];

function CustomTabBar({ state, navigation }: any) {
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index];
        const focused = state.index === index;
        const color = focused ? Colors.primary : Colors.foregroundMuted;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => !focused && navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? tab?.iconActive : tab?.icon}
                size={22}
                color={color}
              />
              {tab?.name === 'cart' && totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{tab?.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapActive: { backgroundColor: Colors.primaryMuted },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.statusDanger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surfaceCard,
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  label: { fontSize: 10, color: Colors.foregroundMuted, fontWeight: '600', letterSpacing: 0.2 },
  labelActive: { color: Colors.primary, fontWeight: '800' },
});
