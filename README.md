# 🛒 Fr3sh — Premium Grocery Delivery App

> A production-ready mobile app UI built with **React Native (Expo Router)** + **TypeScript**.
> Inspired by Swiggy, Blinkit, and Zepto — clean, fast, and premium.

---

## 📱 App Overview

Fr3sh is a modern grocery delivery app featuring express 10-minute delivery, a full product catalog, cart management, and smooth animated UX. The entire UI is built with React Native StyleSheet (no NativeWind dependency required), making it plug-and-play with any Expo project.

---

## 🗂️ Complete Folder Structure

```
fresh-test/                          ← your existing project root
│
├── app/                             ← Expo Router file-based routing
│   ├── _layout.tsx                  ← ROOT LAYOUT — wraps app in CartProvider
│   ├── index.tsx                    ← SPLASH SCREEN — animated logo, auto-redirects
│   ├── onboarding.tsx               ← ONBOARDING — 3-slide swipeable carousel
│   ├── product-listing.tsx          ← PRODUCT LISTING — grid/list, filters, sort
│   ├── product-detail.tsx           ← PRODUCT DETAIL — hero image, add to cart
│   │
│   └── (tabs)/                      ← Bottom tab group
│       ├── _layout.tsx              ← TABS LAYOUT — custom tab bar with cart badge
│       ├── index.tsx                ← HOME TAB — banners, categories, products
│       ├── search.tsx               ← SEARCH TAB — trending, live filter
│       ├── cart.tsx                 ← CART TAB — items, bill summary, checkout
│       └── profile.tsx              ← PROFILE TAB — user info, orders, settings
│
├── components/
│   └── ProductCard.tsx              ← Reusable card (grid + list layouts)
│
├── constants/
│   ├── fr3shTheme.ts                ← Design tokens (Colors, FontSize, etc.)
│   └── data.ts                      ← TypeScript interfaces + placeholder data
│
└── context/
    └── CartContext.tsx              ← Global cart state (useReducer + Context API)
```

---

## 📋 File-by-File Reference

### `app/_layout.tsx`
**Root layout** — the entry point for all routes.
- Wraps the entire app in `<CartProvider>` for global cart state
- Declares the Stack navigator with all routes
- Sets `headerShown: false` globally
- Configures per-screen animations:
  - `product-listing` → `slide_from_right`
  - `product-detail` → `slide_from_bottom`

---

### `app/index.tsx` — Splash Screen
**The first screen users see.**
- Spring-physics logo scale-in animation (`Animated.spring`)
- Tagline slide-up with fade (`Animated.timing`)
- 3 pulsing loading dots with staggered loop animations (0ms / 200ms / 400ms delay)
- Auto-redirects to `/onboarding` after 2600ms
- No theme imports — all styles use raw hex values to avoid bundler issues

---

### `app/onboarding.tsx` — Onboarding Carousel
**3-slide intro for first-time users.**

| Slide | Emoji | Accent Color | Theme |
|-------|-------|-------------|-------|
| 1 | 🥦 | `#FF6B00` Orange | Freshness Guaranteed |
| 2 | ⚡ | `#F59E0B` Amber | Delivered in 10 Minutes |
| 3 | 💚 | `#22C55E` Green | Eat Better, Live Better |

- `Animated.FlatList` with `pagingEnabled` for swipe navigation
- Dot indicators animate width (`8px → 28px`) and opacity via `scrollX.interpolate`
- CTA button and dots dynamically change color to match the active slide accent
- "Skip" button jumps directly to `/(tabs)`
- All styles are self-contained with raw hex strings (no theme import)

---

### `app/(tabs)/_layout.tsx` — Tab Bar Layout
**Custom bottom tab bar** — replaces the default Expo tab bar.

Features:
- 4 tabs: Home 🏠 · Search 🔍 · Cart 🛒 · Profile 👤
- Active tab shows orange pill background highlight
- **Live cart badge** — reads `totalItems` from `useCart()`, shows count in red circle
- Badge collapses when cart is empty
- Smooth `activeOpacity` press feedback

