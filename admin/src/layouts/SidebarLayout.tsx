import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const SidebarLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
