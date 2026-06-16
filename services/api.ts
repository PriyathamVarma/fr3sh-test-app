import AsyncStorage from '@react-native-async-storage/async-storage';

// Production default for App Store builds. Override EXPO_PUBLIC_API_URL for local
// development, staging, or test devices.
const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://fr3sh.in').replace(/\/$/, '');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem('fr_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out. Please check your connection and try again.');
    }
    throw new ApiError(0, err?.message ?? 'Network request failed. Please check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok || data?.success === false) {
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`);
  }

  if (!data) {
    throw new ApiError(res.status, 'Server returned an invalid response');
  }

  return data;
}

type ApiListEnvelope<T> = T[] | {
  items?: T[];
  data?: T[];
  results?: T[];
  products?: T[];
  orders?: T[];
  transactions?: T[];
  badges?: T[];
  fpos?: T[];
  meta?: any;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

function listFrom<T>(value: ApiListEnvelope<T> | null | undefined, keys: string[] = ['items']): T[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of keys) {
    const candidate = (value as Record<string, unknown>)[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return [];
}

function entityId(item: any): string {
  return String(item?.id ?? item?._id ?? '');
}

function withEntityId<T extends Record<string, any>>(item: T): T & { id: string; _id: string } {
  const id = entityId(item);
  return { ...item, id, _id: id || String(item?._id ?? '') };
}

function compactQuery(params?: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { name: string; email: string; password: string; type: string }) =>
    request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; message: string; data: UserProfile & { token?: string }; user?: UserProfile; token?: string }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  logout: () =>
    request('/api/v1/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ success: boolean; data?: UserProfile; user?: UserProfile }>('/api/v1/auth/me'),

  sendResetOtp: (email: string) =>
    request('/api/v1/auth/send-reset-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyResetOtp: (body: { email: string; otp: string; newPassword: string }) =>
    request('/api/v1/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: { category?: string; page?: number; limit?: number; search?: string; q?: string }) => {
    const query = { ...params };
    if (query.search && !query.q) {
      query.q = query.search;
    }
    delete query.search;
    const qs = compactQuery(query as any);
    return request<ProductsResponse>(`/api/v1/products${qs ? `?${qs}` : ''}`);
  },

  detail: (id: string) =>
    request<{ success: boolean; data: ProductDetail }>(`/api/v1/products/${id}`),

  byFarmer: (farmerId: string) =>
    request<{ success: boolean; data: { items: ProductDetail[] } }>(`/api/v1/products/by-farmer/${farmerId}`),
};

// ─── Farmers ──────────────────────────────────────────────────────────────────

export const farmersApi = {
  list: async (params?: { page?: number; limit?: number; q?: string; place?: string; district?: string; state?: string; sort?: string }) => {
    const qs = compactQuery(params as any);
    const res = await request<{ success: boolean; message?: string; data?: any }>(`/api/v1/farmers${qs ? `?${qs}` : ''}`);
    const items = listFrom<FarmerProfile>(res.data, ['items', 'farmers', 'data']).map(withEntityId);
    return {
      ...res,
      data: {
        items,
        meta: res.data?.meta ?? {
          total: safeNumber(res.data?.total, items.length),
          page: safeNumber(params?.page, 1),
          limit: safeNumber(params?.limit, items.length),
          totalPages: safeNumber(res.data?.totalPages, 1),
        },
        source: res.data?.source,
      },
    } as FarmersResponse;
  },

  detail: (id: string) =>
    request<{ success: boolean; data: FarmerProfile }>(`/api/v1/farmers/${id}`),

  byProfileId: (profileId: string) =>
    request<{ success: boolean; data: { farmerId: string } }>(`/api/v1/farmers?profileId=${profileId}`),

  dashboard: () =>
    request<{ success: boolean; data: any }>('/api/v1/farmers/dashboard'),
};

// ─── Harvests ─────────────────────────────────────────────────────────────────

export const harvestsApi = {
  list: (params?: { status?: string; page?: number }) => {
    const qs = compactQuery(params as any);
    return request<HarvestsResponse>(`/api/v1/harvests${qs ? `?${qs}` : ''}`);
  },

  detail: (id: string) =>
    request<{ success: boolean; data: Harvest }>(`/api/v1/harvests/${id}`),

  prebook: (id: string, body: { qty: number; buyerId?: string; buyerPhone?: string; estimatedTotal: number }) =>
    request(`/api/v1/harvests/${id}/prebook`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  buyerOrders: async (buyerId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/farmers/orders/voice/buyerOrders?buyerId=${encodeURIComponent(buyerId)}`
    );
    const orders = listFrom<Order>(res.data, ['orders', 'items', 'data']).map(withEntityId);
    return { ...res, data: orders };
  },

  orderDetail: (id: string) =>
    request<{ success: boolean; data: Order }>(`/api/v1/orders/${id}`),

  create: (body: CreateOrderBody) =>
    request('/api/v1/farmers/orders/voice/buyerOrders', { method: 'POST', body: JSON.stringify(body) }),

  prebookings: async (buyerId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/prebookings?buyerId=${encodeURIComponent(buyerId)}`
    );
    const prebookings = listFrom<any>(res.data, ['items', 'prebookings', 'data']).map(withEntityId);
    return { ...res, data: prebookings };
  },
};

// ─── FPOs ─────────────────────────────────────────────────────────────────────

export const fposApi = {
  list: (params?: { q?: string }) => {
    const qs = compactQuery(params as any);
    return request<{ success: boolean; data: { fpos: FPO[]; total: number } }>(`/api/v1/fpos${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) => request<{ success: boolean; data: FPO }>(`/api/v1/fpos/${id}`),
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletApi = {
  balance: async (userId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/wallet?userId=${encodeURIComponent(userId)}`
    );
    return {
      ...res,
      data: {
        wallet: res.data?.wallet,
        balance: safeNumber(res.data?.balance ?? res.data?.wallet?.balance, 0),
      },
    };
  },

  transactions: async (userId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/wallet/transactions?userId=${encodeURIComponent(userId)}`
    );
    const transactions = listFrom<WalletTransaction>(res.data, ['transactions', 'items', 'data'])
      .map((transaction) => ({
        ...withEntityId(transaction),
        balanceAfter: safeNumber((transaction as any).balanceAfter ?? (transaction as any).runningBalance, 0),
      }));
    return { ...res, data: transactions, wallet: res.data?.wallet, meta: res.data?.meta };
  },
};

