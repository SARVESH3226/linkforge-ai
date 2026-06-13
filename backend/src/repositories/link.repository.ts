import prisma from '../config/db';

export interface CreateLinkData {
  originalUrl: string;
  shortCode: string;
  title?: string;
  description?: string;
  expiresAt?: Date | null;
  userId: string;
  categoryId?: string | null;
}

export interface LinkFilters {
  userId: string;
  search?: string;
  categoryId?: string;
  isArchived?: boolean;
  isActive?: boolean;
  isFavorite?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: 'createdAt' | 'title' | 'originalUrl' | 'shortCode';
  sortOrder: 'asc' | 'desc';
}

export class LinkRepository {
  async create(data: CreateLinkData) {
    return prisma.link.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async findById(id: string, userId?: string) {
    return prisma.link.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(userId ? { userId } : {}),
      },
      include: {
        category: true,
        favorites: userId ? { where: { userId } } : false,
      },
    });
  }

  async findByShortCode(shortCode: string) {
    return prisma.link.findFirst({
      where: {
        shortCode,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, userId: string, data: Partial<CreateLinkData> & { isActive?: boolean; isArchived?: boolean }) {
    return prisma.link.update({
      where: { id, userId },
      data,
      include: {
        category: true,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return prisma.link.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(filters: LinkFilters, pagination: PaginationParams, sort: SortParams) {
    const { userId, search, categoryId, isArchived, isActive, isFavorite } = filters;
    const { page, limit } = pagination;
    const { sortBy, sortOrder } = sort;

    const skip = (page - 1) * limit;

    // Build the dynamic where clause
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isFavorite) {
      where.favorites = {
        some: {
          userId,
        },
      };
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: true,
          favorites: {
            where: {
              userId,
            },
          },
          _count: {
            select: {
              analytics: true,
            },
          },
        },
      }),
      prisma.link.count({ where }),
    ]);

    return { links, total };
  }
}
