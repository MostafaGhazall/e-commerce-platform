import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/wishlist";
import orderRoutes from "./routes/orders";
import userRoutes from "./routes/user";

import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminProductRoutes from "./routes/adminProductRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";

import cookieParser from "cookie-parser";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if you're using cookies or auth headers
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Root route
app.get("/", (_req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
