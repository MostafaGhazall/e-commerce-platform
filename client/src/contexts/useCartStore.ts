import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/CartItem";

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        const existing = get().cart.find(
          (i) =>
            i.id === item.id &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.id === item.id &&
              i.size === item.size &&
              i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },

      removeFromCart: (id, size, color) => {
        set({
          cart: get().cart.filter(
            (i) => i.id !== id || i.size !== size || i.color !== color
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      updateQuantity: (id, quantity, size, color) => {
        if (quantity <= 0) {
          set({
            cart: get().cart.filter(
              (i) => !(i.id === id && i.size === size && i.color === color)
            ),
          });
        } else {
          set({
            cart: get().cart.map((i) =>
              i.id === id && i.size === size && i.color === color
                ? { ...i, quantity }
                : i
            ),
          });
        }
      },
    }),
    {
      name: "cart-storage", // key in localStorage
    }
  )
);
