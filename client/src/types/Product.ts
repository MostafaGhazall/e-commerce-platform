export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  sizes: string[];

  colors: {
    id: string;
    name: string;
    value: string;              // Hex value like "#006400"
    images: Image[];            // Images for this color variant
  }[];

  images: Image[];              // Main product images (outside color variations)

  reviews: ProductReview[];

  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
}

export interface ProductReview {
  id: string;
  comment: string;
  name: string;
  rating: number;
  createdAt: string;
}

