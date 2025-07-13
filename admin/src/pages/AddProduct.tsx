import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { shapeZodError } from "@/utils/shapeZodError";
import { isAllowedImageUrl } from "@/utils/isAllowedImage";
import { CategoryNames } from "@/types/category";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface Category {
  id: string;
  names: { en: string; ar: string };
  slug: string;
}

interface ColorForm {
  name: string;
  value: string;
  images: string[];
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  categorySlug: string; // selected existing category OR ""
  categoryNames: CategoryNames; // holds English + Arabic for “new”
  sizes: string;
  images: string[];
  colors: ColorForm[];
}

const emptyNames = { en: "", ar: "" };
const newColor = (): ColorForm => ({ name: "", value: "", images: [""] });

/* ------------------------------------------------------------------ */
/* Regex helpers                                                      */
/* ------------------------------------------------------------------ */
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function AddProduct() {
  const navigate = useNavigate();

  /* category list --------------------------------------------------- */
  const [isNewCat, setIsNewCat] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  /* form state ------------------------------------------------------ */
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    categorySlug: "",
    categoryNames: { ...emptyNames },
    sizes: "",
    images: [""], // start with one empty slot
    colors: [newColor()],
  });
  /* fetch categories once ------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<Category[]>("/api/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  /* generic onChange handler --------------------------------------- */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* client-side guard ---------------------------------------------- */
  const validateForm = () => {
    const required = ["name", "slug", "price", "stock"] as const;

    if (!form.categorySlug && !isNewCat)
      return toast.error("Please select a category or create a new one");

    if (
      isNewCat &&
      (!form.categoryNames.en.trim() || !form.categoryNames.ar.trim())
    )
      return toast.error("Both English and Arabic names are required");

    if (required.some((key) => !form[key])) {
      toast.error("Name, slug, price, stock are required");
      return false;
    }

    if (isNaN(Number(form.price)) || isNaN(Number(form.stock))) {
      toast.error("Price and stock must be numbers");
      return false;
    }

    /* main images */
    const mainImages = form.images.filter(Boolean);
    if (mainImages.length === 0) {
      toast.error("At least one product image is required");
      return false;
    }
    if (!mainImages.every(isAllowedImageUrl)) {
      toast.error(
        "Image URLs must start with http / https / data / ipfs / ar / ftp"
      );
      return false;
    }

    /* color palette */
    const palette = form.colors.map((c) => ({
      ...c,
      images: c.images.filter(Boolean),
    }));

    for (const { value: hex, images } of palette) {
      /* hex check --------------------------------------------------- */
      if (hex && !HEX_RE.test(hex)) {
        toast.error(`Color ${hex} is not a valid hex (#RGB / #RRGGBB)`);
        return false;
      }
      /* color-images check ------------------------------------------ */
      if (!images.every(isAllowedImageUrl)) {
        toast.error(
          "Every colour image URL must start with an allowed protocol"
        );
        return false;
      }
    }

    return true;
  };

  /* submit ---------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 👉 clean *again* right before we send
    const cleaned = {
      ...form,

      images: form.images
        .filter(Boolean) // remove blanks
        .map((u) => ({ url: u })), // ⬅️  wrap

      colors: form.colors
        .map((c) => ({
          ...c,
          images: c.images.filter(Boolean).map((u) => ({ url: u })), // ⬅️  wrap
        }))
        .filter((c) => c.name || c.value || c.images.length),
    };

    setLoading(true);
    try {
      const {
        categorySlug: _drop,
        categoryNames: _ignore,
        ...cleanedForSend
      } = cleaned;
      const selectedNames = isNewCat
        ? {
            en: form.categoryNames.en.trim(),
            ar: form.categoryNames.ar.trim(),
          }
        : categories.find((c) => c.slug === form.categorySlug)?.names ?? {
            en: "",
            ar: "",
          };

      await axios.post(
        "/api/admin/products",
        {
          ...cleanedForSend,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          sizes: form.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          categoryNames: selectedNames,
        },
        { withCredentials: true }
      );
      toast.success("Product added!");
      navigate("/products");
    } catch (err: any) {
      console.error("Error adding product", err);
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? shapeZodError(err.response.data.error)
          : "Failed to add product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* JSX                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-orange)]">
        Add Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-2xl shadow-md"
      >
        {/* BASIC FIELDS ------------------------------------------------ */}
        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-[var(--primary-orange)]"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleInputChange}
            placeholder="Slug"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-[var(--primary-orange)]"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-[var(--primary-orange)]"
          />
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="w-full border border-gray-300 p-3 rounded-lg"
          />
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleInputChange}
            placeholder="Stock"
            className="w-full border border-gray-300 p-3 rounded-lg"
          />
        </div>

        {/* CATEGORY SELECT ------------------------------------------------- */}
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
                    setForm((p) => ({
                      ...p,
                      categorySlug: "",
                      categoryNames: { ...emptyNames },
                    }));
                  } else {
                    const cat = categories.find((c) => c.slug === v)!;
                    setIsNewCat(false);
                    setForm((p) => ({
                      ...p,
                      categorySlug: v,
                      categoryNames: cat.names, // keep Arabic too
                    }));
                  }
                }}
                className="w-full border border-gray-300 p-3 rounded-lg"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <input
                    value={form.categoryNames.en}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        categoryNames: {
                          ...p.categoryNames,
                          en: e.target.value,
                        },
                      }))
                    }
                    placeholder="Category (English)"
                    className="border border-gray-300 p-3 rounded-lg"
                  />
                  <input
                    dir="rtl"
                    value={form.categoryNames.ar}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        categoryNames: {
                          ...p.categoryNames,
                          ar: e.target.value,
                        },
                      }))
                    }
                    placeholder="الفئة (Arabic)"
                    className="border border-gray-300 p-3 rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* SIZES ------------------------------------------------------- */}
        <input
          name="sizes"
          value={form.sizes}
          onChange={handleInputChange}
          placeholder="Sizes (comma separated)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        {/* MAIN IMAGES ------------------------------------------------- */}
        <div className="space-y-3">
          <label className="font-semibold">Main Images</label>
          {form.images.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={url}
                onChange={(e) => {
                  const updated = [...form.images];
                  updated[i] = e.target.value;
                  setForm((p) => ({ ...p, images: updated }));
                }}
                placeholder={`Image URL ${i + 1}`}
                className="flex-1 border border-gray-300 p-2 rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    images: p.images.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((p) => ({ ...p, images: [...p.images, ""] }))
            }
            className="text-sm text-[var(--primary-orange)]"
          >
            + Add Image
          </button>
        </div>

        {/* COLORS ------------------------------------------------------ */}
        <div className="space-y-3">
          <label className="font-semibold">Colors</label>
          {form.colors.map((color, i) => (
            <div
              key={i}
              className="border border-gray-200 p-4 rounded-lg space-y-3"
            >
              {/* name / hex */}
              <input
                value={color.name}
                onChange={(e) => {
                  const updated = [...form.colors];
                  updated[i].name = e.target.value;
                  setForm((p) => ({ ...p, colors: updated }));
                }}
                placeholder="Color name"
                className="w-full border border-gray-300 p-2 rounded-lg"
              />
              <input
                value={color.value}
                onChange={(e) => {
                  const updated = [...form.colors];
                  updated[i].value = e.target.value;
                  setForm((p) => ({ ...p, colors: updated }));
                }}
                placeholder="#hex value"
                className="w-full border border-gray-300 p-2 rounded-lg"
              />

              {/* color images */}
              {color.images.map((url, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <input
                    value={url}
                    onChange={(e) => {
                      const updated = [...form.colors];
                      updated[i].images[j] = e.target.value;
                      setForm((p) => ({ ...p, colors: updated }));
                    }}
                    placeholder={`Color image ${j + 1}`}
                    className="flex-1 border border-gray-300 p-2 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...form.colors];
                      updated[i].images = updated[i].images.filter(
                        (_, idx) => idx !== j
                      );
                      setForm((p) => ({ ...p, colors: updated }));
                    }}
                    className="text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const updated = [...form.colors];
                  updated[i].images.push("");
                  setForm((p) => ({ ...p, colors: updated }));
                }}
                className="text-sm text-[var(--primary-orange)] pr-4"
              >
                + Add Color Image
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    colors: p.colors.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-sm text-red-600"
              >
                Remove Color
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                colors: [...p.colors, newColor()],
              }))
            }
            className="text-sm text-[var(--primary-orange)]"
          >
            + Add Color
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--primary-orange)] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[var(--primary-redish)] transition disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
