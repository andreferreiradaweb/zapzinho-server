import { Contact, Prisma } from '@/lib/prisma'

export interface ContactRepository {
  findById(id: string): Promise<Contact | null>
  findByPhone(userId: string, phone: string): Promise<Contact | null>
  countByUserId(userId: string, search: string, tag?: string): Promise<number>
  filterByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    tag?: string,
  ): Promise<Contact[]>
  findAllByUserIdAndTags(userId: string, tags: string[]): Promise<Contact[]>
  findAllActiveByUserId(userId: string): Promise<Contact[]>
  create(data: Prisma.ContactUncheckedCreateInput): Promise<Contact>
  createMany(data: Prisma.ContactUncheckedCreateInput[]): Promise<number>
  update(data: Prisma.ContactUncheckedUpdateInput & { id: string }): Promise<Contact>
  delete(id: string): Promise<Contact>
}
