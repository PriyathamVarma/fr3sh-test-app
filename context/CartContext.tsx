import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, CartItem } from '@/constants/data';

interface CartState { items: CartItem[]; }
type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT'; payload: string }
  | { type: 'DECREMENT'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  items: CartItem[];
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const ex = state.items.find(i => i.id === action.payload.id);
      if (ex) return { items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i) };
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM': return { items: state.items.filter(i => i.id !== action.payload) };
    case 'INCREMENT': return { items: state.items.map(i => i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i) };
    case 'DECREMENT': {
      const item = state.items.find(i => i.id === action.payload);
      if (item?.quantity === 1) return { items: state.items.filter(i => i.id !== action.payload) };
      return { items: state.items.map(i => i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i) };
    }
    case 'CLEAR_CART': return { items: [] };
    default: return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const addItem = (p: Product) => dispatch({ type: 'ADD_ITEM', payload: p });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const increment = (id: string) => dispatch({ type: 'INCREMENT', payload: id });
  const decrement = (id: string) => dispatch({ type: 'DECREMENT', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const getItemQuantity = (id: string) => state.items.find(i => i.id === id)?.quantity || 0;

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, increment, decrement, clearCart, totalItems, totalPrice, getItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
