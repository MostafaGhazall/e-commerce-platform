import { useTranslation } from "react-i18next";
import { useUserStore } from "../contexts/useUserStore";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function UserProfile() {
  const { t } = useTranslation();
  const {
    firstName,
    lastName,
    email,
    address,
    city,
    region,
    postalcode,
    country,
    phone,
    birthday,
    gender,
    updateUserProfile,
  } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      address,
      city,
      region,
      postalcode,
      country,
      phone,
    },
  });

  const onSubmit = (data: any) => {
    updateUserProfile({
      firstName,
      lastName,
      email,
      birthday,
      gender,
      ...data,
    });
    setEditingAddress(false);
  };

  const [editingAddress, setEditingAddress] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--primary-orange)] mb-10 text-center">
        {t("userProfile.accountOverview")}
      </h1>

      <div className="space-y-8">
        {/* Account Details */}
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t("userProfile.accountDetails")}
          </h2>
          {firstName && lastName && (
            <p className="mb-1 text-gray-900 font-medium text-lg">
              {firstName} {lastName}
            </p>
          )}
          <p className="mb-4 text-gray-600">{email}</p>
        </section>

        {/* Address Book */}
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t("userProfile.addressBook")}
          </h2>
          {!editingAddress ? (
            <>
              <p className="mb-4 text-gray-600">{address || t("userProfile.noAddress")}</p>
              <button
                onClick={() => {
                  setEditingAddress(true);
                  reset({ address, city, region, postalcode, country, phone });
                }}
                className="text-[var(--primary-amber)] font-medium hover:cursor-pointer"
              >
                {address ? t("userProfile.editAddress") : t("userProfile.addAddress")}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">
                  {t("userProfile.address")}
                </label>
                <input
                  {...register("address", { required: t("userProfile.addressRequired") })}
                  className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">{t("userProfile.city")}</label>
                  <input
                    {...register("city", { required: t("userProfile.cityRequired") })}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700">{t("userProfile.region")}</label>
                  <input
                    {...register("region", { required: t("userProfile.regionRequired") })}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.region && (
                    <p className="text-sm text-red-600 mt-1">{errors.region.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    {t("userProfile.postalCode")}
                  </label>
                  <input
                    {...register("postalcode", {
                      required: t("userProfile.postalCodeRequired"),
                      pattern: {
                        value: /^[0-9]{3,10}$/,
                        message: t("userProfile.postalCodePattern"),
                      },
                    })}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.postalcode && (
                    <p className="text-sm text-red-600 mt-1">{errors.postalcode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700">{t("userProfile.country")}</label>
                  <input
                    {...register("country", { required: t("userProfile.countryRequired") })}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">{t("userProfile.phone")}</label>
                <input
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-\s]{6,15}$/,
                      message: t("userProfile.phonePattern"),
                    },
                  })}
                  className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingAddress(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 hover:cursor-pointer"
                >
                  {t("userProfile.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--primary-sun)] text-black rounded hover:bg-yellow-300 hover:cursor-pointer"
                >
                  {t("userProfile.saveAddress")}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
