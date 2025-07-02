import { create } from "zustand";
import axios from "../api/axios";
import { CartItem } from "../types/CartItem";

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  colorName?: string;
}

interface CartState {
  cart: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (item: AddToCartPayload) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],

  fetchCart: async () => {
    try {
      const res = await axios.get("/cart", { withCredentials: true });
      const items = res.data.items || [];
      const cartItems: CartItem[] = items.map((item: any) => {
        const fallbackImage =
          item.product.images?.[0]?.url || "/images/default-product.png";

        const variantImage =
          item.colorName &&
          item.product.colors?.find(
            (c: any) => c.name.toLowerCase() === item.colorName.toLowerCase()
          )?.images?.[0]?.url;

        return {
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          image: variantImage || fallbackImage, // ← use color image if found
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          colorName: item.colorName,
        };
      });
      set({ cart: cartItems });
    } catch (err) {
      console.error("Failed to fetch cart", err);
      set({ cart: [] });
    }
  },

  addToCart: async ({ productId, quantity, size, color, colorName }) => {
    try {
      await axios.post(
        "/cart",
        { productId, quantity, size, color, colorName },
        { withCredentials: true }
      );
      await useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await axios.delete(`/cart/${cartItemId}`, { withCredentials: true });
      await useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Remove from cart failed", err);
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      await axios.patch(
        `/cart/${cartItemId}`,
        { quantity },
        { withCredentials: true }
      );
      await useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Update quantity failed", err);
    }
  },

  clearCart: async () => {
    try {
      await axios.delete("/cart/clear/all", { withCredentials: true });
      set({ cart: [] });
    } catch (err) {
      console.error("Clear cart failed", err);
    }
  },
}));
