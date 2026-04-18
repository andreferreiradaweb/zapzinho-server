import { Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { AutomationRepository } from '../automation'

export class PrismaAutomationRepository implements AutomationRepository {
  async findById(id: string) {
    return prisma.automation.findUnique({ where: { id } })
  }

  async findAllByUserId(userId: string) {
    return prisma.automation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Prisma.AutomationUncheckedCreateInput) {
    return prisma.automation.create({ data })
  }

  async toggleActive(id: string, isActive: boolean) {
    return prisma.automation.update({ where: { id }, data: { isActive } })
  }

  async delete(id: string) {
    return prisma.automation.delete({ where: { id } })
  }

  async findAllActive() {
    return prisma.automation.findMany({ where: { isActive: true } })
  }
}
