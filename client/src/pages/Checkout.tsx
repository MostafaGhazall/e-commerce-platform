import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCartStore } from "../contexts/useCartStore";
import { useProductStore } from "../contexts/useStore";
import { useUserStore } from "../contexts/useUserStore";
import { checkoutSchema, CheckoutInput } from "../../../shared/userValidators";
import axios from "../api/axios";

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* stores ----------------------------------------------------- */
  const { cart, fetchCart, clearCart } = useCartStore();
  const { products, loadProducts } = useProductStore();
  const user = useUserStore();

  useEffect(() => {
    if (cart.length === 0) fetchCart();
  }, [cart.length, fetchCart]);

  /* load products once ---------------------------------------- */
  useEffect(() => {
    (async () => {
      await loadProducts();
    })();
  }, []);

  /* helpers ---------------------------------------------------- */
  const findProduct = (productId: string) =>
    products.find((p) => p.id === productId);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart]
  );

  /* form ------------------------------------------------------- */
  const defaultValues = (): CheckoutInput => ({
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    address: user.address,
    country: user.country ?? "",
    city: user.city ?? "",
    region: user.region ?? "",
    postalcode: user.postalcode ?? "",
    phone: user.phone ?? "",
  });

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultValues(),
  });

  /* repopulate when user profile updates ---------------------- */
  useEffect(() => reset(defaultValues()), [user, reset]);

  /* focus first error ----------------------------------------- */
  useEffect(() => {
    const firstErr = Object.keys(errors)[0] as keyof CheckoutInput | undefined;
    if (firstErr) setFocus(firstErr);
  }, [errors, setFocus]);

  /* submit ----------------------------------------------------- */
  const onSubmit = handleSubmit(async (data) => {
    if (!cart.length) {
      toast.error(t("checkout.emptyCart"));
      return navigate("/cart");
    }

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          colorName: item.colorName,
        })),
        total: subtotal,
        shipping: {
          name: data.name,
          email: data.email,
          address: data.address,
          city: data.city,
          country: data.country,
          region: data.region,
          postalcode: data.postalcode,
          phone: data.phone,
        },
      };

      await axios.post("/orders", payload, { withCredentials: true });

      toast.success(t("checkout.orderSuccess"));
      setTimeout(() => navigate("/orderhistory"), 500);
      clearCart();
      navigate("/orderhistory");
    } catch (error: any) {
      console.error("Order submission failed", error);
      toast.error(t("errors.failedOrder") || "Failed to place order.");
    }
  });

  if (!products.length) {
    return (
      <div className="text-center py-20 text-lg">
        {t("checkout.loading") || "Loading..."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 text-gray-800 bg-white">
      {/* Order Summary (mobile first) */}
      <section className="order-1 lg:order-2 space-y-4 bg-gray-50 rounded-2xl px-6 py-6">
        <h3 className="text-xl font-semibold">{t("checkout.orderSummary")}</h3>

        {/* cart lines */}
        <ul className="space-y-4">
          {cart.map((item) => {
            const product = findProduct(item.productId);
            if (!product) return null;

            return (
              <li
                key={`${item.id}-${item.size ?? "default"}`}
                className="flex items-start gap-4 border-b pb-4"
              >
                {/* image */}
                <img
                  src={
                    item.image ??
                    product.images[0]?.url ??
                    "/images/fallback.png"
                  }
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded-md border shrink-0"
                />

                {/* details */}
                <div className="flex-1 space-y-0.5">
                  <h4 className="font-medium leading-snug">{product.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("checkout.quantity")}: {item.quantity}
                  </p>
                  {item.size && (
                    <p className="text-xs text-gray-500">
                      {t("checkout.size")}: {item.size}
                    </p>
                  )}
                  {item.colorName && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {t("checkout.color")}:
                      <span
                        className="inline-block w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.color }}
                      />
                    </p>
                  )}
                </div>

                {/* line total */}
                <span className="text-lg font-semibold whitespace-nowrap">
                  EGP {(product.price * item.quantity).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>

        {/* totals */}
        <div className="mt-6 space-y-2 border-t pt-4 text-lg font-medium">
          <div className="flex justify-between">
            <span>{t("checkout.subtotal")}</span>
            <span>EGP {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout.deliveryCharge")}</span>
            <span>{t("checkout.free")}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout.tax")}</span>
            <span>{t("checkout.included")}</span>
          </div>
        </div>

        <div className="flex justify-between font-bold text-xl mt-4">
          <span>{t("checkout.total")}</span>
          <span>EGP {subtotal.toFixed(2)}</span>
        </div>

        <p className="mt-4 text-sm text-gray-500 italic">
          {t("checkout.arrivalTime")}
        </p>
      </section>

      {/* Checkout form */}
      <section className="order-2 lg:order-1 space-y-6">
        <h2 className="text-2xl font-bold">{t("checkout.title")}</h2>

        <form id="checkout-form" onSubmit={onSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.contactInfo")}
            </h3>

            <input
              {...register("name")}
              placeholder={t("checkout.fullName")}
              className={`w-full border px-4 py-2 rounded bg-white ${
                errors.name && "border-red-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}

            <input
              {...register("email")}
              type="email"
              placeholder={t("checkout.email")}
              className={`w-full border px-4 py-2 rounded bg-white ${
                errors.email && "border-red-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.shippingInfo")}
            </h3>

            <input
              {...register("address")}
              placeholder={t("checkout.shippingAddress")}
              className={`w-full border px-4 py-2 rounded bg-white ${
                errors.address && "border-red-500"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["city", "region", "postalcode", "country"] as const).map(
                (field) => (
                  <div key={field}>
                    <input
                      {...register(field)}
                      placeholder={t(`checkout.${field}`)}
                      className={`w-full border px-4 py-2 rounded bg-white ${
                        errors[field] && "border-red-500"
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm">
                        {errors[field]!.message}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>

            <input
              {...register("phone")}
              placeholder={t("checkout.phoneNumber")}
              className={`w-full border px-4 py-2 rounded bg-white ${
                errors.phone && "border-red-500"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}

            {/* Visual-only checkbox */}
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              {t("checkout.useAsBilling")}
            </label>
          </div>

          {/* Payment (static) */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.paymentMethod")}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {["cash-on-delivery", "master-card", "paypal", "visa"].map(
                (option) => (
                  <label
                    key={option}
                    className={`flex flex-row gap-3 items-center border p-4 rounded-md ${
                      option === "cash-on-delivery"
                        ? "bg-yellow-50 border-yellow-400"
                        : "opacity-40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option}
                      defaultChecked={option === "cash-on-delivery"}
                      disabled
                      className="w-4 h-4 cursor-not-allowed"
                    />
                    <img
                      src={`/images/${option}.png`}
                      alt={option}
                      className="w-16 h-16 object-contain"
                    />
                  </label>
                )
              )}
            </div>
          </div>
        </form>
      </section>

      {/* Place Order button */}
      <div className="order-3 lg:col-span-2 flex justify-center mt-4">
        <button
          type="submit"
          form="checkout-form"
          className="bg-[var(--primary-sun)] hover:bg-yellow-300 text-black px-6 py-2 rounded w-full max-w-sm cursor-pointer"
        >
          {t("checkout.placeOrder")}
        </button>
      </div>
    </div>
  );
}
