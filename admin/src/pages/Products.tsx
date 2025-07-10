import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";
import axios from "axios";
import adminApi from "@/api/axios";

/* ──────────────────────────────────────────────────────────────────────────
   Zod shapes that exactly mirror what the API returns
   (↳ compile-time aliases created right after each schema)
─────────────────────────────────────────────────────────────────────────── */
const CategorySchema = z.object({ name: z.string(), slug: z.string() });

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(), // already Decimal➞number on the server
  stock: z.number(),
  createdAt: z.string(),
  category: CategorySchema.nullable(),
});
type Product = z.infer<typeof ProductSchema>;

const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
type Meta = z.infer<typeof MetaSchema>;

const ProductsResSchema = z.object({
  ok: z.boolean().optional(), // tolerate missing “ok”
  data: z.array(ProductSchema),
  meta: MetaSchema.optional(),
});
type ProductsRes = z.infer<typeof ProductsResSchema>;

/* ───────────────────────────── API helper ─────────────────────────────── */
async function getProducts(page = 1, limit = 20, signal?: AbortSignal) {
  const body = await adminApi.get<unknown>("/api/admin/products", {
    params: { page, limit },
    signal,
  });
  return ProductsResSchema.parse(body); // ← whole envelope
}

/* ───────────────────────────── custom hook ────────────────────────────── */
function usePaginatedProducts(initialPage = 1, limit = 20) {
  const [page, setPage] = useState(initialPage);
  const [rows, setRows] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p: number, controller: AbortController) => {
      setLoading(true);
      setError(null);
      try {
        const body = await getProducts(p, limit, controller.signal);

        /* neat dev-only dump – no extra typings needed */
        if (import.meta.env.DEV) console.debug("▶ products", body);

        setRows(body.data);
        setMeta(body.meta);
      } catch (err: any) {
        /* ─── silent cancel ─────────────────────────────────────────────── */
        if (
          err?.name === "AbortError" || // native fetch
          axios.isCancel?.(err) || // axios v0 (isCancel helper)
          err?.code === "ERR_CANCELED" // axios v1+
        ) {
          return;
        }
        console.error("Products load failed:", err);
        setError("Failed to load products");
        toast.error("Failed to load products");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const ac = new AbortController();
    load(page, ac);
    return () => ac.abort();
  }, [page, load]);

  return {
    rows,
    meta,
    page,
    setPage,
    loading,
    error,
    reload: () => load(page, new AbortController()),
  };
}

/* ───────────────────────────── helpers ────────────────────────────────── */
const fmtEGP = (v: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(v);

/* ───────────────────────────── component ──────────────────────────────── */
export default function Products() {
  const { rows, meta, page, setPage, loading, error, reload } =
    usePaginatedProducts();

  /* optimistic delete */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await adminApi.delete(`/api/admin/products/${id}`);
      toast.success("Deleted");
      reload(); // re-pull first page
    } catch (e) {
      toast.error("Delete failed");
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      {/* header */}
      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-orange)]">
          Products
        </h1>
        <Link
          to="/products/add"
          className="bg-[var(--primary-orange)] hover:bg-[var(--primary-redish)] text-white px-4 py-2 rounded transition"
        >
          + Add Product
        </Link>
      </header>

      {/* states */}
      {loading && <p className="text-gray-500">Loading…</p>}

      {error && (
        <div className="text-red-500">
          {error}{" "}
          <button onClick={reload} className="underline">
            retry
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-gray-500">No products found.</p>
      )}

      {!loading && !error && rows.length > 0 && (
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
                  Category:{" "}
                  <span className="font-medium">
                    {p.category?.name ?? "Uncategorised"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Price:{" "}
                  <span className="font-semibold">{fmtEGP(p.price)}</span>
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