---

### `app/(tabs)/index.tsx` — Home Screen
**The main discovery screen.**

Sections (top to bottom):
1. **Location Header** — "Delivering to" with city/pincode + cart icon button
2. **Delivery Banner** — "Express delivery in 10 minutes" pill
3. **Sticky Search Bar** — tappable, navigates to Search tab
4. **Banner Carousel** — 3 auto-paging promotional banners (orange, green, blue) with emoji illustrations and "Shop Now" CTAs. Dot indicators track active slide.
5. **Categories Row** — horizontal scroll with color-coded pill chips. Tap to filter products below.
6. **Quick Actions Grid** — 4-item 2×2 grid (Fruits, Dairy, Bakery, Beverages)
7. **Hot Deals** — horizontal scroll of `FeaturedCard` components with discount badges
8. **All Products Grid** — 2-column grid, filtered by selected category
9. **Floating Cart Bar** — appears at bottom when cart has items, shows item count and "View Cart →"

---

### `app/(tabs)/search.tsx` — Search Screen
**Full-featured search with discovery.**

States:
- **Empty state** (no query): Shows "Trending Searches" chips + "Browse Categories" grid
- **Active search**: Live-filters `PRODUCTS` array by name or category, shows result count
- **No results**: Empty state with 🔍 emoji and prompt

Features:
- Search bar highlights with orange border on focus
- Clear (✕) button appears when text is entered
- Tapping a trending chip or category auto-fills the search query
- Results render as 2-column `ProductCard` grid

---

### `app/(tabs)/cart.tsx` — Cart Screen
**Full cart management and checkout.**

Sections:
- **Delivery Progress Bar** — animated fill showing progress toward ₹499 free delivery threshold
- **Free Delivery Banner** — switches to green success banner when threshold is met
- **Cart Items List** — each item has:
  - Product image + name + category
  - Price with strikethrough original price
  - Remove button (✕) — triggers `translateX` slide-out animation before removal
  - Quantity control (− / qty / +) in orange pill
  - Line total
- **Savings Banner** — appears if any discounted items are in cart
- **Bill Details Card**:
  - Item Total
  - Discount Savings (green, if applicable)
  - Delivery Fee (shows "FREE" tag + strikethrough when unlocked)
  - Platform Fee (₹5)
  - Grand Total (bold)
- **Safety Note** — "Safe & contactless delivery"
- **Checkout Bar** — fixed bottom bar with grand total + "Proceed to Checkout →" button
- **Empty State** — 🛒 emoji, message, and "Shop Now" button back to Home

Checkout triggers an `Alert.alert` order confirmation with order details.

---

### `app/(tabs)/profile.tsx` — Profile Screen
**User account and settings hub.**

Sections:
1. **Profile Header** — orange background strip, circular avatar with edit button, name, email, premium badge
2. **Stats Row** — Orders count · Saved ₹ amount · Member Since (3-column grid)
3. **Recent Orders** — shows last 3 orders with:
   - Order ID, date, items list
   - Status badge (Delivered ✓ / Processing ⏳ / Cancelled ✕) with color coding
4. **Account Menu** — Edit Profile · Saved Addresses · Payment Methods · Refer & Earn (each with icon box + chevron)
5. **Preferences** — Toggle switches for: Push Notifications · Dark Mode · Express Delivery
6. **Support** — Help & Support · Rate the App · Privacy Policy · Terms of Service
7. **Logout Button** — red-bordered, triggers confirmation Alert, navigates back to `/onboarding`
8. **Version footer** — "Fr3sh v1.0.0 · Made with 🧡"

---

### `app/product-listing.tsx` — Product Listing Screen
**Full catalog with filtering and sorting.**

Controls:
- **Grid / List toggle** — switches between 2-column grid and full-width list layout
- **Sort button** — opens bottom sheet modal with options:
  - Relevance (default)
  - Price: Low to High
  - Price: High to Low
  - Rating
