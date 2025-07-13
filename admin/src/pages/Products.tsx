import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import adminApi from "@/api/axios";
import { useProducts } from "@/hooks/useProducts";
import { Product, Meta } from "@/schemas/products";

/* ---------- util ------------ */
const fmtEGP = (v: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(v);

/* ---------- component ------- */
export default function Products() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useProducts(page, limit);

  /* optimistic delete */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await adminApi.delete(`/api/admin/products/${id}`);
      toast.success("Deleted");
      refetch();                    // invalidate current page
    } catch (e) {
      toast.error("Delete failed");
      console.error(e);
    }
  };

  const rows: Product[] = data?.data ?? [];
  const meta: Meta | undefined = data?.meta;

  return (
    <div className="p-6">
      {/* header */}
      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-orange)]">
          Products {isFetching && !isLoading && <span className="ml-2 text-xs">(refreshing…)</span>}
        </h1>
        <Link
          to="/products/add"
          className="bg-[var(--primary-orange)] hover:bg-[var(--primary-redish)] text-white px-4 py-2 rounded transition"
        >
          + Add Product
        </Link>
      </header>

      {/* states */}
      {isLoading && <p className="text-gray-500">Loading…</p>}

      {error && (
        <div className="text-red-500">
          Failed to load products{" "}
          <button onClick={() => refetch()} className="underline">
            retry
          </button>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <p className="text-gray-500">No products found.</p>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <>
          {/* grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rows.map((p) => (
              <article
                key={p.id}
                className="p-4 rounded-xl border bg-white shadow hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-sm text-gray-500">Slug: {p.slug}</p>
                <p className="text-sm text-gray-500">
                  Category: <span className="font-medium">{p.category?.name ?? "Uncategorised"}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Price: <span className="font-semibold">{fmtEGP(p.price)}</span>
                </p>
                <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Created&nbsp;{new Date(p.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-4 mt-4">
                  <Link
                    to={`/products/edit/${p.id}`}
                    className="text-sm text-[var(--primary-pinky)] hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm text-[var(--primary-redish)] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* pager */}
          {!!meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <span className="self-center text-sm">
                Page {meta.page} / {meta.totalPages}
              </span>
              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
