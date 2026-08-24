import { Document, Prisma, prisma } from '@/lib/prisma'
import { DocumentRepository } from '../document'

export class PrismaDocumentRepository implements DocumentRepository {
  async findById(id: string) {
    return prisma.document.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findProcessedByUserId(userId: string) {
    return prisma.document.findMany({
      where: { userId, status: 'PROCESSED' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Prisma.DocumentUncheckedCreateInput) {
    return prisma.document.create({ data })
  }

  async updateStatus(id: string, status: Document['status'], errorMsg?: string) {
    return prisma.document.update({ where: { id }, data: { status, errorMsg } })
  }

  async setContent(id: string, content: string) {
    return prisma.document.update({ where: { id }, data: { content } })
  }

  async delete(id: string) {
    return prisma.document.delete({ where: { id } })
  }
}
