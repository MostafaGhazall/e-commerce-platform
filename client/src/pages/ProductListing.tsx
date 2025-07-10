import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCategories } from "../contexts/useCategories";
import { useProductStore } from "../contexts/useStore";
import ProductCard from "../components/ProductCard";

const ProductListing = () => {
  const { t } = useTranslation();
  const {
    filteredProducts,
    loadProducts,
    loading: productsLoading,
    setSearchQuery,
    setCategoryFilter,
    setSortOption,
    sortProducts,
    resetFilters,
    categoryFilter,
    sortOption,
  } = useProductStore();

  // our new hook for merged static + dynamic categories
  const { categories, loading: catsLoading } = useCategories();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mobileCategory, setMobileCategory] = useState("");

  /* Load products on mount */
  useEffect(() => {
    loadProducts();
  }, []);

  /* Sync URL → store */
  useEffect(() => {
    const search   = searchParams.get("search")   || "";
    const category = searchParams.get("category") || "";
    const sort     = searchParams.get("sort")     || "";

    setSearchQuery(search);
    setCategoryFilter(category);
    setMobileCategory(category);
    setSortOption(sort);
    sortProducts(sort);
  }, [searchParams]);

  /* Update URL helper */
  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const q = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) =>
      v ? q.set(k, v) : q.delete(k)
    );
    navigate(`/products?${q.toString()}`);
  };

  const handleCategoryClick = (slug: string) =>
    updateUrl({ category: slug });

  const handleMobileCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => handleCategoryClick(e.target.value);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sel = e.target.value;
    setSortOption(sel);
    sortProducts(sel);
    updateUrl({ sort: sel || undefined });
  };

  const handleClearFilters = () => {
    resetFilters();
    navigate("/products");
  };

  /* Show spinner if products are loading */
  if (productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--primary-orange)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--primary-orange)]">
              {t("productListing.categories")}
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:underline"
            >
              {t("productListing.clearFilters")}
            </button>
          </div>
          <ul className="space-y-2">
            {catsLoading ? (
              <li>{t("loading")}…</li>
            ) : (
              categories.map(({ slug, name }) => (
                <li key={slug}>
                  <button
                    onClick={() => handleCategoryClick(slug)}
                    className={`block w-full text-left px-4 py-2 rounded transition ${
                      categoryFilter === slug
                        ? "bg-[var(--primary-orange)] text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-[var(--primary-orange)] hover:text-white"
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Main content */}
        <main className="md:col-span-3 w-full">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Mobile category dropdown */}
            <select
              value={mobileCategory}
              onChange={handleMobileCategoryChange}
              className="md:hidden border border-gray-300 px-3 py-2 rounded shadow-sm w-full"
            >
              <option value="">{t("productListing.selectCategory")}</option>
              {catsLoading ? (
                <option>{t("loading")}…</option>
              ) : (
                categories.map(({ slug, name }) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))
              )}
            </select>

            {/* Sort dropdown */}
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="border border-gray-300 px-3 py-2 rounded shadow-sm w-full md:w-1/3"
            >
              <option value="">{t("productListing.sortBy")}</option>
              <option value="price-low">
                {t("productListing.priceLow")}
              </option>
              <option value="price-high">
                {t("productListing.priceHigh")}
              </option>
              <option value="alpha">{t("productListing.alpha")}</option>
            </select>
          </div>

          {/* Results */}
          {filteredProducts.length === 0 ? (
            <div className="text-center text-[var(--primary-orange)] py-20">
              <img
                src="/images/empty-state.png"
                alt="No Products"
                className="mx-auto w-40 h-40 mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">
                {t("productListing.noProducts")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("productListing.tryAdjusting")}
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-[var(--primary-sun)] text-black px-4 py-2 rounded hover:bg-yellow-300"
              >
                {t("productListing.resetFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
