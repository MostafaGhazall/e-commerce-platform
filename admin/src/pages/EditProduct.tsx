import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import adminApi from "@/api/axios";
import axios from "axios";

import { ProductDto } from "@/types/product";
import { CategoryNames } from "@/types/category";

import { useProduct } from "@/hooks/useProduct";
import { useCategories } from "@/hooks/useCategories";
import { shapeZodError } from "@/utils/shapeZodError";
import { isAllowedImageUrl } from "@/utils/isAllowedImage";

/* ───── helpers ───────────────────────────────────────────── */
const updateList = <T,>(list: T[], i: number, v: Partial<T>) =>
  list.map((el, idx) => (idx === i ? { ...el, ...v } : el));
const removeAt = <T,>(list: T[], i: number) =>
  list.filter((_, idx) => idx !== i);
const isHex = (h: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h);

/* ───── component ─────────────────────────────────────────── */
export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /* data hooks ---------------------------------------------------- */
  const { data: prod, isLoading: prodLoading } = useProduct(id);
  const { data: categories = [], isLoading: catLoading } = useCategories();

  /* local form state (only set once product is fetched) ----------- */
  const [form, setForm] = useState<ProductDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNewCat, setIsNewCat] = useState(false);

  /* initialise the form once ------------------------------------- */
  useEffect(() => {
    if (!prod) return;

    setForm({
      ...prod,
      categorySlug: prod.category?.slug ?? "",
      categoryNames: { en: "", ar: "" },
      sizes: Array.isArray(prod.sizes) ? prod.sizes : prod.sizes ?? [],
      images: prod.images?.length ? prod.images : [{ url: "" }],
      colors: prod.colors?.length
        ? prod.colors.map((c) => ({
            ...c,
            images: c.images?.length ? c.images : [{ url: "" }],
          }))
        : [{ name: "", value: "", images: [{ url: "" }] }],
    });
  }, [prod]);

  /* guard render while loading ----------------------------------- */
  if (prodLoading || !form) return <p className="p-6">Loading…</p>;

  /* field helper -------------------------------------------------- */
  const onField =
    <K extends keyof ProductDto>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => p && { ...p, [key]: e.target.value });

  /* submit -------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const price = +form.price;
    const stock = +form.stock;
    const sizes = Array.isArray(form.sizes)
      ? form.sizes
      : form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    if (Number.isNaN(price) || Number.isNaN(stock))
      return toast.error("Price / Stock must be valid numbers");

    if (!form.images.every((i) => isAllowedImageUrl(i.url)))
      return toast.error(
        "Image URL must start with http / https / data / ipfs / ar / ftp"
      );

    if (!form.colors.every((c) => isHex(c.value)))
      return toast.error("Color codes must be valid hex (#RRGGBB)");

    setSaving(true);
    try {
      const cleaned = {
        ...form,
        images: form.images
          .filter((i) => i.url.trim())
          .map((i) => ({ url: i.url })),
        colors: form.colors
          .filter((c) => c.name.trim() && c.value.trim())
          .map((c) => ({ ...c, images: c.images.filter((i) => i.url.trim()) })),
      };

      const {
        categorySlug: _drop,
        categoryNames: _ignore,
        ...cleanForSend
      } = cleaned;

      const selectedNames: CategoryNames = isNewCat
        ? { en: form.categoryNames.en.trim(), ar: form.categoryNames.ar.trim() }
        : categories.find((c) => c.slug === form.categorySlug)?.names ?? {
            en: "",
            ar: "",
          };

      await adminApi.put(`/api/admin/products/${form.id}`, {
        ...cleanForSend,
        price,
        stock,
        sizes,
        categoryNames: selectedNames,
      });

      /* 🔄 tell React Query that the cached copies are now stale */
      queryClient.invalidateQueries({ queryKey: ["product", form.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success("Product updated");
      navigate(-1);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? shapeZodError(err.response.data.error)
          : "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ───── JSX ──────────────────────────────────────────────────── */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <fieldset disabled={saving} className="space-y-4">
          {/* BASIC */}
          {["name", "slug", "price", "stock"].map((f) => (
            <div key={f}>
              <label className="block text-sm font-medium mb-1">
                {f[0].toUpperCase() + f.slice(1)}
              </label>
              <input
                id={f}
                type={f === "price" || f === "stock" ? "number" : "text"}
                value={(form as any)[f]}
                onChange={onField(f as any)}
                className="w-full border p-2 rounded"
              />
            </div>
          ))}

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={onField("description")}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* SIZES */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Sizes (comma-separated)
            </label>
            <input
              value={
                Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes
              }
              onChange={onField("sizes")}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="font-semibold">Category</label>
            {catLoading ? (
              <p className="text-sm text-gray-500">Loading categories…</p>
            ) : (
              <>
                <select
                  value={isNewCat ? "__new" : form.categorySlug}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__new") {
                      setIsNewCat(true);
                      setForm({
                        ...form,
                        categorySlug: "",
                        categoryNames: { en: "", ar: "" },
                      });
                    } else {
                      const cat = categories.find((c) => c.slug === v)!;
                      setIsNewCat(false);
                      setForm({
                        ...form,
                        categorySlug: v,
                        categoryNames: cat.names,
                      });
                    }
                  }}
                  className="w-full border p-2 rounded"
                >
                  <option value="" disabled>
                    -- Select Category --
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.names.en} / {c.names.ar}
                    </option>
                  ))}
                  <option value="__new">+ New Category…</option>
                </select>

                {isNewCat && (
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    <input
                      value={form.categoryNames.en}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryNames: {
                            ...form.categoryNames,
                            en: e.target.value,
                          },
                        })
                      }
                      placeholder="Category (English)"
                      className="border p-2 rounded"
                    />
                    <input
                      dir="rtl"
                      value={form.categoryNames.ar}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryNames: {
                            ...form.categoryNames,
                            ar: e.target.value,
                          },
                        })
                      }
                      placeholder="الفئة (Arabic)"
                      className="border p-2 rounded"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* IMAGES */}
          <div className="space-y-2">
            <span className="font-semibold">Images</span>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={img.url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      images: updateList(form.images, i, {
                        url: e.target.value,
                      }),
                    })
                  }
                  className="flex-1 border p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, images: removeAt(form.images, i) })
                  }
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-blue-600"
              onClick={() =>
                setForm({ ...form, images: [...form.images, { url: "" }] })
              }
            >
              + Add image
            </button>
          </div>

          {/* COLORS */}
          <div className="space-y-4">
            <span className="font-semibold">Colors</span>
            {form.colors.map((c, i) => (
              <div key={i} className="border p-4 rounded space-y-2 bg-gray-50">
                <input
                  value={c.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      colors: updateList(form.colors, i, {
                        name: e.target.value,
                      }),
                    })
                  }
                  placeholder="Color name"
                  className="w-full border p-2 rounded"
                />
                <input
                  value={c.value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      colors: updateList(form.colors, i, {
                        value: e.target.value,
                      }),
                    })
                  }
                  placeholder="#hex"
                  className="w-full border p-2 rounded"
                />
                {c.images.map((img, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      value={img.url}
                      onChange={(e) => {
                        const newColors = [...form.colors];
                        newColors[i].images = updateList(
                          newColors[i].images,
                          j,
                          { url: e.target.value }
                        );
                        setForm({ ...form, colors: newColors });
                      }}
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = [...form.colors];
                        newColors[i].images = removeAt(newColors[i].images, j);
                        setForm({ ...form, colors: newColors });
                      }}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-blue-600 pr-3"
                  onClick={() => {
                    const newColors = [...form.colors];
                    newColors[i].images.push({ url: "" });
                    setForm({ ...form, colors: newColors });
                  }}
                >
                  + Add color image
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setForm({ ...form, colors: removeAt(form.colors, i) })
                  }
                >
                  Remove color
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-blue-600"
              onClick={() =>
                setForm({
                  ...form,
                  colors: [
                    ...form.colors,
                    { name: "", value: "", images: [{ url: "" }] },
                  ],
                })
              }
            >
              + Add color
            </button>
          </div>

          {/* ACTION */}
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--primary-orange)] text-white px-4 py-2 rounded"
          >
            {saving ? "Saving…" : "Update product"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
