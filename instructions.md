# FR3SH Mobile App — AI Agent Instructions

This is the single source of truth for any AI agent working on this codebase.
Read this file fully before touching any code.

---

## 1. What This Project Is

`fr3sh-test-app` is the **React Native / Expo mobile app** for the FR3SH agricultural
marketplace. FR3SH connects Indian farmers directly to consumers — no middlemen.

There is a companion **Next.js web app** at `../farmers-republic/`. The mobile app must
maintain full feature parity with the web app. Every screen, feature, and brand decision
must match the web app unless explicitly told otherwise.

**Do not invent features.** If something exists in the web app, mirror it.

---

## 2. Brand & Design System (Non-Negotiable)

Import design tokens from one file only:

```typescript
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
```

### Canonical Colors

| Token | Hex | Use |
|---|---|---|
| `Colors.primary` | `#065f46` | Deep green — buttons, headers, active states |
| `Colors.primaryHover` | `#022c22` | Pressed state |
| `Colors.primaryForeground` | `#ffffff` | Text on green backgrounds |
| `Colors.primaryLight` | `#047857` | Icons, links |
| `Colors.primaryMuted` | `#eff6e8` | Badge backgrounds, card tints |
| `Colors.secondary` | `#bef264` | Lime — CTAs, progress bars |
| `Colors.surface` | `#eff6e8` | Page background |
| `Colors.surfaceCard` | `#ffffff` | Card/panel background |
| `Colors.foregroundHeading` | `#022c22` | All headings and bold text |
| `Colors.foregroundBody` | `#44403c` | Body copy |
| `Colors.foregroundMuted` | `#78716c` | Labels, captions, metadata |
| `Colors.border` | `#d1ead9` | Card borders, dividers |
| `Colors.borderFocus` | `#6ee7b7` | Focused input borders |
| `Colors.statusSuccess` / `Colors.statusSuccessSurface` | `#15803d` / `#f0fdf4` | |
| `Colors.statusWarning` / `Colors.statusWarningSurface` | `#b45309` / `#fffbeb` | |
| `Colors.statusDanger` / `Colors.statusDangerSurface` | `#b91c1c` / `#fef2f2` | |
| `Colors.statusInfo` / `Colors.statusInfoSurface` | `#1d4ed8` / `#eff6ff` | |

**Orange (`#FF6B00`, `#FF8C38`, etc.) must NEVER appear.** Replace any orange with `Colors.primary`.

### Typography & Spacing

```typescript
FontSize: { xs:11, sm:13, md:15, lg:17, xl:20, xxl:24, xxxl:30, display:36 }
BorderRadius: { sm:8, md:12, lg:16, xl:24, full:9999 }
Shadow: { sm, md, lg }  // lg uses a green glow (not black)
```

---

## 3. Icons — CRITICAL RULE

**All UI icons use `@expo/vector-icons/Ionicons`. Never use emoji for icons.**

Emoji render as question marks on Android. This applies to navigation tabs, action buttons,
placeholders, status indicators, and empty states.

```typescript
import Ionicons from '@expo/vector-icons/Ionicons';

// Type-safe icon name:
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Use:
<Ionicons name="home-outline" size={22} color={Colors.primary} />
```

There is also a thin wrapper at `components/Icon.tsx`:

```typescript
import { Icon } from '@/components/Icon';
<Icon name="leaf-outline" size={22} color={Colors.primary} />
```

**Content emoji** (crop types in category cards, product-type labels) are acceptable because
they are text content, not icons.

### Common Icon Mappings Used in This App

| UI element | Icon name |
|---|---|
| Home tab (inactive/active) | `home-outline` / `home` |
| Shop tab | `grid-outline` / `grid` |
| Search tab | `search-outline` / `search` |
| Cart tab | `cart-outline` / `cart` |
| Profile tab | `person-outline` / `person` |
| Back navigation | `‹` text character (not an icon) |
| Add to cart | `add` |
| Remove / minus | `remove` |
| Close / clear | `close` |
| Leaf / organic | `leaf-outline` |
| Lock | `lock-closed` |
| Edit / pencil | `pencil` |
| Chevron right | `chevron-forward` |
| Sign out | `log-out-outline` |
| Receipt / orders | `receipt-outline` |
| Wallet | `wallet-outline` |
| People / community | `people-outline` |
| Trophy / badge | `trophy-outline` |
| Trending | `trending-up-outline` |
| Warning | `warning-outline` |
| Search empty state | `search-outline` |
| Bicycle (delivery) | `bicycle-outline` |

