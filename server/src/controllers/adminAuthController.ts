import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: "7d" });

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
};

export const adminMe = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).adminId;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });

  if (!admin) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }

  res.json({ admin });
};
