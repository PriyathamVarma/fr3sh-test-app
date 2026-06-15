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

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

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
    const qs = new URLSearchParams(query as any).toString();
    return request<ProductsResponse>(`/api/v1/products${qs ? `?${qs}` : ''}`);
  },

  detail: (id: string) =>
    request<{ success: boolean; data: ProductDetail }>(`/api/v1/products/${id}`),

  byFarmer: (farmerId: string) =>
    request<{ success: boolean; data: { items: ProductDetail[] } }>(`/api/v1/products/by-farmer/${farmerId}`),
};

// ─── Farmers ──────────────────────────────────────────────────────────────────

export const farmersApi = {
  list: (params?: { page?: number; limit?: number; q?: string; place?: string; district?: string; state?: string; sort?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<FarmersResponse>(`/api/v1/farmers${qs ? `?${qs}` : ''}`);
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
    const qs = new URLSearchParams(params as any).toString();
    return request<HarvestsResponse>(`/api/v1/harvests${qs ? `?${qs}` : ''}`);
  },

  detail: (id: string) =>
    request<{ success: boolean; data: Harvest }>(`/api/v1/harvests/${id}`),

  prebook: (id: string, body: { qty: number; buyerId?: string; buyerPhone?: string; estimatedTotal: number }) =>
    request(`/api/v1/harvests/${id}/prebook`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  buyerOrders: (buyerId: string) =>
    request<{ success: boolean; data: Order[] }>(`/api/v1/orders/${buyerId}`),

  orderDetail: (id: string) =>
    request<{ success: boolean; data: Order }>(`/api/v1/orders/details/${id}`),

  create: (body: CreateOrderBody) =>
    request('/api/v1/orders', { method: 'POST', body: JSON.stringify(body) }),

  prebookings: (buyerId: string) =>
    request<{ success: boolean; data: any[] }>(`/api/v1/prebookings?buyerId=${buyerId}`),
};

// ─── FPOs ─────────────────────────────────────────────────────────────────────

export const fposApi = {
  list: (params?: { q?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; data: { fpos: FPO[]; total: number } }>(`/api/v1/fpos${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) => request<{ success: boolean; data: FPO }>(`/api/v1/fpos/${id}`),
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletApi = {
  balance: (userId: string) =>
    request<{ success: boolean; data: { balance: number } }>(`/api/v1/wallet?userId=${userId}`),

  transactions: (userId: string) =>
    request<{ success: boolean; data: WalletTransaction[] }>(`/api/v1/wallet/transactions?userId=${userId}`),
};

// ─── Referral ─────────────────────────────────────────────────────────────────

export const referralApi = {
  stats: (userId: string) =>
    request<{ success: boolean; data: ReferralStats }>(`/api/v1/referral?referrerId=${userId}`),
};

// ─── Badges ───────────────────────────────────────────────────────────────────

export const badgesApi = {
  list: (userId: string) =>
    request<{ success: boolean; data: UserBadge[] }>(`/api/v1/badges?userId=${userId}`),
};

// ─── Community ────────────────────────────────────────────────────────────────

export const communityApi = {
  list: (params?: { location?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; data: CommunityGroup[] }>(`/api/v1/community${qs ? `?${qs}` : ''}`);
  },
  detail: (id: string) =>
    request<{ success: boolean; data: CommunityGroup }>(`/api/v1/community/${id}`),
  join: (id: string, joinCode: string) =>
    request(`/api/v1/community/${id}/join`, { method: 'POST', body: JSON.stringify({ joinCode }) }),
};

// ─── Delivery ─────────────────────────────────────────────────────────────────

export const deliveryApi = {
  orders: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
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
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  rewardsCredited: number;
  referralCode?: string;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
}

export interface CommunityGroup {
  _id: string;
  name: string;
  type: string;
  location: string;
  joinCode: string;
  memberCount?: number;
}

export { ApiError };
