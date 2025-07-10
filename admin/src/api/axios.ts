/* Shared axios instance + response interceptor
   -------------------------------------------- */

import axios from "axios";

/** Server envelopes all JSON in this shape */
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: unknown;
  error?: string;
}

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

/* ───── unwrap ───── */
adminApi.interceptors.response.use(
  ({ data }) => {
    if (data && typeof data === "object" && "ok" in data) {
      const payload = data as ApiResponse<unknown>;

      /* handle server-side error flag */
      if (!payload.ok) {
        return Promise.reject(
          new Error(payload.error ?? "Unknown API error"),
        );
      }

      /* keep the envelope when it contains `meta` (lists / pagination) */
      if ("meta" in payload) {
        return payload;                    
      }

      /* single-resource endpoints → unwrap */
      return payload.data;                 // e.g. GET /admin/orders/:id
    }

    /* third-party / plain responses */
    return data;
  },
  (error) => Promise.reject(error),
);
export default adminApi;
