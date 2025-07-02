import { useEffect } from "react";
import { useWishlistStore } from "../contexts/useWishlistStore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const { wishlist, fetchWishlist } = useWishlistStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (wishlist.length === 0)
    return (
      <div className="text-center py-20 text-gray-500">
        <img
          src="/images/empty-wishlist.png"
          alt="Empty wishlist"
          className="mx-auto mb-6 w-36 h-auto"
        />
        <p className="text-xl mb-4">{t("wishlist.emptyTitle")}</p>
        <Link
          to="/products"
          className="text-theme underline hover:text-theme/80 transition"
        >
          {t("wishlist.browse")}
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("wishlist.title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
