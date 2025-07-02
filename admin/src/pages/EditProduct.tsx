import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    description: string;
    price: string;   // string for easy binding, convert on submit
    stock: string;
    category: string;
    sizes: string;   // comma-separated string “6, 7, 8”
    images: ImageObj[];
    colors: ColorObj[];
  }>({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sizes: "",
    images: [{ id: "", url: "" }],
    colors: [
      {
        id: "",
        name: "",
        value: "",
        images: [{ id: "", url: "" }],
      },
    ],
  });

  /* ─────────────────────────────────────────────────────────── */
  /* Load product on mount                                       */
  /* ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/admin/products/${id}`, {
          withCredentials: true,
        });

        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price.toString(),
          stock: data.stock.toString(),
          category: data.category,
          sizes: data.sizes.join(", "),
          images: data.images, // [{ id, url }]
          colors: data.colors.map((c: any) => ({
            id: c.id,
            name: c.name,
            value: c.value,
            images: c.images, // [{ id, url }]
          })),
        });
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ─────────────────────────────────────────────────────────── */
  /* Simple text/textarea change handler                         */
  /* ─────────────────────────────────────────────────────────── */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Submit                                                      */
  /* ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/admin/products/${id}`,
        {
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          sizes: form.sizes.split(",").map((s) => s.trim()),
          images: form.images.map(({ id, url }) => ({ id, url })),
          colors: form.colors.map((c) => ({
            id: c.id,
            name: c.name,
            value: c.value,
            images: c.images.map(({ id, url }) => ({ id, url })),
          })),
        },
        { withCredentials: true }
      );

      toast.success("Product updated");
      navigate("/products");
    } catch {
      toast.error("Failed to update product");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  /* ─────────────────────────────────────────────────────────── */
  /* UI                                                          */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <fieldset disabled={loading} className="space-y-4">
          {/* Basic fields */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={form.slug}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="sizes"
            placeholder="Sizes (comma-separated)"
            value={form.sizes}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          />

          {/* Product-level images */}
          <div className="space-y-2">
            <label className="block font-semibold">Images</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={img.url}
                  onChange={(e) => {
                    const updated = [...form.images];
                    updated[i].url = e.target.value;
                    setForm((prev) => ({ ...prev, images: updated }));
                  }}
                  placeholder={`Image URL ${i + 1}`}
                  className="flex-1 border p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, idx) => idx !== i),
                    }));
                  }}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  images: [...prev.images, { id: "", url: "" }],
                }))
              }
              className="text-sm text-blue-600"
            >
              + Add Image
            </button>
          </div>

          {/* Colors + nested images */}
          <div className="space-y-2 mt-6">
            <label className="block font-semibold">Colors</label>
            {form.colors.map((color, i) => (
              <div key={i} className="border p-4 rounded space-y-2 bg-gray-50">
                <input
                  type="text"
                  placeholder="Color name"
                  value={color.name}
                  onChange={(e) => {
                    const updated = [...form.colors];
                    updated[i].name = e.target.value;
                    setForm((prev) => ({ ...prev, colors: updated }));
                  }}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Color value (#FF0000)"
                  value={color.value}
                  onChange={(e) => {
                    const updated = [...form.colors];
                    updated[i].value = e.target.value;
                    setForm((prev) => ({ ...prev, colors: updated }));
                  }}
                  className="w-full border p-2 rounded"
                />

                {color.images.map((img, j) => (
                  <div key={j} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Color Image ${j + 1}`}
                      value={img.url}
                      onChange={(e) => {
                        const updated = [...form.colors];
                        updated[i].images[j].url = e.target.value;
                        setForm((prev) => ({ ...prev, colors: updated }));
                      }}
                      className="flex-1 border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...form.colors];
                        updated[i].images = updated[i].images.filter(
                          (_, idx) => idx !== j
                        );
                        setForm((prev) => ({ ...prev, colors: updated }));
                      }}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const updated = [...form.colors];
                    updated[i].images.push({ id: "", url: "" });
                    setForm((prev) => ({ ...prev, colors: updated }));
                  }}
                  className="text-sm text-blue-600"
                >
                  + Add Color Image
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      colors: prev.colors.filter((_, idx) => idx !== i),
                    }));
                  }}
                  className="text-sm text-red-600 mt-2"
                >
                  Remove Color
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  colors: [
                    ...prev.colors,
                    { id: "", name: "", value: "", images: [{ id: "", url: "" }] },
                  ],
                }))
              }
              className="text-sm text-blue-600"
            >
              + Add Color
            </button>
          </div>

          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Update Product
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default EditProduct;
