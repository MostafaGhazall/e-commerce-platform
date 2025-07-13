import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { STATIC_CATEGORY_SLUGS, type StaticCategorySlug } from "../constants/categories";

/* ---------- API shape ---------- */
interface CategoryApi {
  slug: string;
  names: { en: string; ar: string };
}

export interface Category {
  slug: string;
  name: string;  // localized label we’ll derive below
}

export function useCategories() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as "en" | "ar") ?? "en";

  const [dynamicCats, setDynamicCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get<CategoryApi[]>(`/api/categories?nonEmpty=1`)
      .then((res) => {
        const filtered = res.data
          .filter(
            (c) => !STATIC_CATEGORY_SLUGS.includes(c.slug as StaticCategorySlug)
          )
          .map((c) => ({
            slug: c.slug,
            name: c.names[lang] || c.names.en,   // fallback to English
          }));

        setDynamicCats(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  /* -------- static list (translations via i18n) -------- */
  const staticCats: Category[] = STATIC_CATEGORY_SLUGS.map((slug) => ({
    slug,
    name: t(`navbar.${slug}`),   // existing i18n keys
  }));

  return { categories: [...staticCats, ...dynamicCats], loading };
}
