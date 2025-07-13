import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import SidebarLayout from "./layouts/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminLogin from "./pages/AdminLogin";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import RequireAdminAuth from "./components/RequireAdminAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route element={<RequireAdminAuth />}>
              <Route element={<SidebarLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
