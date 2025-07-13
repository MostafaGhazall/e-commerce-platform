import { create } from "zustand";
import { Product } from "../types/Product";
import { fetchAllProducts } from "../services/productService";

/* ─────────────────────────────────────────────── */
/* Zustand store                                   */
/* ─────────────────────────────────────────────── */
interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  searchQuery: string;
  categoryFilter: string;  // holds category slug
  sortOption: string;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (slug: string) => void;
  setSortOption: (option: string) => void;
  loadProducts: () => Promise<void>;
  filterProducts: () => void;
  sortProducts: (option: string, productsToSort?: Product[]) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  loading: false,
  searchQuery: "",
  categoryFilter: "",
  sortOption: "",

  /* ---------- search / category / sort setters ---------- */
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterProducts();
  },

  setCategoryFilter: (slug) => {
    set({ categoryFilter: slug });
    get().filterProducts();
  },

  setSortOption: (option) => {
    set({ sortOption: option });
    get().sortProducts(option);
  },

  /* ---------- load products ---------- */
  loadProducts: async () => {
    set({ loading: true });
    try {
      const products = await fetchAllProducts();
      set({ products });
    } catch (error) {
      console.error("Failed to load products:", error);
      set({ products: [] });
    } finally {
      get().filterProducts();
      set({ loading: false });
    }
  },

  /* ---------- filter and sort ---------- */
  filterProducts: () => {
    const { products, searchQuery, categoryFilter, sortOption } = get();
    const q = searchQuery.toLowerCase();

    let filtered = products.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesCat = categoryFilter
        ? p.category?.slug === categoryFilter
        : true;
      return matchesName && matchesCat;
    });

    get().sortProducts(sortOption, filtered);
  },

  sortProducts: (option, productsToSort = get().filteredProducts) => {
    let sorted = [...productsToSort];

    if (option === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (option === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (option === "alpha")
      sorted.sort((a, b) => a.name.localeCompare(b.name));

    set({ filteredProducts: sorted });
  },

  /* ---------- reset ---------- */
  resetFilters: () => {
    set({ searchQuery: "", categoryFilter: "", sortOption: "" });
    get().filterProducts();
  },
}));
