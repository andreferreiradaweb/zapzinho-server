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
    contacts: Array<{ name: string; phone: string; email?: string }>,
  ) {
    await prisma.importedContact.createMany({
      data: contacts.map((c) => ({
        contactListId,
        name: c.name,
        phone: c.phone,
        email: c.email ?? null,
      })),
    })
  }

  async findContactByPhone(userId: string, phone: string) {
    return prisma.importedContact.findFirst({
      where: {
        phone,
        status: 'WARMUP_SENT',
        ContactList: { userId },
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
}
