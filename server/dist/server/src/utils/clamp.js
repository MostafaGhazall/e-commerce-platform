"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = void 0;
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
exports.clamp = clamp;
