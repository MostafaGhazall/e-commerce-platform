import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;
if (!JWT_SECRET) throw new Error("ADMIN_JWT_SECRET is missing");

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1️⃣  Prefer the cookie
  let token = req.cookies?.admin_token as string | undefined;

  // 2️⃣  Fallback to Authorization: Bearer <token>
  if (!token) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7); // remove "Bearer "
    }
  }

  // 3️⃣  No token → 401
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token" });
    return;
  }

  // 4️⃣  Verify JWT
  try {
    const { adminId } = jwt.verify(token, JWT_SECRET) as { adminId: string };
    (req as any).adminId = adminId;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
