import api from "../api/axios";
import { Product, ProductReview } from "../types/Product";

/** Fetch the full product list from your backend */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/products");
  return data;
}

/** Post a review on a product */
export async function addReviewToProduct(
  productId: string,
  review: { comment: string; name: string; rating: number }
): Promise<ProductReview> {
  const { data } = await api.post<ProductReview>(
    `/products/${productId}/reviews`,
    review
  );
  return data;
}
