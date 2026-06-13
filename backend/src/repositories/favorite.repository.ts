import prisma from '../config/db';

export class FavoriteRepository {
  async add(userId: string, linkId: string) {
    return prisma.favorite.upsert({
      where: {
        userId_linkId: { userId, linkId },
      },
      create: {
        userId,
        linkId,
      },
      update: {
        deletedAt: null, // restore if soft deleted
      },
    });
  }

  async remove(userId: string, linkId: string) {
    return prisma.favorite.delete({
      where: {
        userId_linkId: { userId, linkId },
      },
    });
  }

  async isFavorite(userId: string, linkId: string) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_linkId: { userId, linkId },
      },
    });
    return !!fav;
  }
}
