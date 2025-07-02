import { create } from "zustand";
import api from "../api/axios";
import { Product, ProductReview } from "../types/Product";

export const fetchAllProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products");
  return data;
};

export const addReviewToProduct = async (
  productId: string,
  review: {
    comment: string;
    name: string;
    rating: number;
  }
): Promise<ProductReview> => {
  const { data } = await api.post<ProductReview>(
    `/products/${productId}/reviews`,
    review
  );
  return data;
};

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
      const products = await fetchAllProducts();
      set({ products });
    } catch (error) {
      console.error("Failed to load products from API:", error);
      set({ products: [] });
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
