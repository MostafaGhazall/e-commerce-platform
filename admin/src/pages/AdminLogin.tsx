import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../api/axios";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.post("/api/admin/auth/login", { email, password });
      toast.success("Logged in successfully!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary-sun)] px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm space-y-5 animate-slide-up"
      >
        <h1 className="text-3xl font-bold text-center text-[var(--primary-orange)]">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-orange)]"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-orange)]"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-[var(--primary-orange)] hover:bg-[var(--primary-redish)] rounded-lg font-semibold transition-all disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
