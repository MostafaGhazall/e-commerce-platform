"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);
// Middleware
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true, // if you're using cookies or auth headers
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
// Root route
app.get("/", (_req, res) => {
    res.send("API is running...");
});
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/user", user_1.default);
app.use("/api/admin/auth", adminAuthRoutes_1.default);
app.use("/api/admin/products", adminProductRoutes_1.default);
app.use("/api/admin/orders", adminOrderRoutes_1.default);
app.use("/api/admin", adminDashboardRoutes_1.default);
// Global error handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});
// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
