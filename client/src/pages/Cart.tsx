import { useCartStore } from "../contexts/useCartStore";
import { useProductStore } from "../contexts/useStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CartItem from "../components/CartItem";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { products, loadProducts, loading } = useProductStore();
  const { t } = useTranslation();

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (products.length === 0) loadProducts();
  }, []);

  const getProductDetails = (productId: string) =>
    products.find((p) => p.id === productId);

  const total = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const handleRemove = (cartItemId: string) => {
    removeFromCart(cartItemId);
    toast.success(t("cart.itemRemoved"));
  };

  const handleClearCart = () => {
    clearCart();
    setConfirmClear(false);
    toast.success(t("cart.cleared"));
  };

  const handleQuantityChange = (cartItemId: string, qty: number) => {
    if (qty < 1) return;
    updateQuantity(cartItemId, qty);
    toast.success(t("cart.updated"));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--primary-orange)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <img
          src="/images/empty-cart.svg"
          alt="Empty cart"
          className="mx-auto mb-6 w-48 h-auto"
        />
        <h2 className="text-xl font-bold mb-4">{t("cart.emptyTitle")}</h2>
        <Link to="/products" className="text-[var(--primary-orange)] underline">
          {t("cart.shopNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800 bg-white">
      <h2 className="text-2xl font-bold mb-6">{t("cart.title")}</h2>

      <div className="space-y-6">
        {cart.map((item) => {
          const product = getProductDetails(item.productId);
          if (!product) return null;

          return (
            <CartItem
              key={item.id}
              id={item.id}
              productId={item.productId}
              name={item.name}
              image={item.image}
              price={item.price}
              quantity={item.quantity}
              size={item.size}
              color={item.color}
              colorName={item.colorName}
              onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
              onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
              onRemove={() => handleRemove(item.id)}
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center border-t pt-4">
        <button
          onClick={() => setConfirmClear(true)}
          className="text-red-500 underline hover:text-red-700 cursor-pointer"
        >
          {t("cart.clear")}
        </button>
        <div className="text-xl font-bold">
          {t("cart.total")}: EGP {total.toFixed(2)}
        </div>
      </div>

      <div className="relative mt-6 sm:static bottom-0 left-0 right-0 bg-white sm:bg-transparent sm:shadow-none p-4 sm:p-0 flex justify-center sm:justify-end">
        <Link
          to="/checkout"
          className="bg-[var(--primary-sun)] text-black px-6 py-2 rounded hover:bg-yellow-300 transition"
        >
          {t("cart.checkout")}
        </Link>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-3">{t("cart.confirmTitle")}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {t("cart.confirmMessage")}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                {t("cart.cancel")}
              </button>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t("cart.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
