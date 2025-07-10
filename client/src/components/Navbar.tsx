import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, User, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCartStore } from "../contexts/useCartStore";
import { usePreferenceStore } from "../contexts/usePreferenceStore";
import { useAuthStore } from "../contexts/useAuthStore";
import { useCategories } from "../contexts/useCategories";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const language = usePreferenceStore((state) => state.language);
  const setLanguage = usePreferenceStore((state) => state.setLanguage);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t, i18n } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { categories, loading: catLoading } = useCategories();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    // Only add listener for medium and up screens
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    if (profileOpen && isDesktop) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (isDesktop) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [profileOpen]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  }, [language]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleProfile = () => setProfileOpen(!profileOpen);

  const protectedNavigate = (path: string) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
    setProfileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return;

    const knownCategories = [
      "clothing",
      "accessories",
      "electronics",
      "furniture",
    ];

    const matchedCategory = knownCategories.find((cat) =>
      cat.toLowerCase().includes(trimmed)
    );

    if (matchedCategory) {
      navigate(`/products?category=${encodeURIComponent(matchedCategory)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }

    setSearch("");
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-theme shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="hidden md:block text-xl font-bold text-white whitespace-nowrap"
          >
            MyShop
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-grow max-w-2xl mx-4"
          >
            <input
              type="text"
              placeholder={t("navbar.Search MyShop...")}
              className={`w-full px-4 py-2 border border-white text-white focus:outline-none ${
                language === "ar" ? "rounded-r" : "rounded-l"
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className={`bg-white text-theme font-medium px-4 border border-white hover:cursor-pointer ${
                language === "ar" ? "rounded-l" : "rounded-r"
              }`}
            >
              {t("navbar.Search")}
            </button>
          </form>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
            className="md:hidden bg-white text-gray-800 px-3 py-2 rounded border border-gray-300"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-6 relative">
            {/* Account */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center text-white gap-1 hover:cursor-pointer"
              >
                <img
                  src="/images/profile-icon.png"
                  alt="Profile"
                  className="w-5 h-6"
                />
                <span>{t("navbar.Account")}</span>
                {profileOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 shadow-md rounded-md py-2 w-48 z-10">
                  {user && (
                    <p
                      className="px-4 py-2 text-sm text-gray-600 border-b border-[var(--primary-amber)] truncate overflow-hidden whitespace-nowrap"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  )}

                  <button
                    onClick={() => protectedNavigate("/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t("navbar.Profile")}
                  </button>
                  <button
                    onClick={() => protectedNavigate("/wishlist")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t("navbar.wishlist")}
                  </button>
                  <button
                    onClick={() => protectedNavigate("/orderhistory")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t("navbar.Orders")}
                  </button>
                  <button
                    onClick={() => {
                      if (user) handleLogout();
                      else {
                        setProfileOpen(false);
                        navigate("/login");
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-t border-[var(--primary-amber)]"
                  >
                    {user ? t("navbar.Logout") : t("navbar.Sign In")}
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <NavLink
              to="/cart"
              className="flex items-center relative text-white"
            >
              <div className="relative">
                <img
                  src="/images/cart-icon.png"
                  alt="Cart"
                  className="w-5 h-5"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white border border-theme text-theme text-xs px-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="ml-2">{t("navbar.Cart")}</span>
            </NavLink>

            {/* Language */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
              className="text-sm bg-white text-gray-800 px-2 py-1 rounded"
            >
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Bottom Category Navbar visible on all screen sizes */}
      {location.pathname === "/" && (
        <div className="bg-white border-t border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-center gap-6 flex-wrap">
            {catLoading ? (
              <span>Loading…</span>
            ) : (
              categories.map(({ slug, name }) => (
                <NavLink
                  key={slug}
                  to={`/products?category=${encodeURIComponent(slug)}`}
                  className="text-sm …"
                >
                  {name}
                </NavLink>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-around items-center py-2 relative">
          {/* Home */}
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center ${
              isActive("/") ? "text-theme font-semibold" : "text-gray-500"
            }`}
          >
            <Home size={22} />
            <span className="text-xs mt-1">{t("navbar.Home")}</span>
          </button>

          {/* Account */}
          <div className="relative z-50">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className={`flex flex-col items-center ${
                profileOpen ? "text-theme font-semibold" : "text-gray-500"
              }`}
            >
              <User size={22} />
              <span className="text-xs mt-1">{t("navbar.Account")}</span>
            </button>
          </div>

          {/* Cart */}
          <button
            onClick={() => protectedNavigate("/cart")}
            className={`flex flex-col items-center relative ${
              isActive("/cart") ? "text-theme font-semibold" : "text-gray-500"
            }`}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">{t("navbar.Cart")}</span>
          </button>
        </div>
      </div>

      {/* Profile Dropdown for Mobile */}
      {profileOpen && (
        <div
          id="mobile-profile-dropdown"
          className="fixed bottom-[58px] left-0 right-0 z-40 sm:hidden"
        >
          <div className="bg-white shadow-[0_-8px_14px_-4px_rgba(0,0,0,0.25)] rounded-t-lg border-t border-gray-200 animate-slide-up">
            <div className="flex justify-between items-center px-4 pt-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>

            <div className="mt-4 text-gray-800 font-medium border-t border-[var(--primary-amber)]">
              <button
                onClick={() => {
                  protectedNavigate("/profile");
                  setProfileOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--primary-orange)] hover:text-white"
              >
                {t("navbar.Profile")}
              </button>
              <button
                onClick={() => {
                  protectedNavigate("/wishlist");
                  setProfileOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--primary-orange)] hover:text-white"
              >
                {t("navbar.wishlist")}
              </button>
              <button
                onClick={() => {
                  protectedNavigate("/orderhistory");
                  setProfileOpen(false);
                }}
                className="w-full text-left px-4 pt-3 pb-6 hover:bg-[var(--primary-orange)] hover:text-white"
              >
                {t("navbar.Orders")}
              </button>

              <div className="border-t border-[var(--primary-amber)]" />

              <button
                onClick={() => {
                  if (user) {
                    handleLogout();
                  } else {
                    setProfileOpen(false);
                    navigate("/login");
                  }
                }}
                className="w-full text-left px-4 pt-3 pb-5 hover:bg-[var(--primary-orange)] hover:text-white"
              >
                {user ? t("navbar.Logout") : t("navbar.Sign In")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
