export interface CategoryNames {
  en: string;
  ar: string;
}

/** A single row in the categories table / collection */
export interface Category {
  id: string;
  slug: string;          // URL-safe identifier, e.g. "men-shoes"
  names: CategoryNames;  // i18n display names
}
