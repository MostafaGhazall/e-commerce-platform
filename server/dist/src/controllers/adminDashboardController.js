"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDashboardStats = async (_req, res) => {
    const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
        prisma_1.default.order.count(),
        prisma_1.default.order.aggregate({ _sum: { total: true } }),
        prisma_1.default.product.count(),
    ]);
    res.json({
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
    });
};
exports.getDashboardStats = getDashboardStats;
