import { prisma } from '@/lib/prisma'
import {
  EmailListRepository,
  EmailSubscriberRepository,
  EmailCampaignRepository,
} from '@/repositories/email'
import { v4 as uuid } from 'uuid'

export class PrismaEmailListRepository implements EmailListRepository {
  async create(data: { userId: string; name: string }) {
    return prisma.emailList.create({
      data: { id: uuid(), ...data },
      include: { _count: { select: { Subscribers: true } } },
    })
  }

  async findAllByUserId(userId: string) {
    return prisma.emailList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { Subscribers: true } } },
    })
  }

  async findById(id: string) {
    return prisma.emailList.findUnique({
      where: { id },
      include: { _count: { select: { Subscribers: true } } },
    })
  }

  async findByPublicToken(token: string) {
    return prisma.emailList.findUnique({ where: { publicToken: token } })
  }

  async delete(id: string) {
    await prisma.emailList.delete({ where: { id } })
  }
}

export class PrismaEmailSubscriberRepository
  implements EmailSubscriberRepository
{
  async create(data: {
    emailListId: string
    email: string
    name?: string
    source?: string
  }) {
    return prisma.emailSubscriber.create({
      data: { id: uuid(), ...data },
    })
  }

  async findAllByListId(emailListId: string, offset: number, limit: number) {
    return prisma.emailSubscriber.findMany({
      where: { emailListId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })
  }

  async countByListId(emailListId: string) {
    return prisma.emailSubscriber.count({ where: { emailListId } })
  }

  async countSubscribedByListId(emailListId: string) {
    return prisma.emailSubscriber.count({
      where: { emailListId, status: 'SUBSCRIBED' },
    })
  }

  async findById(id: string) {
    return prisma.emailSubscriber.findUnique({ where: { id } })
  }

  async findByListAndEmail(emailListId: string, email: string) {
    return prisma.emailSubscriber.findUnique({
      where: { emailListId_email: { emailListId, email } },
    })
  }

  async delete(id: string) {
    await prisma.emailSubscriber.delete({ where: { id } })
  }

  async findSubscribedByListId(emailListId: string) {
    return prisma.emailSubscriber.findMany({
      where: { emailListId, status: 'SUBSCRIBED' },
    })
  }
}

export class PrismaEmailCampaignRepository implements EmailCampaignRepository {
  async create(data: {
    userId: string
    emailListId: string
    name: string
    subject: string
    body: string
  }) {
    return prisma.emailCampaign.create({ data: { id: uuid(), ...data } })
  }

  async findAllByUserId(userId: string) {
    return prisma.emailCampaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.emailCampaign.findUnique({ where: { id } })
  }

  async updateStatus(
    id: string,
    status: string,
    extra?: Partial<{ startedAt: Date; finishedAt: Date }>,
  ) {
    await prisma.emailCampaign.update({
      where: { id },
      data: { status, ...extra },
    })
  }

  async incrementCount(id: string, field: 'totalSent' | 'totalFailed') {
    await prisma.emailCampaign.update({
      where: { id },
      data: { [field]: { increment: 1 } },
    })
  }

  async delete(id: string) {
    await prisma.emailCampaign.delete({ where: { id } })
  }
}
