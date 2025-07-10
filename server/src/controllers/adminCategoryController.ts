import { Request, Response } from "express";
import prisma from "../prisma";

type Locale = "en" | "ar";
type NamesMap = Record<Locale, string>;

export const listCategories = async (req: Request, res: Response) => {
  // pick locale from `?lang=ar` or default to English
  const locale: Locale = req.query.lang === "ar" ? "ar" : "en";

  const cats = await prisma.category.findMany({
    select: { slug: true, names: true },
    orderBy: { slug: "asc" },
  });

  const payload = cats.map((c) => {
    // assert that `names` is our `{ en: string; ar: string }` map
    const names = c.names as NamesMap;
    return {
      slug: c.slug,
      name: names[locale] ?? c.slug,  // fallback to slug
    };
  });

  res.json(payload);
};
