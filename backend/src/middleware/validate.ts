import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Generic Zod validation middleware.
 *
 * Usage:
 *   router.post('/foo', validate({ body: createFooSchema }), controller.create);
 *   router.get('/foo', validate({ query: listFooQuerySchema }), controller.list);
 */
export function validate(schemas: Partial<Record<ValidationTarget, ZodSchema>>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, unknown> = {};

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
      const result = schema.safeParse(req[target]);
      if (!result.success) {
        errors[target] = formatZodErrors(result.error);
      } else {
        // Replace the raw input with the parsed/coerced values
        (req as Record<string, unknown>)[target] = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        error: {
          code: 'validation_error',
          message: 'Request validation failed',
          details: errors,
        },
      });
      return;
    }

    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
}
