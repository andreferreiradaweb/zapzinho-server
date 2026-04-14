import { MessageTemplate, Prisma } from '@/lib/prisma'

export interface MessageTemplateRepository {
  findById(id: string): Promise<MessageTemplate | null>
  findAllByUserId(userId: string): Promise<MessageTemplate[]>
  create(data: Prisma.MessageTemplateUncheckedCreateInput): Promise<MessageTemplate>
  update(data: Prisma.MessageTemplateUncheckedUpdateInput & { id: string }): Promise<MessageTemplate>
  delete(id: string): Promise<MessageTemplate>
}
