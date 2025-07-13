import { useQuery } from "@tanstack/react-query";
import { typedGet } from "@/api/typedFetch";
import { ProductsResSchema, ProductsRes } from "@/schemas/products";

export function useProducts(page: number, limit = 20) {
  return useQuery<ProductsRes, Error>({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const body = await typedGet<unknown>("/api/admin/products", {
        params: { page, limit },
      });
      return ProductsResSchema.parse(body);      // runtime validation
    },

    /** 👇 v5 way to keep the previous page while the new one loads */
    placeholderData: (previous) => previous,

    staleTime: 30_000,                           // 30 s
  });
}
