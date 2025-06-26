import { create } from "zustand";
import { Product } from "../types/Product";
import { getAllProducts } from "../services/indexedDB";
import {
  getProductsFromLocalStorage,
  saveProductsToLocalStorage,
} from "../services/localStorage";

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  searchQuery: string;
  categoryFilter: string;
  sortOption: string;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
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

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterProducts();
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
    get().filterProducts();
  },

  setSortOption: (option) => {
    set({ sortOption: option });
    get().sortProducts(option);
  },

  loadProducts: async () => {
    set({ loading: true });
    try {
      const products = await getAllProducts();
      set({ products });
      saveProductsToLocalStorage(products);
    } catch (error) {
      console.warn("IndexedDB failed. Falling back to localStorage.", error);
      const fallbackProducts = getProductsFromLocalStorage();
      set({ products: fallbackProducts });
    } finally {
      get().filterProducts();
      set({ loading: false });
    }
  },

  filterProducts: () => {
    const { products, searchQuery, categoryFilter, sortOption } = get();
    const lowerQuery = searchQuery.toLowerCase();

    let filtered = products.filter((product) => {
      const matchName = product.name.toLowerCase().includes(lowerQuery);
      const matchCategory = categoryFilter
        ? product.category.toLowerCase() === categoryFilter.toLowerCase()
        : true; // No category filter applied

      // Both searchQuery AND categoryFilter must match
      return matchName && matchCategory;
    });

    // Sort
    if (sortOption === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "alpha") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    set({ filteredProducts: filtered });
  },

  sortProducts: (option, productsToSort = get().filteredProducts) => {
    let sorted = [...productsToSort];

    if (option === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (option === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (option === "alpha") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    set({ filteredProducts: sorted });
  },

  resetFilters: () => {
    set({
      searchQuery: "",
      categoryFilter: "",
      sortOption: "",
    });
    get().filterProducts();
  },
}));
