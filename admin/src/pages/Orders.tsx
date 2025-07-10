import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { fetchOrders, patchStatus, OrderStatus } from "@/api/orders";
import type { AdminOrder } from "@/types/adminOrder";

/* ────────────────────────────────────────────────────────── */
/*  Narrow row type for the table                            */
/* ────────────────────────────────────────────────────────── */
type OrderLite = Pick<
  AdminOrder,
  "id" | "createdAt" | "total" | "status" | "paymentMethod"
>;

const STATUSES: OrderStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

export default function Orders() {
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null); // disables <select> while patching

  /* ─────────────────────── fetch once ────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const page = await fetchOrders(1, 50);      // { ok, data, meta }
        const rows: OrderLite[] = page.data.map((o) => ({
          ...o,
          total: Number(o.total),                   // coerce Decimal → number
        }));
        setOrders(rows);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;

  /* Locale-aware EGP formatter */
  const fmtEGP = (v: number) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(v);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Payment</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left"></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-2">
                {new Date(o.createdAt).toLocaleDateString()}
              </td>

              <td className="p-2">{fmtEGP(o.total)}</td>
              <td className="p-2">{o.paymentMethod}</td>

              {/* ───── status cell ───── */}
              <td className="p-2">
                <select
                  value={o.status}
                  disabled={savingId === o.id}
                  onChange={async (e) => {
                    const next = e.target.value as OrderStatus;
                    if (next === o.status) return;

                    /* optimistic update */
                    const prev = o.status;
                    setOrders((prevState) =>
                      prevState.map((row) =>
                        row.id === o.id ? { ...row, status: next } : row
                      )
                    );
                    setSavingId(o.id);

                    try {
                      await patchStatus(o.id, next);
                      toast.success("Status updated");
                    } catch (err) {
                      /* roll back */
                      setOrders((prevState) =>
                        prevState.map((row) =>
                          row.id === o.id ? { ...row, status: prev } : row
                        )
                      );
                      toast.error("Update failed");
                      console.error(err);
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  className="border px-2 py-1 rounded disabled:opacity-60"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>

              <td className="p-2">
                <Link
                  to={`/orders/${o.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
