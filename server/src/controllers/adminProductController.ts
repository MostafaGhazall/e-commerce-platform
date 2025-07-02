import { Request, Response } from "express";
import prisma from "../prisma";
import { updateProductSchema } from "../../../shared/userValidators";

// ✅ Get all products
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true, colors: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Create a product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      price,
      description,
      stock,
      category,
      sizes,
      images,
      colors,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price,
        description,
        stock,
        category, // see “Category?” below
        sizes, // if this is String[], pass string[]
        images: {
          create: images.map((url: string) => ({ url })),
        },
        colors: {
          create: colors.map((c: any) => ({
            name: c.name,
            value: c.value,
            images: { create: c.images.map((url: string) => ({ url })) },
          })),
        },
      },
      include: { images: true, colors: { include: { images: true } } },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.flatten() });
    return;
  }

  const {
    name,
    slug,
    price,
    description,
    stock,
    category,
    sizes,
    images,
    colors,
  } = parseResult.data;

  try {
    const finalProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { name, slug, price, description, stock, category, sizes },
      });

      const imageIds = images.filter((i: any) => i.id).map((i: any) => i.id);
      await tx.image.deleteMany({
        where: { productId: id, id: { notIn: imageIds } },
      });

      await Promise.all(
        images.map((img: any) =>
          img.id
            ? tx.image.update({
                where: { id: img.id },
                data: { url: img.url },
              })
            : tx.image.create({
                data: { url: img.url, productId: id },
              })
        )
      );

      const colorIds = colors.filter((c: any) => c.id).map((c: any) => c.id);
      await tx.color.deleteMany({
        where: { productId: id, id: { notIn: colorIds } },
      });

      for (const col of colors) {
        const currentColor =
          col.id &&
          (await tx.color.update({
            where: { id: col.id },
            data: { name: col.name, value: col.value },
          }));

        const colorId = currentColor
          ? currentColor.id
          : (
              await tx.color.create({
                data: { name: col.name, value: col.value, productId: id },
              })
            ).id;

        const colorImageIds =
          col.images?.filter((i: any) => i.id).map((i: any) => i.id) ?? [];

        await tx.colorImage.deleteMany({
          where: { colorId, id: { notIn: colorImageIds } },
        });

        await Promise.all(
          (col.images ?? []).map((img: any) =>
            img.id
              ? tx.colorImage.update({
                  where: { id: img.id },
                  data: { url: img.url },
                })
              : tx.colorImage.create({
                  data: { url: img.url, colorId },
                })
          )
        );
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: true, colors: { include: { images: true } } },
      });
    });

    res.json(finalProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ✅ Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product); // full product with nested color + image IDs
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

