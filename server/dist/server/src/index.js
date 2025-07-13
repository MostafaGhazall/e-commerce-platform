"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_http_1 = __importDefault(require("pino-http"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const orders_1 = __importDefault(require("./routes/orders"));
const user_1 = __importDefault(require("./routes/user"));
const adminAuthRoutes_1 = __importDefault(require("./routes/adminAuthRoutes"));
const adminProductRoutes_1 = __importDefault(require("./routes/adminProductRoutes"));
const adminOrderRoutes_1 = __importDefault(require("./routes/adminOrderRoutes"));
const adminDashboardRoutes_1 = __importDefault(require("./routes/adminDashboardRoutes"));
const adminCategoryRoutes_1 = __importDefault(require("./routes/adminCategoryRoutes"));
/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const ORIGINS = [
    process.env.CLIENT_URL || "http://localhost:5173",
    process.env.ADMIN_URL || "http://localhost:5174", // local fallback if needed
];
/* -------------------------------------------------------------------------- */
/* App init                                                                   */
/* -------------------------------------------------------------------------- */
const app = (0, express_1.default)();
app.set("trust proxy", 1); // correct client IPs behind nginx/ELB
app.disable("x-powered-by");
app.disable("etag"); // we’ll handle caching manually for JSON
/* -------------------------------------------------------------------------- */
/* Global middleware                                                          */
/* -------------------------------------------------------------------------- */
app.use((0, cors_1.default)({
    origin: ORIGINS,
    credentials: true,
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: { maxAge: 60 * 24 * 60 * 60 }, // 60 days
}));
app.use((0, compression_1.default)()); // gzip/deflate
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, pino_http_1.default)()); // structured request logs
// Tiny rate-limit: 100 req / 15 min per IP for auth & search
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use("/api/auth", authLimiter);
app.use("/api/admin/auth", authLimiter);
/* Prevent browsers caching any JSON */
app.use((_, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});
/* ------------------------------------------------------------------ */
/* Health-check                                                       */
/* ------------------------------------------------------------------ */
app.get("/health", (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */
app.get("/", (_req, res) => {
    res.send("API is running…");
});
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/user", user_1.default);
app.use("/api/categories", adminCategoryRoutes_1.default);
app.use("/api/admin/auth", adminAuthRoutes_1.default);
app.use("/api/admin/products", adminProductRoutes_1.default);
app.use("/api/admin/orders", adminOrderRoutes_1.default);
app.use("/api/admin", adminDashboardRoutes_1.default);
/* -------------------------------------------------------------------------- */
/* Unified async error handler                                                */
/* -------------------------------------------------------------------------- */
app.use((err, _req, res, _next) => {
    _req.log.error({ err }, "Unhandled error");
    res.status(500).json({ ok: false, error: "Internal Server Error" });
});
/* -------------------------------------------------------------------------- */
/* Start                                                                      */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✅  Server running on http://localhost:${PORT}`);
});
