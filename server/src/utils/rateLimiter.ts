import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15-minute window
  max: 20,                       // limit each IP to 20 hits
  standardHeaders: true,         // return ↳ RateLimit-* headers
  legacyHeaders: false,
});