---

## 4. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | 0.76.7 |
| Build tooling | Expo SDK | ~52.0 |
| Navigation | Expo Router | ~4.0 |
| Language | TypeScript | ^5.3 |
| Icons | `@expo/vector-icons` (Ionicons) | bundled with Expo |
| Auth state | AsyncStorage + React Context | — |
| Cart state | AsyncStorage + React Context | — |
| API calls | Custom fetch wrapper | `services/api.ts` |
| Haptics | `expo-haptics` | ~14.0 |
| Images | `expo-image-picker` | ~16.0 |
| Gradients | `expo-linear-gradient` | ~14.0 |

Install: `npm install --legacy-peer-deps` (legacy flag required due to peer dep conflicts)

---

## 5. File Structure

```
fr3sh-test-app/
│
├── app/                            Expo Router file-based routing
│   ├── _layout.tsx                 ROOT — wraps in UserProvider + CartProvider,
│   │                               registers ALL stack screens
│   ├── index.tsx                   Splash → redirects to /(tabs)
│   ├── onboarding.tsx              First-launch onboarding carousel
│   ├── modal.tsx                   Generic modal (unused, keep it)
│   │
│   ├── (auth)/                     Auth screen group
│   │   ├── _layout.tsx             Auth stack layout
│   │   ├── login.tsx               Combined login + register + role picker
│   │   └── forgot-password.tsx     3-step OTP reset flow
│   │
│   ├── (tabs)/                     Bottom navigation group (5 tabs)
│   │   ├── _layout.tsx             Custom tab bar using Ionicons (no emoji)
│   │   │                           Tabs: Home / Shop / Search / Cart / Profile
│   │   ├── index.tsx               HOME — banners, farmer spotlight, categories,
│   │   │                           product grid (live from productsApi)
│   │   ├── categories.tsx          SHOP — featured collections, category grid,
│   │   │                           explore rows (Farmers/FPOs/Harvests/Community)
│   │   ├── search.tsx              SEARCH — live search via productsApi with 400ms
│   │   │                           debounce, trending chips, category grid
│   │   ├── cart.tsx                CART — items, bill breakdown, checkout nav
│   │   └── profile.tsx             PROFILE — guest/logged-in dual state,
│   │                               role-aware menu (Farmer Tools / Delivery Tools)
│   │
│   ├── product-listing.tsx         Products with grid/list toggle, sort+filter
│   │                               (inline ProductApiCard uses ProductDetail shape)
│   ├── product-detail.tsx          Product page with farmer card + trust badges
│   ├── farmer-list.tsx             Farmer directory with search + filter chips
│   ├── farmer-profile.tsx          Farmer public profile with products section
│   ├── fpo-list.tsx                FPO directory
│   ├── fpo-detail.tsx              FPO detail with stats + certifications
│   ├── harvest-list.tsx            Harvest marketplace with status filter tabs
│   ├── harvest-detail.tsx          Harvest detail + atomic pre-booking flow
│   ├── order-history.tsx           Buyer order list — live from ordersApi
│   ├── order-detail.tsx            Order detail + delivery timeline — live from ordersApi
│   ├── checkout.tsx                2-step checkout: address → payment method
│   ├── wallet.tsx                  Wallet — live from walletApi
│   ├── referral.tsx                Referral code + share + stats — live from referralApi
│   ├── badges.tsx                  8 gamification badges — earned set from badgesApi,
│   │                               definitions are local (badge metadata is static)
│   ├── prebookings.tsx             Buyer's harvest pre-bookings — live from ordersApi
│   ├── community.tsx               Community groups — live from communityApi
│   ├── frsh-plus.tsx               FR3SH Plus subscription (₹199/mo, ₹1499/yr)
│   ├── edit-profile.tsx            Profile editor with farmer-specific fields
│   ├── addresses.tsx               CRUD address list with inline add form
│   ├── settings.tsx                Notification toggles, account links, sign out
│   ├── farmer-dashboard.tsx        ROLE-GATED (Farmer) — live from farmersApi.dashboard()
│   └── delivery-dashboard.tsx      ROLE-GATED (Logistics Provider) — live from
│                                   deliveryApi.orders(), with loading spinner + pull-to-refresh
│
├── components/
│   ├── ProductCard.tsx             Reusable product card (grid + list layouts)
│   │                               Note: product-listing.tsx and search.tsx use
│   │                               inline card components (ProductApiCard) instead,
│   │                               because they need the ProductDetail shape (_id, images[])
│   │                               rather than the legacy Product shape.
│   ├── Icon.tsx                    Thin Ionicons wrapper: <Icon name="..." size color />
│   ├── themed-text.tsx             Uses Colors.foregroundBody (not 'text')
│   └── themed-view.tsx             Uses Colors.surface (not 'background')
│
├── constants/
│   ├── theme.ts                    DESIGN TOKENS — import Colors from here only
│   └── data.ts                     TypeScript interfaces + CATEGORIES array
│                                   (PRODUCTS static array has been removed from use;
│                                   all product data now comes from the API)
│
├── context/
│   ├── UserContext.tsx             Auth state — login/logout/updateUser/useUser()
│   └── CartContext.tsx             Cart state — addItem/removeItem/increment etc.
│
├── services/
│   └── api.ts                      All API calls — organized by domain
│
├── hooks/                          Standard Expo hooks (don't modify)
├── assets/                         Images and fonts (don't modify)
├── app.json                        Expo config (bundle IDs, permissions, splash)
├── eas.json                        EAS Build config for App Store submission
├── package.json                    Dependencies
├── tsconfig.json                   TS config (extends expo/tsconfig.base)
├── README.md                       Quickstart for humans and AI agents
└── instructions.md                 ← You are here
```

