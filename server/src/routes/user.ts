import { Router } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { updateProfileSchema } from "../../../shared/userValidators";

const router = Router();

// ──────────────────────────────────────────────────────────
// GET profile
// ──────────────────────────────────────────────────────────
router.get("/profile", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthday: true,
        gender: true,
        address: true,
        city: true,
        region: true,
        postalcode: true,
        country: true,
        phone: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────
// PATCH profile (partial update)
// ──────────────────────────────────────────────────────────
router.patch("/profile", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    );

    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data,
    });

    res.json({
      message: "Profile updated",
      user: {
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        birthday: updated.birthday,
        gender: updated.gender,
        address: updated.address,
        city: updated.city,
        region: updated.region,
        postalcode: updated.postalcode,
        country: updated.country,
        phone: updated.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
