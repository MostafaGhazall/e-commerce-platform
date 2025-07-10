import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, PackageCheck } from "lucide-react";

const navItems = [
  { path: "/",        label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { path: "/products", label: "Products",  icon: <ShoppingBag size={18} /> },
  { path: "/orders",   label: "Orders",    icon: <PackageCheck  size={18} /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClasses = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      pathname === path
        ? "bg-[var(--primary-orange)] text-white"
        : "text-gray-700 hover:text-[var(--primary-orange)] hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-md p-4">
      <h2 className="text-2xl font-bold mb-8 text-[var(--primary-orange)]">
        Admin Panel
      </h2>

      <nav className="space-y-2">
        {navItems.map(({ path, label, icon }) => (
          <Link key={label} to={path} className={linkClasses(path)}>
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
