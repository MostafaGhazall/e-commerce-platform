import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/auth";
import { registerSchema, loginSchema } from "../../shared/userValidators";

const JWT_SECRET = process.env.JWT_SECRET!;

// helper to create & send cookie + safe user object
function issueCookie(
  res: Response,
  user: { id: string; tokenVersion: number }
) {
  const prod = process.env.NODE_ENV === "production";

  const token = jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: prod, // only secure in production
    sameSite: prod ? "none" : "lax", // ❗ use "none" for cross-site cookie in production (Vercel → Render, etc)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// ──────────────────────────────────────────────────────────
//   REGISTER  – auto-login on success
// ──────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        password: hashed,
      },
    });

    issueCookie(res, newUser);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName,
        lastName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
//   LOGIN
// ──────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        tokenVersion: true,
      },
    });

    // unify “user not found” and “bad password” → 401
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    issueCookie(res, user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────
export const logout = (_req: Request, res: Response) => {
  const prod = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? "none" : "lax",
  });

  res.json({ message: "Logged out" });
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
