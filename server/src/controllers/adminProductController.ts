import { Request, Response } from "express";
import prisma from "../prisma";

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
        category,
        sizes,
        images: { create: images.map((url: string) => ({ url })) },
        colors: {
          create: colors.map((color: any) => ({
            name: color.name,
            value: color.value,
            images: color.images,
          })),
        },
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
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
