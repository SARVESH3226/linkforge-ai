import prisma from '../config/db';

export class CategoryRepository {
  async create(userId: string, name: string, color: string) {
    return prisma.category.create({
      data: {
        userId,
        name,
        color,
      },
    });
  }

  async findAll(userId: string) {
    return prisma.category.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }

  async update(id: string, userId: string, data: { name?: string; color?: string }) {
    return prisma.category.update({
      where: { id, userId },
      data,
    });
  }

  async softDelete(id: string, userId: string) {
    // Break links relations by setting categoryId to null, then soft delete
    await prisma.link.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: null },
    });

    return prisma.category.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }
}
