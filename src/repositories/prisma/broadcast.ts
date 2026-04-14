import { Broadcast, BroadcastStatus, Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { BroadcastRepository } from '../broadcast'

export class PrismaBroadcastRepository implements BroadcastRepository {
  async findById(id: string) {
    return prisma.broadcast.findUnique({
      where: { id },
      include: { BroadcastLeads: { include: { Lead: true } } },
    })
  }

  async findAllByUserId(userId: string, offset: number, limit: number) {
    return prisma.broadcast.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: Number(offset),
      take: Number(limit),
    })
  }

  async countByUserId(userId: string) {
    return prisma.broadcast.count({ where: { userId } })
  }

  async create(data: Prisma.BroadcastUncheckedCreateInput) {
    return prisma.broadcast.create({ data })
  }

  async addLeads(broadcastId: string, leadIds: string[]) {
    await prisma.broadcastLead.createMany({
      data: leadIds.map((leadId) => ({ broadcastId, leadId })),
      skipDuplicates: true,
    })
  }

  async updateStatus(id: string, status: BroadcastStatus, extra?: Partial<Broadcast>) {
    return prisma.broadcast.update({
      where: { id },
      data: { status, ...extra },
    })
  }

  async updateLeadStatus(
    broadcastLeadId: string,
    status: 'SENT' | 'FAILED',
    errorMsg?: string,
  ) {
    await prisma.broadcastLead.update({
      where: { id: broadcastLeadId },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
        errorMsg: errorMsg ?? null,
      },
    })
  }

  async incrementSentCount(id: string, field: 'totalSent' | 'totalFailed') {
    await prisma.broadcast.update({
      where: { id },
      data: { [field]: { increment: 1 } },
    })
  }

  async delete(id: string) {
    await prisma.broadcastLead.deleteMany({ where: { broadcastId: id } })
    return prisma.broadcast.delete({ where: { id } })
  }
}
