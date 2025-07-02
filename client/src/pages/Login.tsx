import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { loginSchema, LoginInput } from "../../../shared/userValidators";
import { useAuthStore } from "../contexts/useAuthStore";
import { useUserStore } from "../contexts/useUserStore";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);
  const updateUserProfile = useUserStore((s) => s.updateUserProfile);
  const user = useAuthStore((s) => s.user);

  // ✅ Sync user info across stores
  useEffect(() => {
    if (user) {
      updateUserProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
      });
    }
  }, [user, updateUserProfile]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Auto-focus first error field
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof LoginInput;
    if (firstError) setFocus(firstError);
  }, [errors, setFocus]);

  const onSubmit = async (data: LoginInput) => {
    const res = await authLogin(data);

    if (!res.ok) {
      toast.error(res.msg || t("login.invalid"));
      return;
    }

    toast.success(t("login.success"));
    reset();
    navigate("/profile");
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <div className="hidden md:block h-full bg-[url('/images/register-bg.jpg')] bg-cover bg-center" />
      <div className="flex items-center justify-center h-full bg-gray-50 px-4 py-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center text-[var(--primary-orange)] mb-8">
            {t("login.title")}
          </h2>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t("login.email")}
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("login.emailPlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t("login.password")}
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder={t("login.passwordPlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password?.message && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-[var(--primary-sun)] text-black rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting && "cursor-not-allowed opacity-70"
            }`}
          >
            {isSubmitting ? t("login.submitting") : t("login.submit")}
          </button>

          {/* Register Redirect */}
          <p className="mt-4 text-sm text-center text-gray-600">
            {t("login.noAccount")}{' '}
            <Link to="/register" className="text-[var(--primary-amber)] hover:underline">
              {t("login.registerLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
