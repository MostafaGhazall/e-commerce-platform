export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];       // Multiple images
  stock: number;
  rating: number;
  reviews: ProductReview[];
  category: string;
  sizes?: string[];
  colors?: {
    name: string;              // e.g., "Dark Green"
    value: string;             // e.g., "#006400"
    images?: string[];         // optional array of image paths for that color
  }[];      // Optional color variations (e.g., ['black', 'white'])
}

export interface ProductReview {
  comment: string;
  name: string;
  rating: number;
  date: string;
}