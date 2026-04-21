import {
  ContactList,
  ImportedContact,
  ImportedContactStatus,
  ProspectingBroadcast,
  BroadcastStatus,
  Prisma,
} from '@/lib/prisma'

export interface ProspectingBroadcastWithList extends ProspectingBroadcast {
  ContactList: ContactList & { Contacts: ImportedContact[] }
}

export interface ContactListRepository {
  create(data: Prisma.ContactListUncheckedCreateInput): Promise<ContactList>
  findAllByUserId(userId: string, offset: number, limit: number): Promise<ContactList[]>
  countByUserId(userId: string): Promise<number>
  findById(id: string): Promise<(ContactList & { Contacts: ImportedContact[] }) | null>
  addContacts(
    contactListId: string,
    contacts: Array<{ name: string; phone: string; email?: string }>,
  ): Promise<void>
  findContactByPhone(userId: string, phone: string): Promise<ImportedContact | null>
  updateContactStatus(
    id: string,
    status: ImportedContactStatus,
    extra?: Partial<ImportedContact>,
  ): Promise<void>
  getContact(id: string): Promise<ImportedContact | null>
  listContacts(
    contactListId: string,
    offset: number,
    limit: number,
  ): Promise<ImportedContact[]>
  countContacts(contactListId: string): Promise<number>
}

export interface ProspectingBroadcastRepository {
  create(data: Prisma.ProspectingBroadcastUncheckedCreateInput): Promise<ProspectingBroadcast>
  findById(id: string): Promise<ProspectingBroadcastWithList | null>
  findAllByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<ProspectingBroadcast[]>
  countByUserId(userId: string): Promise<number>
  updateStatus(
    id: string,
    status: BroadcastStatus,
    extra?: Partial<ProspectingBroadcast>,
  ): Promise<void>
  incrementCount(id: string, field: 'totalSent' | 'totalFailed'): Promise<void>
}
