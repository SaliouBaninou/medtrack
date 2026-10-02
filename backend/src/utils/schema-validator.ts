import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: {
      field: string;
      message: string;
    }[] = [];

    // Body
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `body.${issue.path.join(".")}`,
            message: issue.message,
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    // Params
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `params.${issue.path.join(".")}`,
            message: issue.message,
          }))
        );
      } else {
        req.params = result.data as typeof req.params;
      }
    }

    // Query
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `query.${issue.path.join(".")}`,
            message: issue.message,
          }))
        );
      } else {
        res.locals.validatedQuery = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors,
      });
    }

    next();
  };
};
