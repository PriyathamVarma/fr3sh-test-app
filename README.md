# FR3SH Mobile App

React Native / Expo mobile app for the **FR3SH agricultural marketplace** — connecting
Indian farmers directly to consumers, no middlemen.

Companion to the Next.js web app at `../farmers-republic/`.

---

## Quick Start

```bash
npm install --legacy-peer-deps
npx expo start
```

Create `.env.local` to point at the local backend (already exists — do not delete):

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For a physical device on the same Wi-Fi: use your machine's LAN IP instead of `localhost`.
Android emulator: use `http://10.0.2.2:3000`.

---

## Tech Stack

| | Version |
|---|---|
| React Native | 0.76.7 |
| Expo SDK | ~52.0 |
| Expo Router | ~4.0 (file-based navigation) |
| TypeScript | ^5.3 |
| Icons | `@expo/vector-icons` — Ionicons only |
| State | React Context + AsyncStorage |
| API | Custom fetch wrapper (`services/api.ts`) |

---

## Brand (Non-Negotiable)

Primary color is **deep green `#065f46`** — never orange. All tokens in `constants/theme.ts`.

---

## For AI Agents

**Read `instructions.md` first.** It is the single source of truth and covers:
- Complete annotated file map
- Design system tokens
- API service methods with correct signatures
- Icon rules (Ionicons, not emoji)
- Coding patterns
- User roles
- What is and is not built
- Common pitfalls

**Current state summary (as of latest session):**

- All navigation and UI icons use `@expo/vector-icons/Ionicons` — never emoji for icons
- All screens fetch live data from MongoDB via `services/api.ts` — no static mock arrays remain
- Delivery dashboard is live: connected to `GET /api/v1/delivery/orders` via `deliveryApi`
- FPO API now exists in web app (`/api/v1/fpos` and `/api/v1/fpos/[id]`)
- `app.json` has iOS permission usage descriptions and `privacyPolicyUrl`
- `eas.json` has complete `submit` section with real Apple credentials
- EAS project ID: `8f719d88-8a8b-4c8b-9924-28ee61fe36b0`, owner: `demigod-v`
- TypeScript: zero errors (`npx tsc --noEmit`)
- `.env.local` exists pointing to `http://localhost:3000` for local development
- Production API default is `https://fr3sh.in` (baked in when no env var set)

---

## Project Structure

```
app/          Expo Router screens (file path = route)
components/   ProductCard.tsx, Icon.tsx, themed helpers
constants/    theme.ts (design tokens) + data.ts (interfaces + CATEGORIES)
context/      UserContext (auth) + CartContext (cart)
services/     api.ts — every API call in one place
```

---

## Running

```bash
npx expo start          # Expo Go (scan QR)
npx expo run:ios        # iOS simulator
npx expo run:android    # Android emulator
```

## App Store / EAS Build

```bash
eas build --platform ios --profile production   # build IPA
eas submit --platform ios                        # submit to App Store Connect
```

Apple ID: `priyatham002@gmail.com` · Team: `4477RCBN82` · ASC App ID: `6780585194`
