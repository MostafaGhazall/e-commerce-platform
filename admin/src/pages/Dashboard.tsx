import { useEffect, useState } from "react";
import adminApi from "@/api/orders";

/* ───────────────────────────── types ───────────────────────────── */
interface Stats {
  totalOrders:   number;
  totalRevenue:  number;
  totalProducts: number;
}

interface ApiEnvelope<T> {
  ok:   boolean;
  data: T;
}

const isStats = (d: any): d is Stats =>
  d &&
  typeof d.totalOrders   === "number" &&
  typeof d.totalRevenue  === "number" &&
  typeof d.totalProducts === "number";

/* ─────────────────────────── component ─────────────────────────── */
export default function Dashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.get<
          Stats | ApiEnvelope<Stats>
        >("/api/admin/dashboard");

        // ① new envelope?             ② old direct object?
        const maybeStats =
          (data && "ok" in data ? (data as ApiEnvelope<Stats>).data : data) as any;

        if (isStats(maybeStats)) {
          setStats(maybeStats);
        } else {
          console.error("Unexpected dashboard payload:", data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ────────── loading / error guards ────────── */
  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading dashboard…
      </div>
    );

  if (!stats)
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load dashboard.
      </div>
    );

  /* ────────── happy path ────────── */
  const fmtEGP = (v: number) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
    }).format(v);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-[var(--primary-orange)]">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Orders"    value={stats.totalOrders.toString()} />
        <StatCard title="Total Revenue"   value={fmtEGP(stats.totalRevenue)}   />
        <StatCard title="Total Products"  value={stats.totalProducts.toString()} />
      </div>
    </div>
  );
}

/* ─────────────────────────── sub-card ─────────────────────────── */
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-medium text-gray-700 mb-1">{title}</h2>
    <p className="text-3xl font-semibold text-[var(--primary-orange)]">
      {value}
    </p>
  </div>
);