// ─── Referral ─────────────────────────────────────────────────────────────────

export const referralApi = {
  stats: async (userId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/referral?userId=${encodeURIComponent(userId)}`
    );
    return {
      ...res,
      data: {
        totalReferrals: safeNumber(res.data?.totalReferrals ?? res.data?.stats?.totalReferrals, 0),
        rewardsCredited: safeNumber(res.data?.rewardsCredited ?? res.data?.stats?.rewardedCount, 0),
        totalEarned: safeNumber(res.data?.totalEarned ?? res.data?.stats?.totalEarned, 0),
        referralCode: res.data?.referralCode,
        referralLink: res.data?.referralLink,
      },
    };
  },
};

// ─── Badges ───────────────────────────────────────────────────────────────────

export const badgesApi = {
  list: async (userId: string) => {
    const res = await request<{ success: boolean; data?: any }>(
      `/api/v1/badges?userId=${encodeURIComponent(userId)}`
    );
    const badges = listFrom<any>(res.data, ['badges', 'items', 'data'])
      .filter((badge) => badge?.earned !== false)
      .map((badge) => ({
        ...badge,
        badgeId: String(badge.badgeId ?? badge.id ?? ''),
        earnedAt: badge.earnedAt ?? '',
      }))
      .filter((badge) => badge.badgeId);
    return { ...res, data: badges };
  },
};

// ─── Community ────────────────────────────────────────────────────────────────

export const communityApi = {
  list: async (params?: { location?: string }) => {
    const qs = compactQuery(params as any);
    const res = await request<{ success: boolean; data?: any }>(`/api/v1/community${qs ? `?${qs}` : ''}`);
    const groups = listFrom<CommunityGroup>(res.data, ['items', 'groups', 'data'])
      .map((group) => ({
        ...withEntityId(group),
        joinCode: String((group as any).joinCode ?? '').toUpperCase(),
      }));
    return { ...res, data: groups, meta: res.data?.meta };
  },
  detail: (id: string) =>
    request<{ success: boolean; data: CommunityGroup }>(`/api/v1/community/${id}`),
  join: (id: string, joinCode: string) =>
    request(`/api/v1/community/${id}/join`, { method: 'POST', body: JSON.stringify({ joinCode }) }),
};

// ─── Delivery ─────────────────────────────────────────────────────────────────

export const deliveryApi = {
  orders: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = compactQuery(params as any);
    return request<{ success: boolean; data: { orders: Order[]; page: number; limit: number; total: number; totalPages: number } }>(
      `/api/v1/delivery/orders${qs ? `?${qs}` : ''}`
    );
  },
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const userApi = {
  update: (body: Partial<UserProfile>) =>
    request('/api/v1/user/update', { method: 'PATCH', body: JSON.stringify(body) }),
};

// ─── Subscription ─────────────────────────────────────────────────────────────

export const subscriptionApi = {
  status: (userId: string) =>
    request<{ success: boolean; data: any }>(`/api/v1/subscription?userId=${userId}`),
  subscribe: (body: { plan: 'monthly' | 'annual'; userId?: string }) =>
    request('/api/v1/subscription', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  type: 'Farmer' | 'Buyer' | 'Logistics Provider' | 'FPO' | 'Admin';
  photo?: string;
  bio?: string;
  village?: string;
  district?: string;
  state?: string;
  isSubscribed?: boolean;
  subscription?: { active: boolean; plan: string };
}

export interface ProductDetail {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  mrp?: number;
  originalPrice?: number;
  discount?: number;
  stockQty?: number;
  category?: string;
  farmerId: string;
  farmerName?: string;
  farmerLocation?: string;
  images?: string[];
  image?: string;
  rating?: number;
  reviews?: number;
  reviewsCount?: number;
  badge?: string;
  status?: 'active' | 'inactive' | 'draft';
  unit?: string;
  isOrganic?: boolean;
  isVeg?: boolean;
  deliveryTime?: string;
}

export interface ProductsResponse {
  success: boolean;
  message?: string;
  data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    products: ProductDetail[];
  };
}

export interface FarmerProfile {
  id?: string;
  _id: string;
  name: string;
  fatherName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  whatsappNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farmName?: string;
  farmArea?: string;
  totalLandArea?: number | string;
  ownedLandArea?: number | string;
  leasedLandArea?: number | string;
  irrigationType?: string;
  soilType?: string;
  waterSource?: string;
  organicCertified?: boolean;
  organicCertificationDetails?: string;
  farmingExperienceYears?: number | string;
  category?: string;
  subCategories?: string[];
  seasonalCrops?: string[];
  perennialCrops?: string[];
  delivery?: boolean;
  deliveryRadiusKm?: number;
  deliveryPinCodes?: string[];
  pickupLocation?: { address?: string; lat?: number; lng?: number };
  avatar?: string;
  photo?: string;
  photoPath?: string;
  farmImages?: string[];
  bio?: string;
  about?: string;
  experienceDescription?: string;
  farmingMethods?: string[];
  certifications?: string[];
  awards?: string[];
  socialMedia?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
  };
  rating?: number;
  reviewsCount?: number;
  onTimeDeliveryRate?: number;
  repeatCustomerRate?: number;
  last30daysSales?: number;
  active?: boolean;
  availableForOrders?: boolean;
  verified?: boolean;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'rejected';
  profileId: string;
}

export interface FarmersResponse {
  success: boolean;
  data: {
    items: FarmerProfile[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    source?: string;
  };
}

export interface Harvest {
  _id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  description?: string;
  expectedQty: number;
  totalPreBooked: number;
  pricePerUnit: number;
  unit: string;
  harvestDate: string;
  status: 'draft' | 'open' | 'fully_booked' | 'harvested' | 'cancelled';
  location?: string;
  images?: string[];
}

export interface HarvestsResponse {
  success: boolean;
  data: {
    items: Harvest[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface Order {
  _id: string;
  id?: string;
  buyerId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  deliveryAddress?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  farmerId: string;
  image?: string;
}

export interface CreateOrderBody {
  buyerId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  deliveryAddress?: string;
  deliveryFee?: number;
  paymentMethod?: string;
}

export interface FPO {
  _id: string;
  name: string;
  district: string;
  state?: string;
  description?: string;
  farmerCount?: number;
  photo?: string;
  productCount?: number;
  established?: string;
  certifications?: string[];
}

export interface WalletTransaction {
  _id: string;
  id?: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  rewardsCredited: number;
  totalEarned?: number;
  referralCode?: string;
  referralLink?: string;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
  earned?: boolean;
}

export interface CommunityGroup {
  _id: string;
  id?: string;
  name: string;
  type: string;
  location: string;
  joinCode: string;
  memberCount?: number;
}

export { ApiError };
