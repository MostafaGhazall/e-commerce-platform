import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
}

interface JWTPayload {
  userId: string;
  tokenVersion?: number; // revocation
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /* 1. Read the token (cookie-first) */
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token" });
    return;
  }

  /* 2. Verify & attach */
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // ─── Token-version revocation ───
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true },
    });
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.status(401).json({ message: "Token revoked" });
      return;
    }
    // ────────────────────────────────

    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  }
};
