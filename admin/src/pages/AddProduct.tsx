import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sizes: "",
    images: [""],
    colors: [
      {
        name: "",
        value: "",
        images: [""],
      },
    ],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name || !form.slug || !form.price || !form.stock) {
      toast.error("Name, slug, price, and stock are required.");
      return false;
    }
    if (isNaN(Number(form.price)) || isNaN(Number(form.stock))) {
      toast.error("Price and stock must be numbers.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post("/api/admin/products", {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sizes: form.sizes.split(",").map((s) => s.trim()),
        images: form.images.map((url) => ({ url })), // ✅ transform product-level images
        colors: form.colors.map((color) => ({
          name: color.name,
          value: color.value,
          images: color.images.map((url) => ({ url })), // ✅ transform nested color images
        })),
      });
      toast.success("Product added!");
      navigate("/products");
    } catch (err) {
      console.error("Error adding product", err);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleInputChange}
          placeholder="Slug"
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleInputChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleInputChange}
          placeholder="Stock"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleInputChange}
          placeholder="Category"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="sizes"
          value={form.sizes}
          onChange={handleInputChange}
          placeholder="Sizes (comma-separated)"
          className="w-full border p-2 rounded"
        />
        <div className="space-y-2">
          <label className="block font-semibold">Images</label>
          {form.images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const updated = [...form.images];
                  updated[i] = e.target.value;
                  setForm((prev) => ({ ...prev, images: updated }));
                }}
                placeholder={`Image URL ${i + 1}`}
                className="flex-1 border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = form.images.filter((_, index) => index !== i);
                  setForm((prev) => ({ ...prev, images: updated }));
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
              setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))
            }
            className="text-sm text-blue-600"
          >
            + Add Image
          </button>
        </div>
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

              {color.images.map((url, j) => (
                <div key={j} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Color Image ${j + 1}`}
                    value={url}
                    onChange={(e) => {
                      const updated = [...form.colors];
                      updated[i].images[j] = e.target.value;
                      setForm((prev) => ({ ...prev, colors: updated }));
                    }}
                    className="flex-1 border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...form.colors];
                      updated[i].images = updated[i].images.filter(
                        (_, index) => index !== j
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
                  updated[i].images.push("");
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
                    colors: prev.colors.filter((_, index) => index !== i),
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
                colors: [...prev.colors, { name: "", value: "", images: [""] }],
              }))
            }
            className="text-sm text-blue-600"
          >
            + Add Color
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
