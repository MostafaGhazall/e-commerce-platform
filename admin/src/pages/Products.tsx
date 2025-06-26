import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  createdAt: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/admin/products", {
          withCredentials: true,
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`/api/admin/products/${id}`, {
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-orange)]">
          Products
        </h1>
        <Link
          to="/products/add"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">Slug: {product.slug}</p>
              <p className="text-sm text-gray-600">
                Price: EGP {product.price}
              </p>
              <p className="text-sm text-gray-600">Stock: {product.stock}</p>
              <p className="text-xs text-gray-400">
                Created at: {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <Link
                to={`/products/edit/${product.id}`}
                className="text-blue-500 hover:underline text-sm mt-2 mr-4"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-500 hover:underline text-sm mt-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