---

## 6. The Two Contexts (State Management)

### UserContext — `context/UserContext.tsx`

```typescript
import { useUser } from '@/context/UserContext';
const { user, login, logout, updateUser } = useUser();

// user shape (UserProfile from services/api.ts):
// { id, name, email, phone?, type: 'Buyer'|'Farmer'|'Logistics Provider'|'FPO'|'Admin',
//   photo?, bio?, village?, district?, state?,
//   isSubscribed?, subscription?: { active, plan } }
```

- JWT token stored in AsyncStorage as `fr_token`
- User profile stored as `fr_user` (JSON string)
- On login: both saved to AsyncStorage
- On logout: both cleared, `authApi.logout()` called

### CartContext — `context/CartContext.tsx`

```typescript
import { useCart } from '@/context/CartContext';
const {
  items,             // CartItem[]
  addItem,           // (item: CartItem) => void
  removeItem,        // (id: string) => void
  increment,         // (id: string) => void
  decrement,         // (id: string) => void
  clearCart,
  totalItems,
  totalPrice,
  getItemQuantity,   // (id: string) => number
  ready,             // true after AsyncStorage hydration
} = useCart();
```

- Persisted in AsyncStorage as `fr_cart`
- `CartItem`: `{ id, name, price, image?, category?, quantity }`
- When adding a `ProductDetail` to cart, map: `{ id: p._id, name: p.name, price: p.price ?? 0, image: p.images?.[0], category: p.category }`

---

## 7. API Service — `services/api.ts`

All API calls go through this file. Never write raw `fetch()` in a screen.

```typescript
import { authApi, productsApi, farmersApi, harvestsApi,
         ordersApi, fposApi, walletApi, referralApi,
         badgesApi, communityApi, deliveryApi,
         userApi, subscriptionApi } from '@/services/api';
```

**Base URL:** `process.env.EXPO_PUBLIC_API_URL ?? 'https://fr3sh.in'`

In local development, `.env.local` overrides this to `http://localhost:3000`.
Never hardcode a URL in a screen — always go through `services/api.ts`.

**Auth:** The `request<T>()` base function automatically reads `fr_token` from AsyncStorage
and adds `Authorization: Bearer <token>` to every request.

### Method Signatures (Exact)

