import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pino from "pino-http";

import authRoutes           from "./routes/auth";
import productRoutes        from "./routes/products";
import cartRoutes           from "./routes/cart";
import wishlistRoutes       from "./routes/wishlist";
import orderRoutes          from "./routes/orders";
import userRoutes           from "./routes/user";
import adminAuthRoutes      from "./routes/adminAuthRoutes";
import adminProductRoutes   from "./routes/adminProductRoutes";
import adminOrderRoutes     from "./routes/adminOrderRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";
import adminCategoryRoutes from "./routes/adminCategoryRoutes";

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT ? Number(process.env.PORT) : (() => { throw new Error("PORT is required") })();
const ORIGINS = [
  "http://localhost:5173",
  "https://e-commerce-platform-ri8x.vercel.app", // admin
  "https://e-commerce-platform-5qfo.vercel.app", // client
];


/* -------------------------------------------------------------------------- */
/* App init                                                                   */
/* -------------------------------------------------------------------------- */
const app = express();
app.set("trust proxy", 1);          // correct client IPs behind nginx/ELB
app.disable("x-powered-by");
app.disable("etag");                // we’ll handle caching manually for JSON

/* -------------------------------------------------------------------------- */
/* Global middleware                                                          */
/* -------------------------------------------------------------------------- */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 60 * 24 * 60 * 60 },      // 60 days
}));

app.use(compression());              // gzip/deflate
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(pino());                     // structured request logs

// Tiny rate-limit: 100 req / 15 min per IP for auth & search
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/auth",    authLimiter);
app.use("/api/admin/auth", authLimiter);

/* Prevent browsers caching any JSON */
app.use((_, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* ------------------------------------------------------------------ */
/* Health-check                                                       */
/* ------------------------------------------------------------------ */
app.get("/health", (_req, res): void => {
  res.json({ ok: true, uptime: process.uptime() });
});

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */
app.get("/", (_req, res): void => {
  res.send("API is running…");
});

app.use("/api/auth",          authRoutes);
app.use("/api/products",      productRoutes);
app.use("/api/cart",          cartRoutes);
app.use("/api/wishlist",      wishlistRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/user",          userRoutes);

app.use("/api/categories",     adminCategoryRoutes);
app.use("/api/admin/auth",     adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders",   adminOrderRoutes);
app.use("/api/admin",          adminDashboardRoutes);

/* -------------------------------------------------------------------------- */
/* Unified async error handler                                                */
/* -------------------------------------------------------------------------- */
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    _req.log.error({ err }, "Unhandled error");
    res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
);

/* -------------------------------------------------------------------------- */
/* Start                                                                      */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
