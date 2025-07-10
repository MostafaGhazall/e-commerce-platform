"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i = void 0;
const i = (val, def = 0) => {
    // accept strings or numbers; everything else falls back to default
    const n = typeof val === "string"
        ? Number(val)
        : typeof val === "number"
            ? val
            : NaN;
    return Number.isFinite(n) ? Math.floor(n) : def;
};
exports.i = i;