```typescript
// Auth
authApi.register({ name, email, password, type })
authApi.login({ email, password })         // → { user: UserProfile, token? }
authApi.logout()
authApi.me()                               // → { user: UserProfile }
authApi.sendResetOtp(email)
authApi.verifyResetOtp({ email, otp, newPassword })

// Products
productsApi.list({ category?, page?, limit?, search? })  // → ProductsResponse
productsApi.detail(id)                     // → { data: ProductDetail }
productsApi.byFarmer(farmerId)             // → { data: { items: ProductDetail[] } }

// Farmers
farmersApi.list({ page?, limit?, q?, place?, district?, state?, sort? })
farmersApi.detail(id)                      // → { data: FarmerProfile }
farmersApi.dashboard()                     // → { data: DashboardStats } (Farmer role only)

// Harvests
harvestsApi.list({ status?, page? })
harvestsApi.detail(id)
harvestsApi.prebook(id, { qty, buyerId?, buyerPhone?, estimatedTotal })

// Orders — NOTE: all methods require explicit userId/buyerId params
ordersApi.buyerOrders(buyerId: string)     // → { data: Order[] }
ordersApi.orderDetail(id: string)          // → { data: Order }
ordersApi.create(body: CreateOrderBody)
ordersApi.prebookings(buyerId: string)     // → { data: any[] }

// FPOs — NOTE: list() now takes optional search param and returns { fpos[], total }
fposApi.list({ q? }?)                      // → { data: { fpos: FPO[], total: number } }
fposApi.detail(id)                         // → { data: FPO }

// Delivery — NOTE: shows all deliverable-status orders; no auth required
deliveryApi.orders({ status?, page?, limit? }?)
// → { data: { orders: Order[], page, limit, total, totalPages } }

// Wallet — NOTE: both methods require explicit userId param
walletApi.balance(userId: string)          // → { data: { balance: number } }
walletApi.transactions(userId: string)     // → { data: WalletTransaction[] }

// Referral — NOTE: requires explicit userId param
referralApi.stats(userId: string)          // → { data: ReferralStats }

// Badges — NOTE: requires explicit userId param
badgesApi.list(userId: string)             // → { data: UserBadge[] }

// Community
communityApi.list({ location? }?)
communityApi.detail(id)
communityApi.join(id: string, joinCode: string)   // NOTE: two params, not one

// User
userApi.update(data: Partial<UserProfile>)

// Subscription
subscriptionApi.status(userId: string)
subscriptionApi.subscribe({ plan: 'monthly' | 'annual', userId? })
```

### Key TypeScript Types (from `services/api.ts`)

```typescript
ProductDetail {
  _id: string           // MongoDB ObjectId — NOT "id"
  name: string
  price?: number        // selling price
  mrp?: number          // original price (use for strikethrough)
  images?: string[]     // array of URLs — use images[0] for primary
  image?: string        // legacy single image fallback
  category?: string
  unit?: string
  isOrganic?: boolean   // NOT isVeg
  farmerId: string
  rating?: number
  stockQty?: number
}

Order {
  _id: string
  buyerId: string
  items: OrderItem[]    // { productId, name, price, qty, farmerId, image? }
  subtotal: number
  total: number
  status: string        // 'pending'|'confirmed'|'packed'|'picked_up'|'in_transit'|'out_for_delivery'|'delivered'|'cancelled'
  deliveryAddress?: string  // flat string, NOT an object
  createdAt: string
}

WalletTransaction {
  _id: string
  type: 'credit' | 'debit'
  amount: number
  description: string   // NOT "desc"
  balanceAfter: number  // NOT "bal"
  createdAt: string     // ISO date string
}

UserBadge {
  badgeId: string       // matches badge definition id (e.g. 'first_order')
  earnedAt: string
}
```

### Web API Endpoint Reference

All under `/api/v1/` in `../farmers-republic/app/api/v1/`:

| Route | Methods | Notes |
|---|---|---|
| `auth/login`, `register`, `logout`, `me`, `send-reset-otp`, `verify-reset-otp` | POST/GET | JWT auth |
| `products`, `products/[id]`, `products/by-farmer/[farmerId]` | GET | Paginated, returns `{ products[], page, limit, total, totalPages }` |
| `farmers`, `farmers/[id]`, `farmers/dashboard` | GET | |
| `harvests`, `harvests/[id]`, `harvests/[id]/prebook` | GET/POST | |
| `orders`, `orders/[buyerId]`, `orders/details/[id]` | GET/POST | |
| `fpos`, `fpos/[id]` | GET | Served from static data (`shared/data/fpos.tsx`) |
| `delivery/orders` | GET | `?status=all&page=1&limit=20` |
| `wallet`, `wallet/transactions` | GET | `?userId=` |
| `referral` | GET | `?referrerId=` |
| `badges` | GET | `?userId=` |
| `community`, `community/[id]`, `community/[id]/join` | GET/POST | |
| `subscription` | GET/POST | |

