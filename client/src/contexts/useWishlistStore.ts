import { create } from "zustand";
import axios from "../api/axios";
import { Product } from "../types/Product";

interface WishlistState {
  wishlist: Product[];
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  fetchWishlist: async () => {
    try {
      const { data } = await axios.get("/wishlist", { withCredentials: true });
      set({ wishlist: data });
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      set({ wishlist: [] });
    }
  },

  toggleWishlist: async (productId: string) => {
    const { isWishlisted, addToWishlist, removeFromWishlist } = get();
    if (isWishlisted(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      await axios.post("/wishlist", { productId }, { withCredentials: true });
      await get().fetchWishlist();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        await get().fetchWishlist(); // Already exists — still refresh
      } else {
        console.error("Add to wishlist failed", err);
      }
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      await axios.delete(`/wishlist/${productId}`, { withCredentials: true });
      await get().fetchWishlist();
    } catch (err) {
      console.error("Remove from wishlist failed", err);
    }
  },

  isWishlisted: (productId: string) =>
    get().wishlist.some((p) => p.id === productId),
}));
