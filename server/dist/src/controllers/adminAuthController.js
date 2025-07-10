"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMe = exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("ADMIN_JWT_SECRET is not defined in .env");
}
/* ----------  POST /api/admin/auth/login  ---------- */
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await prisma_1.default.admin.findUnique({ where: { email } });
    // ⛔ bad credentials
    if (!admin || !(await bcrypt_1.default.compare(password, admin.password))) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    // 🔑 sign JWT
    const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, JWT_SECRET, {
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
exports.adminLogin = adminLogin;
/* ----------  GET /api/admin/auth/me  ---------- */
const adminMe = async (req, res) => {
    const adminId = req.adminId;
    const admin = await prisma_1.default.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
    }
    res.json({ admin });
};
exports.adminMe = adminMe;
