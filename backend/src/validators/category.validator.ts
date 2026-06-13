import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(30, 'Name must be under 30 characters'),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid 6-character hex code (e.g. #3b82f6)'),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name cannot be empty').max(30, 'Name must be under 30 characters').optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid 6-character hex code').optional(),
  }),
});
