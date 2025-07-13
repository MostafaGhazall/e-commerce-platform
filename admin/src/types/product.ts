export interface ImageObj {
  id?: string;
  url: string;
}

export interface ColorObj {
  id?: string;
  name: string;
  value: string;
  images: ImageObj[];
}

export interface ProductDto {
  id: string;
  version: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category?: { slug: string; name: string };
  categorySlug: string;
  categoryNames: { en: string; ar: string };
  sizes: string | string[];
  images: ImageObj[];
  colors: ColorObj[];
}
