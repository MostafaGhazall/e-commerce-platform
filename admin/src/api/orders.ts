import axios from "axios";
import type { AdminOrder } from "@/types/adminOrder";

/* ────────────────────────────────────────────────────────── */
/* Axios instance                                            */
/* ────────────────────────────────────────────────────────── */
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/* ────────────────────────────────────────────────────────── */
/* Types                                                     */
/* ────────────────────────────────────────────────────────── */
export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

/** Generic `{ ok, data }` envelope the backend returns */
interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

/** List endpoint envelope */
export interface OrdersPage<T = AdminOrder> {
  ok: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/* ────────────────────────────────────────────────────────── */
/* API wrappers                                              */
/* ────────────────────────────────────────────────────────── */
export const fetchOrders = async (page = 1, pageSize = 50) => {
  const { data } = await adminApi.get<OrdersPage>(
    "/api/admin/orders",
    { params: { page, pageSize } },
  );
  return data;            // <- already { ok, data, meta }
};

export const fetchOrderById = async (id: string) => {
  const { data } = await adminApi.get<ApiResponse<AdminOrder>>(
    `/api/admin/orders/${id}`,
  );
  return data.data;       // <- unwrap the inner `data`
};

export const patchStatus = (id: string, status: OrderStatus) =>
  adminApi.patch(`/api/admin/orders/${id}/status`, { status });

export default adminApi;
