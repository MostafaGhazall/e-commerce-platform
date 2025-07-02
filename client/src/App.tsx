import { useEffect, memo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { usePreferenceStore } from "./contexts/usePreferenceStore";
import { useAuthStore } from "./contexts/useAuthStore";
import { useUserStore } from "./contexts/useUserStore";
import { useProductStore } from "./contexts/useStore";
import { useWishlistStore } from "./contexts/useWishlistStore";
import { useCartStore } from "./contexts/useCartStore";

// pages & layout
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";

/* protected gate, memoised so it never re-creates */
const ProtectedRoute = memo(
  ({ children }: { children: React.ReactElement }) => {
    const user = useAuthStore((s) => s.user);
    return user ? children : <Navigate to="/login" replace />;
  }
);

export default function App() {
  /* set RTL / LTR on html for Tailwind logical-direction classes */
  const language = usePreferenceStore((s) => s.language);
  useEffect(() => {
    document.documentElement.lang = language === "ar" ? "ar" : "en";
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  /* hydrate auth session */
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const authUser = useAuthStore((s) => s.user);
  /* hydrate user profile */
  const fetchUserProfile = useUserStore((s) => s.fetchUserProfile);
  /* initial product load */
  const loadProducts = useProductStore((s) => s.loadProducts);

  useEffect(() => {
    fetchCurrentUser();
    loadProducts();
  }, [fetchCurrentUser, loadProducts]);

  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
      fetchWishlist();
      fetchCart();
    }
  }, [authUser, fetchUserProfile, fetchWishlist, fetchCart]);

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/orderhistory"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
