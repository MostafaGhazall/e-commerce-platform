import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SidebarLayout from "./layouts/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AdminLogin from "./pages/AdminLogin";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import RequireAdminAuth from "./components/RequireAdminAuth";

const App = () => {
  return (
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
            <Route path="/orders/:id" element={<OrderDetail />}/>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
