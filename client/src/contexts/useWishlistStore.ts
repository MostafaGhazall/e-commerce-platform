import { create } from 'zustand';

interface WishlistItem {
  id: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  toggleWishlist: (id) => {
    const { wishlist } = get();
    const exists = wishlist.some((item) => item.id === id);
    set({
      wishlist: exists
        ? wishlist.filter((item) => item.id !== id)
        : [...wishlist, { id }],
    });
  },
  isWishlisted: (id) => get().wishlist.some((item) => item.id === id),
}));
