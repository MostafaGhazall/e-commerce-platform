import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { usePreferenceStore } from "./contexts/usePreferenceStore";
import { useAuthStore } from "./contexts/useAuthStore";
import { seedProducts } from "./services/seedProducts";
import { useProductStore } from "./contexts/useStore";

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

const App = () => {
  const language = usePreferenceStore((state) => state.language);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "ar" ? "rtl" : "ltr"
    );
  }, [language]);

  useEffect(() => {
    const load = async () => {
      await seedProducts();
      await useProductStore.getState().loadProducts();
    };
    load();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

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
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
