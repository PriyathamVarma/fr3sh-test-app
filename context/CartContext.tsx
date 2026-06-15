import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  farmerId?: string;
  farmerName?: string;
  unit?: string;
  quantity: number;
}

interface CartState { items: CartItem[]; ready: boolean; }

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT'; payload: string }
  | { type: 'DECREMENT'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  ready: boolean;
  addItem: (p: Omit<CartItem, 'quantity'>) => void;
  addToCart: (p: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  cartCount: number;
  subtotal: number;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.payload, ready: true };
    case 'ADD_ITEM': {
      const ex = state.items.find(i => i.id === action.payload.id);
      if (ex) return { ...state, items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i) };
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'INCREMENT': return { ...state, items: state.items.map(i => i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i) };
    case 'DECREMENT': {
      const item = state.items.find(i => i.id === action.payload);
      if (item?.quantity === 1) return { ...state, items: state.items.filter(i => i.id !== action.payload) };
      return { ...state, items: state.items.map(i => i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i) };
    }
    case 'CLEAR_CART': return { ...state, items: [] };
    default: return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], ready: false });

  useEffect(() => {
    AsyncStorage.getItem('fr_cart').then(raw => {
      dispatch({ type: 'HYDRATE', payload: raw ? JSON.parse(raw) : [] });
    });
  }, []);

  useEffect(() => {
    if (state.ready) AsyncStorage.setItem('fr_cart', JSON.stringify(state.items));
  }, [state.items, state.ready]);

  const addItem = (p: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: p });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const increment = (id: string) => dispatch({ type: 'INCREMENT', payload: id });
  const decrement = (id: string) => dispatch({ type: 'DECREMENT', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const getItemQuantity = (id: string) => state.items.find(i => i.id === id)?.quantity || 0;

  return (
    <CartContext.Provider value={{
      items: state.items, ready: state.ready,
      addItem, addToCart: addItem,
      removeItem, increment, decrement, clearCart,
      totalItems, totalPrice, cartCount: totalItems, subtotal: totalPrice,
      getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
