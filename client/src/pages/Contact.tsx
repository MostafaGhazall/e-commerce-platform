import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Contact() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    toast.success(t("contact.thankYou"));
    reset();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t("contact.title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">{t("contact.name")}</label>
          <input
            {...register("name", { required: true })}
            className="w-full border px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("contact.email")}</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border px-4 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("contact.message")}</label>
          <textarea
            {...register("message", { required: true })}
            className="w-full border px-4 py-2 rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="bg-[var(--primary-orange)] text-white px-6 py-2 rounded hover:bg-[var(--primary-amber)]"
        >
          {t("contact.submit")}
        </button>
      </form>
    </div>
  );
}