---

## 8. Navigation Rules

File path = route path (Expo Router).

```typescript
import { router } from 'expo-router';

router.push('/(tabs)');
router.push({ pathname: '/product-detail', params: { id } });
router.replace('/(auth)/login');
router.back();

// Read params:
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

**Tab routes:** `/(tabs)` · `/(tabs)/categories` · `/(tabs)/search` · `/(tabs)/cart` · `/(tabs)/profile`

**Auth routes:** `/(auth)/login` · `/(auth)/forgot-password`

When creating a new screen at `app/new-screen.tsx`, add to `app/_layout.tsx`:
```typescript
<Stack.Screen name="new-screen" options={{ animation: 'slide_from_right' }} />
```

---

## 9. Coding Patterns

### Screen skeleton

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors, FontSize, BorderRadius, Shadow } from '@/constants/theme';
import { useUser } from '@/context/UserContext';

export default function MyScreen() {
  const { user } = useUser();
  const [data, setData] = useState<MyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    someApi.list(user.id)
      .then(r => setData(r.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Screen Title</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* content */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: Colors.white, fontWeight: '300', lineHeight: 28 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.white },
});
```

### Card pattern

```typescript
<View style={{
  backgroundColor: Colors.surfaceCard,
  borderRadius: BorderRadius.xl,
  padding: 16,
  borderWidth: 1,
  borderColor: Colors.border,
  ...Shadow.sm,
}}>
```

### Auth guard pattern

```typescript
const { user } = useUser();
if (!user) { router.push('/(auth)/login'); return null; }
```

### API load pattern (no mock fallback — show empty state on error)

```typescript
const [items, setItems] = useState<MyType[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user?.id) { setLoading(false); return; }
  myApi.list(user.id)
    .then(r => setItems(r.data ?? []))
    .catch(() => setItems([]))         // empty state, not mock data
    .finally(() => setLoading(false));
}, [user?.id]);
```

### Empty state pattern (use Ionicons, not emoji)

```typescript
<View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
  <Ionicons name="leaf-outline" size={56} color={Colors.foregroundMuted} />
  <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: Colors.foregroundHeading }}>
    Nothing here yet
  </Text>
  <Text style={{ fontSize: FontSize.sm, color: Colors.foregroundMuted }}>
    Helpful message
  </Text>
</View>
```

### Adding a product to cart from a `ProductDetail`

```typescript
const { addItem, getItemQuantity, increment, decrement } = useCart();
const qty = getItemQuantity(p._id);
const img = p.images?.[0] ?? p.image;
const cartItem = { id: p._id, name: p.name, price: p.price ?? 0, image: img, category: p.category };
// qty === 0: show Add button that calls addItem(cartItem)
// qty > 0: show increment/decrement controls
```

---

## 10. User Roles

| Role | `user.type` value | Special Access |
|---|---|---|
| Buyer | `'Buyer'` | Default — can order and pre-book |
| Farmer | `'Farmer'` | `farmer-dashboard.tsx` (role-gated) |
| Logistics Provider | `'Logistics Provider'` | `delivery-dashboard.tsx` (role-gated) |
| FPO | `'FPO'` | FPO management (not yet built) |
| Admin | `'Admin'` | Admin panel (not yet built) |

Role-gate pattern:
```typescript
useEffect(() => {
  if (user?.type !== 'Farmer') {
    Alert.alert('Access Denied', 'This dashboard is only for farmers.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }
}, [user?.type]);
if (user?.type !== 'Farmer') return null;
```

---

## 11. What Is Built (All Live, No Mock Data)

### Auth
- Login / Register (combined, with role picker) — `(auth)/login.tsx`
- Forgot password (3-step OTP flow) — `(auth)/forgot-password.tsx`

