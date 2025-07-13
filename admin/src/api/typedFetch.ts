import adminApi from "@/api/axios";

/** Axios ⇢ plain payload (thanks to response interceptor) */
export const typedGet = <T>(
  url: string,
  cfg?: Parameters<typeof adminApi.get>[1]
) => adminApi.get<T, T>(url, cfg);
