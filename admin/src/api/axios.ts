/* ------------------------------------------------------------------ */
/* Shared axios instance + response interceptor                       */
/* ------------------------------------------------------------------ */

import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";

/* ─────── Server envelope shape ─────── */
export interface ApiResponse<T, M = unknown> {
  ok: boolean;
  data: T;
  meta?: M;          // e.g. { total, page, pageSize }
  error?: string;
}

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

/* ------------------------------------------------------------------ */
/* Unwrap payloads + global error handler                             */
/* ------------------------------------------------------------------ */
adminApi.interceptors.response.use(
  /* ✅ onSuccess ---------------------------------------------------- */
  ({ data }: AxiosResponse) => {
    // 1) ­Enveloped responses from our server
    if (data && typeof data === "object" && "ok" in data) {
      const payload = data as ApiResponse<unknown>;

      // explicit failure sent by API controller
      if (!payload.ok) {
        return Promise.reject(
          new Error(payload.error ?? "Unknown API error")
        );
      }

      // keep envelope when meta is present (lists / pagination)
      if ("meta" in payload && payload.meta !== undefined) {
        return payload;                        // { ok, data, meta }
      }

      // single-resource endpoint → unwrap down to the plain entity
      return payload.data;                     // e.g. GET /admin/products/:id
    }

    // 2) Plain (third-party) JSON
    return data;
  },

  /* ❌ onError ------------------------------------------------------ */
  (err: AxiosError<ApiResponse<never>>) => {
    // pick the most meaningful message we can find
    const msg =
      err.response?.data?.error ??
      err.message ??
      "Network error – please try again";

    /* One toast per distinct message */
    toast.error(msg, { id: msg });

    /* Re-throw so React-Query / callers can still handle it */
    return Promise.reject(err);
  }
);

export default adminApi;
