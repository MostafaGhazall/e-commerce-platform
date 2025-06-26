import { useEffect, useState } from "react";
import axios from "axios";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard", { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center py-10 text-red-500">Failed to load dashboard.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[var(--primary-orange)]">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl mt-2 text-gray-700">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-2xl mt-2 text-gray-700">EGP {stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl mt-2 text-gray-700">{stats.totalProducts}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
