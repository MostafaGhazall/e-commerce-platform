"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = async (req, res, next) => {
    /* 1. Read the token (cookie-first) */
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token" });
        return;
    }
    /* 2. Verify & attach */
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // ─── Token-version revocation ───
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({ message: "Token expired" });
        }
        else {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    }
};
exports.authenticate = authenticate;
