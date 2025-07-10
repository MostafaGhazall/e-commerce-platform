import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * GET /api/admin/dashboard
 * Returns summary counts + revenue.
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
  const [orderCount, revenueAgg, productCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.count(),
  ]);

  /* normalise Prisma’s decimal → number */
  const totalRevenue = Number(revenueAgg._sum.total ?? 0);

  res.json({
    ok: true,                 // ← envelope flag
    data: {
      totalOrders:   orderCount,
      totalRevenue,           // already a number
      totalProducts: productCount,
    },
  });
};
