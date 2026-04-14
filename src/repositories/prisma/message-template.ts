import { Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { MessageTemplateRepository } from '../message-template'

export class PrismaMessageTemplateRepository implements MessageTemplateRepository {
  async findById(id: string) {
    return prisma.messageTemplate.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string) {
    return prisma.messageTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Prisma.MessageTemplateUncheckedCreateInput) {
    return prisma.messageTemplate.create({ data })
  }

  async update(data: Prisma.MessageTemplateUncheckedUpdateInput & { id: string }) {
    return prisma.messageTemplate.update({ where: { id: data.id }, data })
  }

  async delete(id: string) {
    return prisma.messageTemplate.delete({ where: { id } })
  }
}
