import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;       //  Hex or color code
  colorName?: string;   //  Human-readable name
  image?: string;       //  Product image URL
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  shipping: {
    name: string;
    email: string;
    address: string;
    city?: string;
    country?: string;
    region?: string;
    postalCode?: string;
    phone?: string;
    paymentMethod?: string;
  };
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'order-history-storage',
    }
  )
);
