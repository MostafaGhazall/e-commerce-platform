import { useOrderStore } from "../contexts/useOrderStore";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function OrderHistory() {
  const { t } = useTranslation();
  const { orders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<null | (typeof orders)[0]>(
    null
  );
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <img
          src="/images/no-order.png"
          alt="No Order"
          className="mx-auto mb-6 w-72 h-auto"
        />
        <h2 className="text-xl font-bold mb-4 text-gray-500">{t("orders.noOrders")}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("orders.orderHistory")}</h1>

      <div className="space-y-6">
        {[...orders]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((order, index) => {
            const orderId = order.id || `#${index + 1}`;
            const orderLabelId = `order-${index}-heading`;

            return (
              <section
                key={orderId}
                aria-labelledby={orderLabelId}
                className="rounded-lg p-4 shadow-sm bg-gray-50 border"
              >
                <p className="text-xs text-gray-400 mb-4">
                  {new Date(order.date).toLocaleDateString()} |{" "}
                  {t("orders.orderID")}: {orderId}
                </p>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                  {/* LEFT: Order items */}
                  <div className="flex flex-col gap-3">
                    {(expandedOrders[orderId]
                      ? order.items
                      : order.items.slice(0, 1)
                    ).map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <img
                          src={item.image || "/fallback.png"}
                          alt={item.name}
                          className="w-20 h-20 object-contain border rounded-md"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {t("orders.quantity")}: {item.quantity}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {t("orders.size")}: {item.size || "–"}
                          </p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            {t("orders.color")}:
                            {item.color ? (
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300 inline-block mt-1"
                                style={{ backgroundColor: item.color }}
                              />
                            ) : (
                              <span className="text-gray-400">–</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 1 && (
                      <button
                        onClick={() =>
                          setExpandedOrders((prev) => ({
                            ...prev,
                            [orderId]: !prev[orderId],
                          }))
                        }
                        className="text-sm text-[var(--primary-orange)] hover:underline transition mt-1 self-start cursor-pointer"
                      >
                        {expandedOrders[orderId]
                          ? t("orders.showLess")
                          : t("orders.showAll", { count: order.items.length })}
                      </button>
                    )}
                  </div>

                  {/* CENTER: Order status */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--primary-orange)]">
                      {t("orders.inTransit")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("orders.arrivalEstimate")}
                    </p>
                    <div className="flex items-center justify-center mt-2">
                      <div className="w-8 h-1 bg-[var(--primary-orange)] rounded-l-full" />
                      <div className="w-12 h-1 bg-gray-300" />
                      <div className="w-12 h-1 bg-gray-300 rounded-r-full" />
                    </div>
                  </div>

                  {/* RIGHT: View details button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="mt-2 px-4 py-1.5 border border-theme text-theme font-medium text-sm rounded transition-all duration-200 hover:bg-theme group cursor-pointer"
                  >
                    <span className="group-hover:text-white">
                      {t("orders.viewDetails")}
                    </span>
                  </button>
                </div>
              </section>
            );
          })}
      </div>

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[85vh] border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  {t("orders.orderID")}:{" "}
                  <span className="text-sm font-medium text-gray-500">
                    {selectedOrder?.id}
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-1">
                  {t("orders.orderDetailsDescription") ||
                    "Details of your order including items and shipping info."}
                </Dialog.Description>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-500 italic">
              {new Date(selectedOrder?.date || "").toLocaleString()}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">
                {t("orders.shippingAddress")}
              </h3>
              <div className="text-gray-600 leading-relaxed text-sm space-y-0.5">
                <p>{selectedOrder?.shipping.name}</p>
                <p>{selectedOrder?.shipping.email}</p>
                <p>{selectedOrder?.shipping.address}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                {t("orders.orderSummary")}
              </h3>
              <ul className="divide-y">
                {selectedOrder?.items.map((item) => (
                  <li key={item.id} className="py-3 space-y-1 text-sm">
                    <div className="flex justify-between font-medium text-gray-800">
                      <span>{item.name}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} EGP</span>
                    </div>
                    <div className="text-gray-500 text-sm space-y-0.5">
                      <p>
                        {t("orders.quantity")}: {item.quantity}
                      </p>
                      <p>
                        {t("orders.size")}: {item.size || "–"}
                      </p>
                      <div className="flex items-center gap-1">
                        {t("orders.color")}:
                        {item.color ? (
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 mt-1"
                            style={{ backgroundColor: item.color }}
                          />
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-gray-700 font-bold text-lg">
                {t("orders.total")}: {selectedOrder?.total.toFixed(2)} EGP
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-sm text-theme hover:underline hover:text-theme/80 cursor-pointer"
              >
                {t("orders.close") || "Close"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
