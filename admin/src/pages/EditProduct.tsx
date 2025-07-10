import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import adminApi from "../api/axios";
import axios from "axios";
import { shapeZodError } from "@/utils/shapeZodError";
import { isAllowedImageUrl } from "@/utils/isAllowedImage";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface ImageObj {
  id?: string;
  url: string;
}
interface ColorObj {
  id?: string;
  name: string;
  value: string;
  images: ImageObj[];
}
interface ProductDto {
  id: string;
  version: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;

  category?: { name: string; slug: string };

  categoryName: string;
  sizes: string | string[];
  images: ImageObj[];
  colors: ColorObj[];
}
/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
// immutable update helpers
const updateList = <T,>(list: T[], idx: number, val: Partial<T>) =>
  list.map((el, i) => (i === idx ? { ...el, ...val } : el));
const removeAt = <T,>(list: T[], idx: number) =>
  list.filter((_, i) => i !== idx);

const isHex = (hex: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const EMPTY: ProductDto = {
    id: "",
    version: 0,
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    categoryName: "",
    sizes: "",
    images: [{ url: "" }],
    colors: [{ name: "", value: "", images: [{ url: "" }] }],
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductDto>(EMPTY);

  /* ----------------------------- Fetch product once ----------------------------- */
  useEffect(() => {
    (async () => {
      try {
        /* 🔹 second generic → resolved value IS ProductDto */
        const p = await adminApi.get<ProductDto, ProductDto>(
          `/api/admin/products/${id}`
        );

        setForm({
          ...p,
          categoryName: p.categoryName ?? p.category?.name ?? "",
          sizes: Array.isArray(p.sizes) ? p.sizes : p.sizes ?? [],
        });
      } catch (err: any) {
        toast.error(err?.response?.data?.error ?? "Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* ----------------------------- Helpers ----------------------------- */
  const onField =
    <K extends keyof ProductDto>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  /* ----------------------------- Submit ----------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);
    const raw = form.sizes;
    const sizes = Array.isArray(raw)
      ? raw
      : raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    /* client-side sanity checks ------------------------------------- */
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
      await adminApi.put(`/api/admin/products/${form.id}`, {
        ...form,
        price,
        stock,
        sizes,
        images: form.images.filter((i) => i.url.trim()),
        colors: form.colors
          .filter((c) => c.name.trim() && c.value.trim())
          .map((c) => ({ ...c, images: c.images.filter((i) => i.url.trim()) })),
      });

      toast.success("Product updated");
      navigate(-1); // optimistic back
    } catch (err: any) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? shapeZodError(err.response.data.error)
          : "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Render ----------------------------- */
  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <fieldset disabled={saving} className="space-y-4">
          {/* BASIC FIELDS ------------------------------------------------------- */}
          {[
            { id: "name", label: "Name", type: "text" },
            { id: "slug", label: "Slug", type: "text" },
            { id: "categoryName", label: "Category", type: "text" },
            {
              id: "price",
              label: "Price",
              type: "number",
              min: 0,
              step: "0.01",
            },
            { id: "stock", label: "Stock", type: "number", min: 0 },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium mb-1">
                {f.label}
              </label>
              <input
                {...f}
                id={f.id}
                value={(form as any)[f.id]}
                onChange={onField(f.id as any)}
                className="w-full border p-2 rounded"
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={onField("description")}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="sizes" className="block text-sm font-medium mb-1">
              Sizes (comma-separated)
            </label>
            <input
              id="sizes"
              value={
                Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes
              }
              onChange={onField("sizes")}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* IMAGES ------------------------------------------------------------- */}
          <div className="space-y-2">
            <span className="font-semibold">Images</span>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  aria-label={`Image ${i + 1}`}
                  value={img.url}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      images: updateList(p.images, i, { url: e.target.value }),
                    }))
                  }
                  className="flex-1 border p-2 rounded"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() =>
                    setForm((p) => ({ ...p, images: removeAt(p.images, i) }))
                  }
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, images: [...p.images, { url: "" }] }))
              }
              className="text-sm text-blue-600"
            >
              + Add image
            </button>
          </div>

          {/* COLORS ------------------------------------------------------------- */}
          <div className="space-y-4">
            <span className="font-semibold">Colors</span>

            {form.colors.map((c, i) => (
              <div key={i} className="border p-4 rounded space-y-2 bg-gray-50">
                <input
                  aria-label="Color name"
                  value={c.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      colors: updateList(p.colors, i, { name: e.target.value }),
                    }))
                  }
                  placeholder="Color name"
                  className="w-full border p-2 rounded"
                />
                <input
                  aria-label="Color hex"
                  value={c.value}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      colors: updateList(p.colors, i, {
                        value: e.target.value,
                      }),
                    }))
                  }
                  placeholder="#hex"
                  className="w-full border p-2 rounded"
                />

                {/* Color images */}
                {c.images.map((img, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      aria-label={`Color image ${j + 1}`}
                      value={img.url}
                      onChange={(e) =>
                        setForm((p) => {
                          const newColors = [...p.colors];
                          newColors[i].images = updateList(
                            newColors[i].images,
                            j,
                            {
                              url: e.target.value,
                            }
                          );
                          return { ...p, colors: newColors };
                        })
                      }
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      aria-label="Remove color image"
                      onClick={() =>
                        setForm((p) => {
                          const newColors = [...p.colors];
                          newColors[i].images = removeAt(
                            newColors[i].images,
                            j
                          );
                          return { ...p, colors: newColors };
                        })
                      }
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="text-sm text-blue-600 pr-3"
                  onClick={() =>
                    setForm((p) => {
                      const newColors = [...p.colors];
                      newColors[i].images.push({ url: "" });
                      return { ...p, colors: newColors };
                    })
                  }
                >
                  + Add color image
                </button>

                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setForm((p) => ({ ...p, colors: removeAt(p.colors, i) }))
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
                setForm((p) => ({
                  ...p,
                  colors: [
                    ...p.colors,
                    { name: "", value: "", images: [{ url: "" }] },
                  ],
                }))
              }
            >
              + Add color
            </button>
          </div>

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
