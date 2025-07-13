import { ZodError } from "zod";

export const shapeZodError = (err: unknown): string => {
  if (typeof err === "string") return err;

  /* API controllers typically wrap Zod errors in { formErrors, fieldErrors } */
  if (
    typeof err === "object" &&
    err !== null &&
    ("formErrors" in err || "fieldErrors" in err)
  ) {
    const anyErr = err as {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };

    return [
      ...(anyErr.formErrors ?? []),
      ...Object.values(anyErr.fieldErrors ?? {}).flat(),
    ].join("\n");
  }

  /* Raw ZodError (thrown locally, e.g. before submit) */
  if (err instanceof ZodError) {
    return err.errors.map((e) => e.message).join("\n");
  }

  return "Validation failed";
};
