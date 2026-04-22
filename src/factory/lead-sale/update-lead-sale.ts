import { PrismaLeadSaleRepository } from '@/repositories/prisma/lead-sale'
import { UpdateLeadSaleUseCase } from '@/use-cases/lead-sale/update-lead-sale'

export function UpdateLeadSaleFactory() {
  const leadSaleRepository = new PrismaLeadSaleRepository()
  return new UpdateLeadSaleUseCase(leadSaleRepository)
}
