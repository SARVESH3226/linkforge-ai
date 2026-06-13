import prisma from '../config/db';

export class SessionRepository {
  async createSession(userId: string, token: string, expiresAt: Date) {
    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findSession(token: string) {
    return prisma.session.findFirst({
      where: {
        token,
        deletedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async deleteSession(token: string) {
    return prisma.session.update({
      where: { token },
      data: { deletedAt: new Date() },
    });
  }

  async deleteUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
