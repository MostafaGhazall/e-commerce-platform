import { useQuery } from "@tanstack/react-query";
import adminApi from "@/api/axios";
import { Category } from "@/types/category";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => adminApi.get<Category[], Category[]>("/api/categories"),
    staleTime: 10 * 60 * 1000,
  });
