export const shapeZodError = (errObj: unknown): string => {
  if (typeof errObj === "string") return errObj;

  const safe: any = errObj ?? {};
  const lines: string[] = [
    ...(safe.formErrors ?? []),
    ...Object.values(safe.fieldErrors ?? {}).flat(),
  ];
  return lines.join("\n") || "Validation failed";
};