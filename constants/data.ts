export interface Category {
  id: string; name: string; icon: string; color: string;
}
export interface Product {
  id: string; name: string; description: string;
  price: number; originalPrice?: number; image: string;
  category: string; rating: number; reviews: number;
  badge?: string; isVeg?: boolean; deliveryTime?: string; discount?: number;
}
export interface CartItem extends Product { quantity: number; }

export interface Order {
  id: string; date: string; items: string[];
  total: number; status: 'delivered' | 'processing' | 'cancelled';
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Groceries', icon: '🛒', color: '#E8F5E9' },
  { id: '2', name: 'Fruits', icon: '🍎', color: '#FFF3E0' },
  { id: '3', name: 'Dairy', icon: '🥛', color: '#E3F2FD' },
  { id: '4', name: 'Snacks', icon: '🍿', color: '#FCE4EC' },
  { id: '5', name: 'Beverages', icon: '☕', color: '#F3E5F5' },
  { id: '6', name: 'Bakery', icon: '🍞', color: '#FFF8E1' },
  { id: '7', name: 'Meat', icon: '🥩', color: '#FFEBEE' },
  { id: '8', name: 'Frozen', icon: '🧊', color: '#E1F5FE' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1', name: 'Farm Fresh Strawberries',
    description: 'Hand-picked, sun-ripened strawberries from local farms. Rich in antioxidants and bursting with natural sweetness.',
    price: 149, originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    category: 'Fruits', rating: 4.8, reviews: 324,
    badge: 'Best Seller', isVeg: true, deliveryTime: '12 mins', discount: 25,
  },
  {
    id: '2', name: 'Organic Whole Milk',
    description: 'Creamy, full-fat organic milk from grass-fed cows. No added hormones or antibiotics.',
    price: 89, originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    category: 'Dairy', rating: 4.6, reviews: 218,
    badge: 'Organic', isVeg: true, deliveryTime: '10 mins', discount: 10,
  },
  {
    id: '3', name: 'Artisan Sourdough Bread',
    description: 'Slow-fermented sourdough with a crispy crust and chewy interior. Baked fresh every morning.',
    price: 129, originalPrice: 149,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
    category: 'Bakery', rating: 4.9, reviews: 456,
    badge: 'Fresh Today', isVeg: true, deliveryTime: '15 mins', discount: 13,
  },
  {
    id: '4', name: 'Mixed Nuts & Seeds',
    description: 'Premium blend of cashews, almonds, walnuts and pumpkin seeds. Perfect healthy snack.',
    price: 299, originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1563412885536-40a3fb1d2e97?w=400',
    category: 'Snacks', rating: 4.7, reviews: 189,
    badge: 'Premium', isVeg: true, deliveryTime: '10 mins', discount: 25,
  },
  {
    id: '5', name: 'Cold Brew Coffee',
    description: 'Smooth, low-acid cold brew steeped for 20 hours. Ready to drink straight or over ice.',
    price: 199, originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'Beverages', rating: 4.5, reviews: 302,
    badge: 'New', isVeg: true, deliveryTime: '8 mins', discount: 20,
  },
  {
    id: '6', name: 'Baby Spinach Bundle',
    description: 'Tender, triple-washed baby spinach leaves. Ready to eat salad greens.',
    price: 49, originalPrice: 69,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    category: 'Groceries', rating: 4.4, reviews: 127,
    isVeg: true, deliveryTime: '10 mins', discount: 29,
  },
  {
    id: '7', name: 'Greek Yogurt',
    description: 'Thick, creamy Greek-style yogurt with live cultures. High protein, low sugar.',
    price: 119, originalPrice: 139,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    category: 'Dairy', rating: 4.6, reviews: 245,
    badge: 'Probiotic', isVeg: true, deliveryTime: '12 mins', discount: 14,
  },
  {
    id: '8', name: 'Avocados (Pack of 3)',
    description: 'Hand-selected Hass avocados at perfect ripeness. Creamy and nutrient-dense.',
    price: 179, originalPrice: 219,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
    category: 'Fruits', rating: 4.7, reviews: 389,
    badge: 'Ripe & Ready', isVeg: true, deliveryTime: '10 mins', discount: 18,
  },
];

export const ORDERS: Order[] = [
  { id: 'FR3SH-001', date: '15 Mar 2026', items: ['Strawberries', 'Organic Milk', 'Sourdough Bread'], total: 367, status: 'delivered' },
  { id: 'FR3SH-002', date: '10 Mar 2026', items: ['Mixed Nuts', 'Cold Brew Coffee'], total: 498, status: 'delivered' },
  { id: 'FR3SH-003', date: '18 Mar 2026', items: ['Greek Yogurt', 'Baby Spinach', 'Avocados'], total: 347, status: 'processing' },
];
