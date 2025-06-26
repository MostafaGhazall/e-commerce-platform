import { useState } from "react";
import { useAuthStore } from "../contexts/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("login.fillFields"));
      return;
    }

    const success = login(email, password);
    if (success) {
      toast.success(t("login.success"));
      navigate("/profile");
    } else {
      toast.error(t("login.invalid"));
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* Left Image */}
      <div className="hidden md:block h-full bg-[url('/images/register-bg.jpg')] bg-cover bg-center" />

      {/* Right Form */}
      <div className="flex items-center justify-center h-full bg-gray-50 px-4 py-12">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center text-[var(--primary-orange)] mb-8">
            {t("login.title")}
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("login.email")}
            </label>
            <input
              type="email"
              placeholder={t("login.emailPlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("login.password")}
            </label>
            <input
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[var(--primary-sun)] text-black rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {t("login.submit")}
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="text-[var(--primary-amber)] hover:underline">
              {t("login.registerLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
