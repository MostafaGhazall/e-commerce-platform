import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthStore } from "../contexts/useAuthStore";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { user } = useAuthStore();

  const canAccess = (path: string) =>
    user || path === "/" || path === "/products";

  const quickLinks = [
    { label: t("home"), to: "/" },
    { label: t("shop"), to: "/products" },
    { label: t("footer.cart"), to: "/cart" },
    { label: t("footer.wishlist"), to: "/wishlist" },
  ];

  const customerLinks = [
    { label: t("footer.account"), to: "/profile" },
    { label: t("footer.orderHistory"), to: "/orderhistory" },
    { label: t("footer.contact"), to: "/contact" },
  ];

  return (
    <footer className="bg-gray-100 text-gray-700" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Brand Description */}
        <div>
          <h2 className="font-semibold text-[var(--primary-orange)] mb-2">MyShop</h2>
          <p className="text-sm">{t("footer.description")}</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-medium mb-2">{t("footer.quickLinks")}</h3>
          <ul className="space-y-1 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={canAccess(link.to) ? link.to : "/login"}
                  className="hover:text-[var(--primary-orange)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 ring-[var(--primary-orange)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Section */}
        <div>
          <h3 className="font-medium mb-2">{t("footer.customer")}</h3>
          <ul className="space-y-1 text-sm">
            {customerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={canAccess(link.to) ? link.to : "/login"}
                  className="hover:text-[var(--primary-orange)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 ring-[var(--primary-orange)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional Social Section */}
        {/* <div>
          <h3 className="font-medium mb-2">{t("footer.social")}</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-[var(--primary-orange)]">Instagram</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)]">Twitter</a></li>
            <li><a href="#" className="hover:text-[var(--primary-orange)]">Facebook</a></li>
          </ul>
        </div> */}
      </div>

      <div className="text-center text-xs py-4 border-t border-[var(--primary-orange)]/30">
        &copy; {new Date().getFullYear()} MyShop. {t("footer.rights")}
      </div>
    </footer>
  );
}