- **Filter chips** (horizontal scroll):
  - Under ₹100 · Under ₹200 · Veg Only · Best Rated · On Sale
  - Multiple filters can be active simultaneously
  - "Clear filters" link appears when any filter is active
- **Category pills** — same horizontal chip scroll as Home, filters list in real time
- **Result count** — "X items found"
- **Sort Bottom Sheet** — modal overlay, active option highlighted in orange with ✓

All filtering/sorting is computed via `useMemo` for performance.

---

### `app/product-detail.tsx` — Product Detail Screen
**Rich product page with purchase flow.**

Layout:
- **Hero Image** — full-width, 320px tall, overlaid with discount tag (bottom-left) and veg indicator (bottom-right)
- **Floating Back Button** — glass-effect circle, top-left
- **Wishlist Button** — heart toggle with scale animation (1.0 → 1.4 → 1.0)
- **Badge Pill** — e.g. "Best Seller", "Organic"
- **Product Name** — large, bold
- **Rating Row** — star rating + review count + delivery time badge (green)
- **Price Row** — current price · strikethrough original · "Save ₹X" green badge
- **Description** — full text
- **Info Grid** — 4-card grid: Category · Rating · Reviews · Delivery
- **Related Products** — horizontal scroll of emoji cards
- **Sticky Bottom Bar**:
  - Shows "Total" and calculated price (price × quantity)
  - "🛒 Add to Cart" button with scale bounce animation on press
  - Transforms into inline − / qty / + control once item is added

---

### `components/ProductCard.tsx` — Reusable Product Card
**Used in Home, Search, and Product Listing screens.**

Props:
```typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  layout?: 'grid' | 'list';  // default: 'grid'
}
```

**Grid layout** (default):
- Compact card, fixed width, fills 50% of screen
- Discount badge (top-left), veg indicator (top-right) overlaid on image
- Delivery time chip in orange
- Inline quantity control at bottom-right

**List layout**:
- Full-width horizontal card
- 110×120px thumbnail on left
- Badge pill, name, truncated description, rating row
- Price + qty control on right

Both layouts include the **inline `QtyControl`** sub-component — shows "+ ADD" button when quantity is 0, switches to − / qty / + pill when item is in cart. Reads and writes directly to `CartContext`.

---

### `constants/fr3shTheme.ts` — Design System
**Single source of truth for all visual tokens.**

#### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#FF6B00` | Buttons, badges, accents |
| `primaryLight` | `#FF8C38` | Hover states |
| `primaryDark` | `#E05A00` | Pressed states |
| `primaryMuted` | `#FFF0E5` | Backgrounds, chip fills |
| `secondary` | `#1A1A2E` | Dark backgrounds |
| `success` | `#22C55E` | Delivery badge, savings |
| `error` | `#EF4444` | Error states, logout |
| `warning` | `#F59E0B` | Star ratings |
| `gray50–gray900` | — | Full neutral scale |

#### FontSize Scale
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 11px | Micro labels, badges |
| `sm` | 13px | Secondary text, chips |
| `md` | 15px | Body text, inputs |
| `lg` | 17px | Subheadings, buttons |
| `xl` | 20px | Section titles |
| `xxl` | 24px | Screen titles |
| `xxxl` | 30px | Price display |
| `display` | 36px | Hero headings |

#### BorderRadius
| Token | Value |
|-------|-------|
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `full` | 9999px |

#### Shadow Presets
| Token | Usage |
|-------|-------|
| `Shadow.sm` | Cards, subtle lift |
| `Shadow.md` | Modals, floating elements |
| `Shadow.lg` | Primary buttons (orange glow) |

---

### `constants/data.ts` — Data Layer

