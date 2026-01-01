import { z } from 'zod';

// Category validation schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(60, 'Name must be 60 characters or less')
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional()
    .default('#3b82f6'),
});

export const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid category ID'),
});

// Transaction validation schemas
export const createTransactionSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  amount: z
    .number()
    .min(0.01, 'Amount must be at least 0.01')
    .max(999999999.99, 'Amount too large'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .default(''),
  txn_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: z.enum(['income', 'expense']),
});

export const updateTransactionSchema = z.object({
  category_id: z.number().int().positive().optional().nullable(),
  amount: z
    .number()
    .min(0.01, 'Amount must be at least 0.01')
    .max(999999999.99, 'Amount too large')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  txn_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  type: z.enum(['income', 'expense']).optional(),
});

export const transactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
});

// Query parameter schemas
export const monthQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .optional(),
});

export const summaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

// Helper function to validate request data
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues.map((e) => e.message).join(', ');
  return { success: false, error: errorMessage };
}

export function validateParams<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  return validateBody(schema, data);
}

export function validateQuery<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  return validateBody(schema, data);
}
