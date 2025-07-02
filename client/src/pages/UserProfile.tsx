import { useTranslation } from "react-i18next";
import { useUserStore } from "../contexts/useUserStore";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  UpdateProfileInput,
} from "../../../shared/userValidators";

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
    saveUserProfile,
  } = useUserStore();

  const [editingAddress, setEditingAddress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      address,
      city,
      region,
      postalcode,
      country,
      phone,
      birthday,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    await saveUserProfile(data);
    setEditingAddress(false);
  };

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
              <p className="mb-4 text-gray-600">
                {address || t("userProfile.noAddress")}
              </p>
              <button
                onClick={() => {
                  setEditingAddress(true);
                  reset({ address, city, region, postalcode, country, phone });
                }}
                className="text-[var(--primary-amber)] font-medium hover:cursor-pointer"
              >
                {address
                  ? t("userProfile.editAddress")
                  : t("userProfile.addAddress")}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Address */}
              <div>
                <label className="block text-sm text-gray-700">
                  {t("userProfile.address")}
                </label>
                <input
                  {...register("address")}
                  className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* City, Region, Postal, Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">
                    {t("userProfile.city")}
                  </label>
                  <input
                    {...register("city")}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700">
                    {t("userProfile.region")}
                  </label>
                  <input
                    {...register("region")}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.region && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.region.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700">
                    {t("userProfile.postalCode")}
                  </label>
                  <input
                    {...register("postalcode")}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.postalcode && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.postalcode.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700">
                    {t("userProfile.country")}
                  </label>
                  <input
                    {...register("country")}
                    className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-700">
                  {t("userProfile.phone")}
                </label>
                <input
                  {...register("phone")}
                  className="w-full border border-gray-300 px-4 py-2 rounded mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
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
