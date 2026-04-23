import { PrismaLeadSaleRepository } from '@/repositories/prisma/lead-sale'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { DeleteLeadSaleUseCase } from '@/use-cases/lead-sale/delete-lead-sale'

export function DeleteLeadSaleFactory() {
  const leadSaleRepository = new PrismaLeadSaleRepository()
  const leadRepository = new PrismaLeadRepository()
  return new DeleteLeadSaleUseCase(leadSaleRepository, leadRepository)
}
