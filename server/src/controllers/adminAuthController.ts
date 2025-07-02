import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not defined in .env");
}

/* ----------  POST /api/admin/auth/login  ---------- */
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });

  // ⛔ bad credentials
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  // 🔑 sign JWT
  const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax", // always Lax on localhost
    secure: false, // HTTPS only in prod
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  // response body
  res.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
};

/* ----------  GET /api/admin/auth/me  ---------- */
export const adminMe = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });

  if (!admin) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }

  res.json({ admin });
};
