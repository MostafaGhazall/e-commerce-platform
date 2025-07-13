"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * GET /api/admin/dashboard
 * Returns summary counts + revenue.
 */
const getDashboardStats = async (_req, res) => {
    const [orderCount, revenueAgg, productCount] = await Promise.all([
        prisma_1.default.order.count(),
        prisma_1.default.order.aggregate({ _sum: { total: true } }),
        prisma_1.default.product.count(),
    ]);
    /* normalise Prisma’s decimal → number */
    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    res.json({
        ok: true, // ← envelope flag
        data: {
            totalOrders: orderCount,
            totalRevenue, // already a number
            totalProducts: productCount,
        },
    });
};
exports.getDashboardStats = getDashboardStats;
