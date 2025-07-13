import { Request, Response } from "express";
import prisma from "../prisma";

/* GET /api/categories?withCounts=1&nonEmpty=1 */
export const listCategories = async (req: Request, res: Response) => {
  const wantCounts = req.query.withCounts === "1";
  const onlyNonEmpty = req.query.nonEmpty === "1";

  /* ------------ DB query ---------------- */
  const cats = await prisma.category.findMany({
    orderBy: { slug: "asc" },

    /* ① if counts requested, include the relation count */
    ...(wantCounts && {
      include: { _count: { select: { products: true } } },
    }),

    /* ② if empty cats should be filtered out */
    ...(onlyNonEmpty && {
      where: { products: { some: {} } }, // “some” = at least one product
    }),

    /* ③ always select the common fields */
    select: {
      id: true,
      slug: true,
      names: true,
      ...(wantCounts && { _count: true }),
    },
  });

  /* ------------ shape response ---------------- */
  const shaped = cats.map((c) =>
    wantCounts
      ? {
          id: c.id,
          slug: c.slug,
          names: c.names,
          count: (c as any)._count.products, // safe thanks to wantCounts
        }
      : {
          id: c.id,
          slug: c.slug,
          names: c.names,
        }
  );

  res.json(shaped);
};