### 5 Bottom Tabs
- **Home** — banner carousel, farmer spotlight, harvest CTA, live product grid
- **Shop** — category grid, explore rows for Farmers/FPOs/Harvests/Community
- **Search** — live search with 400ms debounce, trending chips, category grid
- **Cart** — add/remove/update, bill breakdown, free delivery progress bar
- **Profile** — guest + logged-in dual state, role-aware menu sections

### Product Flow
- Product listing (grid/list toggle, sort, organic filter) — inline `ProductApiCard`
- Product detail (hero image, farmer card, trust badges, sticky Add to Cart)

### Marketplace
- Farmer directory + public profile
- FPO directory + detail
- Harvest marketplace + pre-booking flow

### Orders & Commerce
- Order history — live, filterable by status
- Order detail — live, with delivery timeline tracker
- Checkout — address input → payment method → confirmation

### Account Screens
- Wallet — live balance + transaction history
- Referral — live stats from API, referral code, share sheet
- Badges — earned set from API + static local badge definitions
- Pre-bookings list — live from API
- Community groups — live listing + join by code
- FR3SH Plus subscription screen
- Edit profile (with farmer-specific fields)
- Addresses (CRUD)
- Settings (notification toggles, sign out, delete account)

### Role-Gated Dashboards
- Farmer dashboard — live stats from `farmersApi.dashboard()`
- Delivery dashboard — live orders from `deliveryApi.orders()`, pull-to-refresh

---

## 12. What Is NOT Built Yet

Check the web app (`../farmers-republic/`) for reference before implementing.

- [ ] **Delivery status update API** — `delivery-dashboard.tsx` updates status locally only;
  there is no `PATCH /api/v1/delivery/orders/[id]/status` endpoint yet
- [ ] **Admin panel** — role-gated admin screens
- [ ] **FPO admin screens** — FPO member managing their group
- [ ] **Voice order** — OpenAI-powered voice-to-order (web uses this)
- [ ] **Push notifications** — order status updates via Expo Notifications
- [ ] **Real image upload** — edit-profile photo uses `expo-image-picker` (wired but
  may need backend upload endpoint)
- [ ] **Delivery tracking map** — live map using `expo-location`
- [ ] **Reviews & ratings** — product and farmer review submission
- [ ] **Coupon / promo code** — checkout coupon field
- [ ] **Dark mode** — system-aware theme switching

---

## 13. Common Pitfalls

1. **Never use emoji for icons.** Use Ionicons. Emoji render as question marks on Android.
   Content text can still use emoji (e.g. crop names), but any icon-like UI element must
   use `<Ionicons>`.

2. **`ProductDetail` uses `_id`, not `id`.** MongoDB documents use `_id`. When calling
   `getItemQuantity(p._id)`, `router.push({ params: { id: p._id } })`, etc., always use `_id`.

3. **`ProductDetail` images is an array.** Use `p.images?.[0] ?? p.image` to get the
   primary image URL. There is no `p.image` in the primary shape — it's a legacy fallback.

4. **`ProductDetail` uses `isOrganic`, not `isVeg`.** The old mock data used `isVeg`.
   The real MongoDB schema uses `isOrganic`.

5. **`ProductDetail` price fields:** `p.price` is the selling price, `p.mrp` is the
   original/marked price. Show `p.mrp` as strikethrough. Both can be undefined.

6. **API methods require explicit userId.** Unlike what older docs say, these methods
   take a userId param rather than reading from the token implicitly:
   - `ordersApi.buyerOrders(userId)`, `ordersApi.prebookings(userId)`
   - `walletApi.balance(userId)`, `walletApi.transactions(userId)`
   - `referralApi.stats(userId)`, `badgesApi.list(userId)`
   Always get `user?.id` from `useUser()` and pass it explicitly.