#### TypeScript Interfaces
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;      // emoji
  color: string;     // hex background for chip
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;            // Unsplash URL
  category: string;
  rating: number;           // e.g. 4.8
  reviews: number;          // e.g. 324
  badge?: string;           // e.g. "Best Seller"
  isVeg?: boolean;
  deliveryTime?: string;    // e.g. "12 mins"
  discount?: number;        // percentage e.g. 25
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: 'delivered' | 'processing' | 'cancelled';
}
```

#### Placeholder Data
- **8 Categories**: Groceries, Fruits, Dairy, Snacks, Beverages, Bakery, Meat, Frozen
- **8 Products**: Strawberries, Organic Milk, Sourdough Bread, Mixed Nuts, Cold Brew Coffee, Baby Spinach, Greek Yogurt, Avocados
- **3 Sample Orders**: Mix of delivered/processing statuses

---

### `context/CartContext.tsx` — Global State
**Cart state management using React Context + useReducer.**

#### Actions
| Action | Payload | Effect |
|--------|---------|--------|
| `ADD_ITEM` | `Product` | Adds item or increments quantity if already exists |
| `REMOVE_ITEM` | `string` (id) | Removes item completely |
| `INCREMENT` | `string` (id) | +1 to quantity |
| `DECREMENT` | `string` (id) | −1, removes item if quantity reaches 0 |
| `CLEAR_CART` | — | Empties the cart |

#### Hook API — `useCart()`
```typescript
const {
  items,              // CartItem[]
  addItem,            // (product: Product) => void
  removeItem,         // (id: string) => void
  increment,          // (id: string) => void
  decrement,          // (id: string) => void
  clearCart,          // () => void
  totalItems,         // number — sum of all quantities
  totalPrice,         // number — sum of (price × quantity)
  getItemQuantity,    // (id: string) => number
} = useCart();
```

Usage example:
```typescript
import { useCart } from '@/context/CartContext';

const { addItem, getItemQuantity } = useCart();
const qty = getItemQuantity(product.id);
```

---

## 🗺️ Navigation & Routing

Expo Router uses file-based routing. Here's the complete route map:

```
/                      → app/index.tsx          (Splash)
/onboarding            → app/onboarding.tsx      (Onboarding)
/(tabs)                → app/(tabs)/index.tsx    (Home)
/(tabs)/search         → app/(tabs)/search.tsx   (Search)
/(tabs)/cart           → app/(tabs)/cart.tsx     (Cart)
/(tabs)/profile        → app/(tabs)/profile.tsx  (Profile)
/product-listing       → app/product-listing.tsx
/product-detail?id=1   → app/product-detail.tsx
```

#### Navigating between screens
```typescript
import { router } from 'expo-router';

// Go to a tab
router.push('/(tabs)/cart');

// Go to product detail (pass id as param)
router.push({ pathname: '/product-detail', params: { id: product.id } });

// Replace current screen (no back button)
router.replace('/(tabs)');

