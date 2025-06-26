import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.admin_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    (req as any).adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
