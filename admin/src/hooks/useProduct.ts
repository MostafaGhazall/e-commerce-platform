import { useQuery } from "@tanstack/react-query";
import adminApi from "@/api/axios";
import { ProductDto } from "@/types/product";

export const useProduct = (id?: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => adminApi.get<ProductDto, ProductDto>(`/api/admin/products/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
