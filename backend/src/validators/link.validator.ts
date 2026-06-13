import { z } from 'zod';

export const createLinkSchema = z.object({
  body: z.object({
    originalUrl: z.string().min(1, 'Original URL is required'),
    customAlias: z
      .string()
      .regex(/^[a-zA-Z0-9\-_]{3,30}$/, 'Alias must be 3-30 characters of letters, numbers, dashes, or underscores')
      .optional()
      .or(z.literal('')),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
    expiresAt: z.string().datetime({ message: 'Invalid ISO date format' }).nullable().optional(),
  }),
});

export const updateLinkSchema = z.object({
  body: z.object({
    originalUrl: z.string().min(1, 'Original URL cannot be empty').optional(),
    title: z.string().max(100, 'Title cannot exceed 100 characters').nullable().optional(),
    description: z.string().max(500, 'Description cannot exceed 500 characters').nullable().optional(),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
    expiresAt: z.string().datetime({ message: 'Invalid ISO date format' }).nullable().optional(),
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const queryLinkSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    search: z.string().optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    isArchived: z.string().transform(val => val === 'true').optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    isFavorite: z.string().transform(val => val === 'true').optional(),
    sortBy: z.enum(['createdAt', 'title', 'originalUrl', 'shortCode']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});
