import { Automation, Prisma } from '@/lib/prisma'

export interface AutomationRepository {
  findById(id: string): Promise<Automation | null>
  findAllByUserId(userId: string): Promise<Automation[]>
  create(data: Prisma.AutomationUncheckedCreateInput): Promise<Automation>
  toggleActive(id: string, isActive: boolean): Promise<Automation>
  delete(id: string): Promise<Automation>
  findAllActive(): Promise<Automation[]>
}
