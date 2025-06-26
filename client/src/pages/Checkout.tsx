import { useCartStore } from "../contexts/useCartStore";
import { useProductStore } from "../contexts/useStore";
import { useUserStore } from "../contexts/useUserStore"; // Autofill feature
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useOrderStore } from "../contexts/useOrderStore";

const Checkout = () => {
  const { cart, clearCart } = useCartStore();
  const { products, loadProducts } = useProductStore();
  const {
    firstName,
    lastName,
    email,
    address,
    city,
    country,
    postalcode,
    region,
    phone,
  } = useUserStore(); // User data
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addOrder } = useOrderStore();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: `${firstName} ${lastName}`.trim(),
    email: email,
    address: address,
    country: country || "",
    city: city || "",
    region: region || "",
    postalCode: postalcode || "",
    phone: phone || "",
    paymentMethod: "cash-on-delivery", // Default payment method
  });

  useEffect(() => {
    if (products.length === 0) loadProducts();
  }, [products, loadProducts]);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) => /^\+?\d{6,15}$/.test(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!form.name) errors.name = t("errors.nameRequired");
    if (!form.email) {
      errors.email = t("errors.emailRequired");
    } else if (!isValidEmail(form.email)) {
      errors.email = t("errors.emailInvalid");
    }

    if (!form.address) errors.address = t("errors.addressRequired");
    if (!form.country) errors.country = t("errors.countryRequired");
    if (!form.city) errors.city = t("errors.cityRequired");
    if (!form.region) errors.region = t("errors.regionRequired");
    if (!form.postalCode) errors.postalCode = t("errors.postalCodeRequired");
    if (!form.phone) {
      errors.phone = t("errors.phoneRequired");
    } else if (!isValidPhone(form.phone)) {
      errors.phone = t("errors.phoneInvalid");
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      document.querySelector(`input[name="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (Object.keys(errors).length > 0) return;

    const orderItems = cart.map((item) => {
      const product = getProduct(item.id);
      return {
        id: item.id,
        name: product?.name || "",
        price: product?.price || 0,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        colorName: item.colorName,
        image: item.image || product?.images?.[0] || "/fallback.png",
      };
    });

    const newOrder = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: orderItems,
      total,
      shipping: form,
    };

    addOrder(newOrder);
    toast.success(t("checkout.orderSuccess") || "Order placed successfully!");
    clearCart();
    navigate("/orderhistory");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 text-gray-800 bg-white">
      {/* Order Summary - Appears First on Mobile */}
      <div className="order-1 lg:order-2 space-y-4 bg-gray-50 rounded-2xl px-6 py-6">
        <h3 className="text-xl font-semibold">{t("checkout.orderSummary")}</h3>
        <ul className="space-y-4">
          {cart.map((item) => {
            const product = getProduct(item.id);
            if (!product) return null;

            return (
              <li
                key={`${item.id}-${item.size || "default"}`}
                className="flex justify-between items-start border-b pb-4 gap-4"
              >
                <img
                  src={item.image}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-md border"
                />
                <div className="flex flex-col space-y-2">
                  <h4 className="font-medium">{product.name}</h4>
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
                        className="inline-block w-4 h-4 rounded-full border ml-1"
                        style={{ backgroundColor: item.color }}
                      ></span>
                    </p>
                  )}
                </div>
                <span className="font-semibold text-lg">
                  EGP {(product.price * item.quantity).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between font-medium text-lg mt-6 border-t pt-4">
          <span>{t("checkout.subtotal")}</span>
          <span>EGP {total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-medium text-lg mt-2">
          <span>{t("checkout.deliveryCharge")}</span>
          <span>{t("checkout.free")}</span>
        </div>

        <div className="flex justify-between font-medium text-lg mt-2">
          <span>{t("checkout.tax")}</span>
          <span>{t("checkout.included")}</span>
        </div>

        <div className="flex justify-between font-bold text-xl mt-4">
          <span>{t("checkout.total")}</span>
          <span>EGP {total.toFixed(2)}</span>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <span className="italic">{t("checkout.arrivalTime")}</span>
        </div>
      </div>

      {/* Checkout Form - Appears Second on Mobile */}
      <div className="order-2 lg:order-1 space-y-6">
        <h2 className="text-2xl font-bold mb-4">{t("checkout.title")}</h2>
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.contactInfo")}
            </h3>
            <input
              name="name"
              type="text"
              placeholder={t("checkout.fullName") || "Full Name"}
              value={form.name}
              onChange={handleChange}
              className={`w-full border px-4 py-2 rounded bg-white ${
                formErrors.name ? "border-red-500" : ""
              }`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm">{formErrors.name}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder={t("checkout.email") || "Email"}
              value={form.email}
              onChange={handleChange}
              className={`w-full border px-4 py-2 rounded bg-white ${
                formErrors.email ? "border-red-500" : ""
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm">{formErrors.email}</p>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.shippingInfo")}
            </h3>

            {/* Address */}
            <div>
              <input
                name="address"
                type="text"
                placeholder={
                  t("checkout.shippingAddress") || "Shipping Address"
                }
                value={form.address}
                onChange={handleChange}
                className={`w-full border px-4 py-2 rounded bg-white ${
                  formErrors.address ? "border-red-500" : ""
                }`}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.address}
                </p>
              )}
            </div>

            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="city"
                  type="text"
                  placeholder={t("checkout.city")}
                  value={form.city}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded bg-white ${
                    formErrors.city ? "border-red-500" : ""
                  }`}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>

              <div>
                <input
                  name="region"
                  type="text"
                  placeholder={t("checkout.region")}
                  value={form.region}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded bg-white ${
                    formErrors.region ? "border-red-500" : ""
                  }`}
                />
                {formErrors.region && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.region}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="postalCode"
                  type="text"
                  placeholder={t("checkout.postalCode")}
                  value={form.postalCode}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded bg-white ${
                    formErrors.postalCode ? "border-red-500" : ""
                  }`}
                />
                {formErrors.postalCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.postalCode}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="country"
                  type="text"
                  placeholder={t("checkout.country")}
                  value={form.country}
                  onChange={handleChange}
                  className={`w-full border px-4 py-2 rounded bg-white ${
                    formErrors.country ? "border-red-500" : ""
                  }`}
                />
                {formErrors.country && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.country}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <input
                name="phone"
                type="text"
                placeholder={t("checkout.phoneNumber") || "Phone Number"}
                value={form.phone}
                onChange={handleChange}
                className={`w-full border px-4 py-2 rounded bg-white ${
                  formErrors.phone ? "border-red-500" : ""
                }`}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Billing Checkbox */}
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>{t("checkout.useAsBilling")}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h3 className="text-xl font-semibold">
              {t("checkout.paymentMethod")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {["cash-on-delivery", "master-card", "paypal", "visa"].map(
                (paymentOption) => (
                  <div
                    key={paymentOption}
                    className="flex flex-row gap-3 items-center border p-4 rounded-md hover:shadow"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={paymentOption}
                      onChange={handleChange}
                      checked={form.paymentMethod === paymentOption}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <img
                      src={`/images/${paymentOption
                        .toLowerCase()
                        .replace(/ /g, "-")}.png`}
                      alt={paymentOption}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Submit Button - Appears Last on Mobile, Still Submits Form */}
      <div className="order-3 lg:col-span-2 flex justify-center mt-4">
        <button
          type="submit"
          form="checkout-form"
          className="bg-[var(--primary-sun)] text-black px-6 py-2 rounded hover:bg-yellow-300 w-full max-w-sm cursor-pointer"
        >
          {t("checkout.placeOrder")}
        </button>
      </div>
    </div>
  );
};
export default Checkout;
