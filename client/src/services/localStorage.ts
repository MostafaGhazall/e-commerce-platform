import { Product } from '../types/Product';

const STORAGE_KEY = 'fallback_products';

export const saveProductsToLocalStorage = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const getProductsFromLocalStorage = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
