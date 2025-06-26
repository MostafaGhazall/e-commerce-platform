import { useState } from "react";
import { useAuthStore } from "../contexts/useAuthStore";
import { useUserStore } from "../contexts/useUserStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const register = useAuthStore((state) => state.register);
  const updateUserProfile = useUserStore((state) => state.updateUserProfile);
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    if (pass.length < 6)
      return { label: t("register.strengthWeak"), color: "text-red-500" };
    if (/[A-Z]/.test(pass) && /\d/.test(pass) && /[\W]/.test(pass))
      return { label: t("register.strengthStrong"), color: "text-green-600" };
    return { label: t("register.strengthMedium"), color: "text-yellow-500" };
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error(t("register.errors.fillAll"));
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error(t("register.errors.invalidEmail"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("register.errors.shortPassword"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("register.errors.noMatch"));
      return;
    }

    if (!agreeTerms) {
      toast.error(t("register.errors.terms"));
      return;
    }

    setIsLoading(true);
    const success = register(email, password);
    setIsLoading(false);

    if (success) {
      updateUserProfile({
        firstName,
        lastName,
        email,
        address: "",
        phone: "",
        birthday: "",
        gender: "",
        city: "",
        country: "",
        postalcode: "",
        region: "",
      });

      toast.success(t("register.errors.success"));
      navigate("/profile");
    } else {
      toast.error(t("register.errors.exists"));
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* Left visual / branding image */}
      <div className="hidden md:block h-full bg-[url('/images/register-bg.jpg')] bg-cover bg-center" />

      {/* Right form */}
      <div className="flex items-center justify-center h-full bg-gray-50 px-4 py-12">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center text-[var(--primary-orange)] mb-8">
            {t("register.title")}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.firstName")}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.firstName")}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.lastName")}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.lastName")}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.email")}
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.password")}
            />
            {password.length > 0 && (
              <p
                className={`text-xs mt-1 ${
                  getPasswordStrength(password).color
                }`}
              >
                {t("register.strength")}:{" "}
                <span className="font-medium">
                  {getPasswordStrength(password).label}
                </span>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.confirmPassword")}
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              {t("register.agreeTerms")}{" "}
              <span className="text-[var(--primary-amber)] cursor-pointer">
                {t("register.terms")}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-black ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--primary-sun)] hover:bg-yellow-300 cursor-pointer"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {isLoading ? t("register.registering") : t("register.submit")}
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/login" className="text-[var(--primary-amber)] hover:underline">
              {t("register.loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
