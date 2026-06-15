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
  { id: '1', name: 'Groceries', icon: 'basket-outline', color: '#E8F5E9' },
  { id: '2', name: 'Fruits', icon: 'nutrition-outline', color: '#FFF3E0' },
  { id: '3', name: 'Dairy', icon: 'water-outline', color: '#E3F2FD' },
  { id: '4', name: 'Snacks', icon: 'fast-food-outline', color: '#FCE4EC' },
  { id: '5', name: 'Beverages', icon: 'cafe-outline', color: '#F3E5F5' },
  { id: '6', name: 'Bakery', icon: 'restaurant-outline', color: '#FFF8E1' },
  { id: '7', name: 'Meat', icon: 'fish-outline', color: '#FFEBEE' },
  { id: '8', name: 'Frozen', icon: 'snow-outline', color: '#E1F5FE' },
];

export const PRODUCTS: Product[] = [];

export const ORDERS: Order[] = [];