7. **Never use orange.** Any shade of orange is wrong. Use `Colors.primary` (#065f46).

8. **Never import from `fr3shTheme.ts`.** The file is `constants/theme.ts`.

9. **`CartItem` import.** The `CartItem` type is exported from `context/CartContext.tsx`:
   ```typescript
   import { CartItem } from '@/context/CartContext';
   ```

10. **`npm install` requires `--legacy-peer-deps`.** Always:
    ```bash
    npm install --legacy-peer-deps
    ```

11. **`paddingTop: 52` on headers** — manual safe area inset. Most screens use this
    directly instead of `useSafeAreaInsets()`.

12. **`StatusBar` barStyle** — use `"light-content"` on green headers, `"dark-content"`
    on white headers.

13. **New screens need `_layout.tsx` registration.** After creating `app/new-screen.tsx`:
    ```typescript
    <Stack.Screen name="new-screen" options={{ animation: 'slide_from_right' }} />
    ```

14. **`gap` in StyleSheet works.** React Native 0.71+ supports `gap`. Use it instead of
    `marginBottom` on individual children.

15. **`WalletTransaction` shape.** Field names differ from old mock data:
    - `description` (not `desc`)
    - `balanceAfter` (not `bal`)
    - `createdAt` (ISO string, not a formatted date)

16. **`fposApi.list()` returns a nested object, not a flat array.** Access as:
    ```typescript
    const res = await fposApi.list();
    const fpos = res.data?.fpos ?? [];   // NOT res.data ?? []
    ```
    The response shape is `{ data: { fpos: FPO[], total: number } }`.

17. **Login will fail if the test user doesn't exist in the target database.**
    The mobile app defaults to `https://fr3sh.in` (production) unless `.env.local`
    overrides it. If you created a test account locally (via `localhost:3000`), it will
    not exist in the production DB. Either register via the mobile app, or use `.env.local`
    to point both the web and mobile at the same database.

18. **`auth/me` response uses `_id`, not `id`.** The Mongoose document returned by
    `/api/v1/auth/me` uses `_id`. `UserContext` normalizes this automatically
    (`id: raw.id ?? raw._id?.toString()`), but if you call `authApi.me()` directly,
    be sure to normalize `_id` → `id` before storing the user object.

19. **`deliveryApi.orders()` returns ALL deliverable-status orders** (confirmed, packed,
    picked_up, in_transit, out_for_delivery). Status updates in `delivery-dashboard.tsx`
    are optimistic/local-only — there is no backend endpoint to persist status changes.

---

## 14. The Web App (Reference)

The companion web app is at `../farmers-republic/`. When in doubt about API contracts,
data shapes, or business logic — read it there.

Key files:
- `farmers-republic/app/api/v1/*/route.ts(x)` — API endpoint handlers
- `farmers-republic/shared/models/mongodb/*.tsx` — Mongoose schemas (source of truth for shapes)
- `farmers-republic/shared/lib/` — auth, db, rateLimit utilities
- `farmers-republic/shared/data/fpos.tsx` — static FPO seed data (the FPO API serves this)

**All API routes that exist in the web app:**
`auth/*`, `products/*`, `farmers/*`, `harvests/*`, `orders/*`,
`fpos/*` (newly created), `delivery/orders`, `wallet/*`, `referral/*`,
`badges/*`, `community/*`, `subscription/*`

The web app runs at `http://localhost:3000` by default.
Set `EXPO_PUBLIC_API_URL` in `.env.local` to point the mobile app at it.

---

## 15. Environment Variables

`.env.local` exists in the project root (do not delete it):

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**After any change to `.env.local`, restart Expo with `--clear`:**
```bash
npx expo start --clear
```

| Context | Value |
|---|---|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Real device (same LAN) | `http://192.168.x.x:3000` (find IP: `ipconfig getifaddr en0`) |
| EAS preview / production builds | `https://fr3sh.in` (set in `eas.json` → `build.preview.env` / `build.production.env`) |

The code default (when no env var is set) is `https://fr3sh.in`.
EAS preview and production builds bake in `https://fr3sh.in` automatically via `eas.json`.

### EAS Build Info

- **EAS Project ID:** `8f719d88-8a8b-4c8b-9924-28ee61fe36b0`
- **Owner:** `demigod-v`
- **Apple ID:** `priyatham002@gmail.com`
- **Apple Team ID:** `4477RCBN82`
- **App Store Connect App ID:** `6780585194`
- **iOS Bundle ID:** `com.fr3sh.app`
- **Android Package:** `com.fr3sh.app`

```bash
eas build --platform ios --profile production   # build for App Store
eas submit --platform ios                        # submit to App Store Connect
```
