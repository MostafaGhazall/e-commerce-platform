import { Request, Response } from "express";
import prisma from "../prisma";

export const getDashboardStats = async (_req: Request, res: Response) => {
  const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.count(),
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
  });
};
