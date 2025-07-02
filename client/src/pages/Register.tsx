import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { registerSchema, RegisterInput } from "../../../shared/userValidators";
import { useAuthStore } from "../contexts/useAuthStore";
import { useUserStore } from "../contexts/useUserStore";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateProfile = useUserStore((s) => s.updateUserProfile);
  const user = useAuthStore((s) => s.user);
  const registerUser = useAuthStore((s) => s.register);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user, navigate]);

  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof RegisterInput;
    if (firstError) setFocus(firstError);
  }, [errors, setFocus]);

  const password = watch("password", "");
  const getStrength = () => {
    if (password.length < 6)
      return { label: t("register.strengthWeak"), color: "text-red-500" };
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[\W]/.test(password))
      return { label: t("register.strengthStrong"), color: "text-green-600" };
    return { label: t("register.strengthMedium"), color: "text-yellow-500" };
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await registerUser(data);
      if (!res.ok) {
        toast.error(res.msg || t("register.errors.exists"));
        return;
      }
      await fetchCurrentUser();
      updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      toast.success(t("register.success"));
      navigate("/profile");
    } catch (err) {
      toast.error(t("register.errors.serverError") || "Something went wrong");
      console.error("Register error:", err);
    }
  };

  const nameFields: Array<"firstName" | "lastName"> = [
    "firstName",
    "lastName",
  ];
  const pwdFields: Array<"password" | "confirmPassword"> = [
    "password",
    "confirmPassword",
  ];

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <div className="hidden md:block h-full bg-[url('/images/register-bg.jpg')] bg-cover bg-center" />
      <div className="flex items-center justify-center h-full bg-gray-50 px-4 py-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-center text-[var(--primary-orange)] mb-8">
            {t("register.title")}
          </h2>

          {nameFields.map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(`register.${field}`)}
              </label>
              <input
                {...register(field)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t(`register.${field}`)}
              />
              {errors[field] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("register.email")}
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t("register.email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {pwdFields.map((f, i) => (
            <div key={f} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(`register.${f}`)}
              </label>
              <input
                type="password"
                {...register(f)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t(`register.${f}`)}
              />
              {i === 0 && password && (
                <p className={`text-xs mt-1 ${getStrength().color}`}>  
                  {t("register.strength")}:
                  <span className="font-medium"> {getStrength().label}</span>
                </p>
              )}
              {errors[f] && (
                <p className="text-xs text-red-500 mt-1">{errors[f]?.message}</p>
              )}
            </div>
          ))}

          <div className="mb-6 flex items-center">
            <input type="checkbox" {...register("agreeTerms")} className="mr-2" />
            <label className="text-sm text-gray-700">
              {t("register.agreeTerms")} 
              <span className="text-[var(--primary-amber)] cursor-pointer">
                {t("register.terms")}
              </span>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 -mt-4 mb-4">
              {errors.agreeTerms.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg text-black ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--primary-sun)] hover:bg-yellow-300 cursor-pointer"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {isSubmitting ? t("register.registering") : t("register.submit")}
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            {t("register.alreadyHaveAccount")} 
            <Link to="/login" className="text-[var(--primary-amber)] hover:underline">
              {t("register.loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
