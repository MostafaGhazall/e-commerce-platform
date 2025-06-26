import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const linkClasses = (path: string) =>
    `block px-2 py-1 rounded ${
      pathname === path
        ? "text-white bg-[var(--primary-orange)]"
        : "text-gray-700 hover:text-orange-600"
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <Link to="/" className={linkClasses("/")}>Dashboard</Link>
        <Link to="/products" className={linkClasses("/products")}>Products</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
