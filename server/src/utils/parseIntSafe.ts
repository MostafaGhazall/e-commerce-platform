export const i = (val: unknown, def = 0): number => {
  // accept strings or numbers; everything else falls back to default
  const n =
    typeof val === "string"
      ? Number(val)
      : typeof val === "number"
      ? val
      : NaN;

  return Number.isFinite(n) ? Math.floor(n) : def;
};
