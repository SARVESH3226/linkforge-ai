import prisma from '../config/db';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
}

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateUserData) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateUserData>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