// Go back
router.back();
```

#### Reading params in product-detail
```typescript
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
const product = PRODUCTS.find(p => p.id === id);
```

---

## ⚙️ Setup Instructions

### Step 1 — Copy files into your project

Use the table below to place each file into the correct path in your `fresh-test` project:

| File | Action | Destination |
|------|--------|-------------|
| `app/_layout.tsx` | **Replace** | `app/_layout.tsx` |
| `app/index.tsx` | **Replace** | `app/index.tsx` |
| `app/onboarding.tsx` | **New** | `app/onboarding.tsx` |
| `app/product-listing.tsx` | **New** | `app/product-listing.tsx` |
| `app/product-detail.tsx` | **New** | `app/product-detail.tsx` |
| `app/(tabs)/_layout.tsx` | **Replace** | `app/(tabs)/_layout.tsx` |
| `app/(tabs)/index.tsx` | **Replace** | `app/(tabs)/index.tsx` |
| `app/(tabs)/search.tsx` | **New** | `app/(tabs)/search.tsx` |
| `app/(tabs)/cart.tsx` | **New** | `app/(tabs)/cart.tsx` |
| `app/(tabs)/profile.tsx` | **New** | `app/(tabs)/profile.tsx` |
| `constants/fr3shTheme.ts` | **New** | `constants/fr3shTheme.ts` |
| `constants/data.ts` | **New** | `constants/data.ts` |
| `context/CartContext.tsx` | **New folder + file** | `context/CartContext.tsx` |
| `components/ProductCard.tsx` | **New** | `components/ProductCard.tsx` |

### Step 2 — Delete unused files

```bash
# These Expo template files are no longer needed
rm app/(tabs)/explore.tsx
rm app/modal.tsx              # optional, keep if you need it
```

### Step 3 — Run the app

```bash
npx expo start
```

No additional packages to install — Expo Router comes pre-configured in your project.

---

## 🐛 Known Fix — Theme Import Issue

### Problem
The error `Cannot read properties of undefined (reading 'full')` occurs because Expo Router's bundler evaluates `StyleSheet.create()` at module parse time. If `@/constants/theme` resolves to the Expo template's existing barrel index (which doesn't export `BorderRadius`), the import returns `undefined`.

### Solution Applied
Two fixes were applied in this codebase:

**1. Theme file renamed to `fr3shTheme.ts`**
Avoids any naming collision with the Expo template's existing `constants/Colors.ts` or `constants/index.ts`.
```
✅ import { Colors } from '@/constants/fr3shTheme'
❌ import { Colors } from '@/constants/theme'   ← may collide with template
```

**2. `index.tsx` and `onboarding.tsx` use no theme imports**
These two files use raw hex strings directly in `StyleSheet.create()`, making them crash-proof regardless of bundler resolution order.

---

## 🎨 Design System Summary

| Property | Value |
|----------|-------|
| Primary color | `#FF6B00` (Vibrant Orange) |
| Background | `#F9FAFB` (Warm off-white) |
| Card background | `#FFFFFF` |
| Border color | `#E5E7EB` |
| Primary font weight | 700–900 (heavy, bold) |
| Border radius (cards) | 16px |
| Border radius (pills) | 9999px (fully round) |
| Base spacing unit | 8px |
| Shadows | iOS `shadowColor` + Android `elevation` |

---

## ✅ Features Checklist

### Screens
- [x] Splash Screen — spring logo animation + pulsing dots
- [x] Onboarding — 3-slide carousel, animated dots, skip/continue
- [x] Home — banners, categories, hot deals, product grid, floating cart bar
- [x] Search — trending chips, category grid, live search filter
- [x] Product Listing — grid/list toggle, multi-filter, sort sheet
- [x] Product Detail — hero image, wishlist animation, add to cart
- [x] Cart — remove animation, bill breakdown, free delivery progress
- [x] Profile — stats, orders, preference toggles, logout

### Components & Architecture
- [x] Custom bottom tab bar with live cart badge
- [x] Reusable `ProductCard` (grid + list)
- [x] Inline quantity controller in cards and detail screen
- [x] Global cart state via Context + useReducer
- [x] Full TypeScript interfaces for all data
- [x] File-based routing with Expo Router
- [x] `useLocalSearchParams` for product detail navigation
- [x] `Animated` API throughout (spring, timing, loop, sequence)

---

## 🔮 Extending the App

### Add a new screen
Create a file in `app/` — Expo Router picks it up automatically:
```
app/orders.tsx    →  accessible at route /orders
```

### Add a new product
Edit `constants/data.ts` and add to the `PRODUCTS` array:
```typescript
{
  id: '9',
  name: 'Cherry Tomatoes',
  price: 79,
  originalPrice: 99,
  image: 'https://images.unsplash.com/...',
  category: 'Groceries',
  rating: 4.5,
  reviews: 88,
  isVeg: true,
  deliveryTime: '10 mins',
  discount: 20,
  description: 'Vine-ripened cherry tomatoes...',
}
```

### Connect a real backend
Replace the static `PRODUCTS` array in `constants/data.ts` with an API fetch. The TypeScript interfaces are already defined and ready to match your API response shape.

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.76+ | Core framework |
| Expo | ~52.0 | Build tooling, APIs |
| Expo Router | ~4.0 | File-based navigation |
| TypeScript | ^5.3 | Type safety |
| React Context | built-in | Global cart state |
| Animated API | built-in | All animations |

---

*Fr3sh v1.0.0 · Built with 🧡 · React Native + Expo Router*
