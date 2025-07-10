import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchOrderById } from "@/api/orders";
import type { AdminOrder, AdminOrderItem } from "@/types/adminOrder";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      try {
        /* raw is already AdminOrder */
        const raw = await fetchOrderById(id);

        /* Coerce Decimal → number, if needed */
        const parsed: AdminOrder = {
          ...raw,
          total: Number(raw.total),
          items: raw.items.map((i) => ({ ...i, price: Number(i.price) })),
        };

        if (mounted) setOrder(parsed);
      } catch (err) {
        console.error("Failed to load order:", err);
        toast.error("Failed to load order", { id: "order-load-error" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  if (!order) {
    return <p className="p-6 text-center">Order not found.</p>;
  }

  // Locale‐aware currency formatting
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/orders" className="text-sm text-blue-600 hover:underline">
        &larr; Back
      </Link>

      <h1 className="text-2xl font-bold mt-3 mb-6">Order {order.id}</h1>

      <section className="space-y-1 text-sm mb-6">
        <p>
          <b>Date:</b> {new Date(order.createdAt).toLocaleString()}
        </p>
        <p>
          <b>Status:</b> {order.status}
        </p>
        <p>
          <b>Total:</b> {formatCurrency(order.total)}
        </p>
        <p>
          <b>Payment:</b> {order.paymentMethod}
        </p>
      </section>

      <h2 className="font-semibold mb-2">Items</h2>
      {order.items.length === 0 ? (
        <p className="text-center text-gray-500">No items in this order.</p>
      ) : (
        <div className="space-y-3">
          {order.items.map((item: AdminOrderItem) => (
            <div key={item.id} className="flex gap-4 border p-3 rounded">
              <img
                src={item.imageUrl ?? "/images/fallback.png"}
                onError={(e) => {
                  e.currentTarget.src = "/images/fallback.png";
                }}
                alt={`${item.product.name}${
                  item.colorName ? ` — ${item.colorName}` : ""
                }`}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="text-sm">
                <p className="font-medium">{item.product.name}</p>
                <p>
                  Qty {item.quantity} — {formatCurrency(item.price)}
                </p>
                {item.size && <p>Size: {item.size}</p>}
                {item.color && (
                  <p className="flex items-center gap-1">
                    Colour:
                    <span
                      className="inline-block w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.color }}
                      title={item.colorName}
                    />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
