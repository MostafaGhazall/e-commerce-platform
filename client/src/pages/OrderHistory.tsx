import { useEffect, useState } from "react";
import axios from "axios";
import { Order } from "../types/OrderItem";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders", { withCredentials: true });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-500";
      case "shipped":
        return "text-blue-500";
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "w-1/4";
      case "shipped":
        return "w-1/2";
      case "delivered":
        return "w-full";
      case "cancelled":
        return "w-full bg-red-500";
      default:
        return "w-0";
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">{t("orders.loading")}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <img src="/images/no-order.png" alt="No Order" className="mx-auto mb-6 w-72 h-auto" />
        <h2 className="text-xl font-bold mb-4 text-gray-500">{t("orders.noOrdersFound")}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-[var(--primary-orange)]">
        {t("orders.orderHistory")}
      </h1>

      {orders.map((order) => (
        <div key={order.id} className="border border-gray-200 p-6 rounded-xl shadow-sm bg-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t("orders.orderID")}: {order.id}
              </h2>
              <p className="text-sm text-gray-500">
                {t("orders.date")}: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {t("orders.status")}:{" "}
                <span className={`capitalize font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                {t("orders.paymentMethod")}: {order.paymentMethod}
              </p>
              <p className="text-sm text-gray-600 font-semibold mt-1">
                {t("orders.total")}: <span className="text-gray-800">EGP {order.total.toFixed(2)}</span>
              </p>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">
                  {t("orders.estimatedProgress")}:
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[var(--primary-orange)] transition-all duration-500 ${getProgressWidth(order.status)}`}
                  />
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md w-full md:max-w-md">
              <h4 className="font-semibold text-gray-800 mb-2">
                {t("orders.shippingAddress")}
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t("orders.name")}:</strong> {order.shipping.name}</p>
                <p><strong>{t("orders.phone")}:</strong> {order.shipping.phone}</p>
                <p><strong>{t("orders.email")}:</strong> {order.shipping.email}</p>
                <p>
                  <strong>{t("orders.address")}:</strong> {order.shipping.address},{" "}
                  {order.shipping.city}, {order.shipping.region},{" "}
                  {order.shipping.postalCode}, {order.shipping.country}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 mt-4">
            {(expandedOrders[order.id] ? order.items : order.items.slice(0, 1)).map((item) => (
              <div key={item.id} className="flex gap-4 items-start border-t pt-4">
                <img
                  src={item.imageUrl || "/fallback.png"}
                  alt={`${item.product.name} — ${item.colorName ?? ""}`}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex flex-col gap-1">
                  <h4
                    className="text-[var(--primary-orange)] font-semibold hover:underline cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.slug}`)}
                  >
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("orders.quantity")}: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("orders.total")}: EGP {item.price.toFixed(2)}
                  </p>
                  {item.size && (
                    <p className="text-sm text-gray-600">
                      {t("orders.size")}: {item.size}
                    </p>
                  )}
                  {item.color && (
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      {t("orders.color")}:{" "}
                      <span
                        className="inline-block w-4 h-4 rounded-full border ml-1"
                        style={{ backgroundColor: item.color }}
                        title={item.colorName}
                      />
                    </p>
                  )}
                </div>
              </div>
            ))}

            {order.items.length > 1 && (
              <button
                onClick={() =>
                  setExpandedOrders((prev) => ({
                    ...prev,
                    [order.id]: !prev[order.id],
                  }))
                }
                className="text-sm text-[var(--primary-orange)] hover:underline mt-2 cursor-pointer"
              >
                {expandedOrders[order.id]
                  ? t("orders.showLess")
                  : t("orders.showAll", { count: order.items.length })}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


export default OrderHistory;