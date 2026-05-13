import { BroadcastStatus, ImportedContactStatus, Prisma } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import {
  ContactListRepository,
  ProspectingBroadcastRepository,
} from '../prospecting'

export class PrismaContactListRepository implements ContactListRepository {
  async create(data: Prisma.ContactListUncheckedCreateInput) {
    return prisma.contactList.create({ data })
  }

  async findAllByUserId(userId: string, offset: number, limit: number) {
    return prisma.contactList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { _count: { select: { Contacts: true } } },
    })
  }

  async countByUserId(userId: string) {
    return prisma.contactList.count({ where: { userId } })
  }

  async findById(id: string) {
    return prisma.contactList.findUnique({
      where: { id },
      include: { Contacts: true },
    })
  }

  async addContacts(
    contactListId: string,
    contacts: Array<{ name: string; phone: string; email?: string; website?: string; address?: string; category?: string }>,
  ) {
    await prisma.importedContact.createMany({
      data: contacts.map((c) => ({
        contactListId,
        name: c.name,
        phone: c.phone,
        email: c.email ?? null,
        website: c.website ?? null,
        address: c.address ?? null,
        category: c.category ?? null,
      })),
    })
  }

  async findContactByPhone(userId: string, phone: string) {
    const digitsOnly = phone.replace(/\D/g, '')
    const withoutCountry = digitsOnly.startsWith('55') ? digitsOnly.slice(2) : digitsOnly
    return prisma.importedContact.findFirst({
      where: {
        status: 'WARMUP_SENT',
        ContactList: { userId },
        OR: [
          { phone: digitsOnly },
          { phone: withoutCountry },
          { phone: `55${withoutCountry}` },
        ],
      },
      orderBy: { warmupSentAt: 'desc' },
    })
  }

  async updateContactStatus(
    id: string,
    status: ImportedContactStatus,
    extra?: Partial<{ warmupSentAt: Date; repliedAt: Date; templateSentAt: Date; convertedLeadId: string; errorMsg: string }>,
  ) {
    await prisma.importedContact.update({
      where: { id },
      data: { status, ...extra },
    })
  }

  async getContact(id: string) {
    return prisma.importedContact.findUnique({ where: { id } })
  }

  async listContacts(contactListId: string, offset: number, limit: number) {
    return prisma.importedContact.findMany({
      where: { contactListId },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit,
    })
  }

  async countContacts(contactListId: string) {
    return prisma.importedContact.count({ where: { contactListId } })
  }

  async countContactsByCategory(contactListId: string, category: string) {
    return prisma.importedContact.count({ where: { contactListId, category } })
  }

  async countWarmupSentToday(userId: string) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    return prisma.importedContact.count({
      where: {
        ContactList: { userId },
        warmupSentAt: { gte: startOfDay },
      },
    })
  }

  async resetContactsByListId(contactListId: string) {
    await prisma.importedContact.updateMany({
      where: { contactListId },
      data: {
        status: 'PENDING',
        warmupSentAt: null,
        repliedAt: null,
        templateSentAt: null,
        errorMsg: null,
      },
    })
  }

  async getDistinctCategories(contactListId: string) {
    const rows = await prisma.importedContact.findMany({
      where: { contactListId, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })
    return rows.map((r) => r.category as string)
  }
}

export class PrismaProspectingBroadcastRepository
  implements ProspectingBroadcastRepository
{
  async create(data: Prisma.ProspectingBroadcastUncheckedCreateInput) {
    return prisma.prospectingBroadcast.create({ data })
  }

  async findById(id: string) {
    return prisma.prospectingBroadcast.findUnique({
      where: { id },
      include: { ContactList: { include: { Contacts: true } } },
    })
  }

  async getStatusById(id: string) {
    const row = await prisma.prospectingBroadcast.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        totalSent: true,
        totalFailed: true,
        startedAt: true,
        finishedAt: true,
        userId: true,
        contactListId: true,
        ContactList: { select: { _count: { select: { Contacts: true } } } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      status: row.status,
      totalSent: row.totalSent,
      totalFailed: row.totalFailed,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      userId: row.userId,
      contactListId: row.contactListId,
      totalContacts: row.ContactList._count.Contacts,
    }
  }

  async findAllByUserId(userId: string, offset: number, limit: number) {
    return prisma.prospectingBroadcast.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })
  }

  async countByUserId(userId: string) {
    return prisma.prospectingBroadcast.count({ where: { userId } })
  }

  async updateStatus(
    id: string,
    status: BroadcastStatus,
    extra?: Partial<{ startedAt: Date; finishedAt: Date }>,
  ) {
    await prisma.prospectingBroadcast.update({
      where: { id },
      data: { status, ...extra },
    })
  }

  async incrementCount(id: string, field: 'totalSent' | 'totalFailed') {
    await prisma.prospectingBroadcast.update({
      where: { id },
      data: { [field]: { increment: 1 } },
    })
  }

  async findSentByContactListId(contactListId: string) {
    return prisma.prospectingBroadcast.findFirst({
      where: { contactListId, status: { in: ['SENT', 'SENDING'] } },
    })
  }

  async incrementFailedCount(id: string, amount: number) {
    if (amount <= 0) return
    await prisma.prospectingBroadcast.update({
      where: { id },
      data: { totalFailed: { increment: amount } },
    })
  }

  async reset(id: string) {
    await prisma.prospectingBroadcast.update({
      where: { id },
      data: {
        status: 'DRAFT',
        totalSent: 0,
        totalFailed: 0,
        startedAt: null,
        finishedAt: null,
      },
    })
  }
}
