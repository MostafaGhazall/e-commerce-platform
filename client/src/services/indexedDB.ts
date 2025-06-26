import { openDB } from 'idb';
import type { Product } from '../types/Product';
import type { ProductReview } from "../types/Product";


const DB_NAME = 'ecommerce-db';
const DB_VERSION = 1;
const STORE_NAME = 'products';

export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const addProducts = async (products: Product[]) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  products.forEach((product) => {
    store.put(product);
  });

  await tx.done;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const db = await initDB();
  return await db.get(STORE_NAME, id);
};

export const addReviewToProduct = async (productId: string, review: ProductReview) => {
  const db = await initDB();
  const product = await db.get(STORE_NAME, productId);
  if (!product) return;

  product.reviews = [...(product.reviews || []), review];
  await db.put(STORE_NAME, product);
};


