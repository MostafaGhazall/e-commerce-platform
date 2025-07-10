import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { STATIC_CATEGORY_SLUGS, type StaticCategorySlug } from "../constants/categories";

export interface Category {
  slug: string;
  name: string;   // localized label
}

export function useCategories() {
  const { t, i18n } = useTranslation();
  // i18n.language will be 'en' or 'ar'
  const lang = i18n.language as "en" | "ar";

  const [dynamicCats, setDynamicCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get<Category[]>(`/api/categories?lang=${lang}`)
      .then((res) => {
        // only keep categories that aren't our static ones
        const filtered = res.data.filter(
          (c) => !STATIC_CATEGORY_SLUGS.includes(c.slug as StaticCategorySlug)
        );
        setDynamicCats(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  // build the final list: static (i18n) first, then dynamic
  const staticCats: Category[] = STATIC_CATEGORY_SLUGS.map((slug) => ({
    slug,
    name: t(`navbar.${slug}`),
  }));

  return {
    categories: [...staticCats, ...dynamicCats],
    loading,
  };
}
