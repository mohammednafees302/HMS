// ============================================================
// src/middleware/validate.middleware.ts
// Zod request validation factory.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendBadRequest } from '../utils/response';
import { ValidationError } from '../types';

interface ValidateSchemas {
  body?:   ZodSchema;
  query?:  ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidateSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    const parts: Array<{ key: keyof ValidateSchemas; source: unknown }> = [
      { key: 'body',   source: req.body   },
      { key: 'query',  source: req.query  },
      { key: 'params', source: req.params },
    ];

    for (const { key, source } of parts) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(source);

      if (!result.success) {
        const zodErrors = (result.error as ZodError).issues.map((e) => ({
          field: `${key}.${e.path.join('.')}`,
          message: e.message,
          code: e.code,
        }));
        errors.push(...zodErrors);
      } else {
        if (key === 'body')   req.body   = result.data;
        if (key === 'query')  req.query  = result.data as typeof req.query;
        if (key === 'params') req.params = result.data as typeof req.params;
      }
    }

    if (errors.length > 0) {
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    next();
  };
};
