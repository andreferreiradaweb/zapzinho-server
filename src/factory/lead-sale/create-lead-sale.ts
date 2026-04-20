import { PrismaLeadSaleRepository } from '@/repositories/prisma/lead-sale'
import { PrismaLeadRepository } from '@/repositories/prisma/lead'
import { CreateLeadSaleUseCase } from '@/use-cases/lead-sale/create-lead-sale'

export function CreateLeadSaleFactory() {
  const leadSaleRepository = new PrismaLeadSaleRepository()
  const leadRepository = new PrismaLeadRepository()
  return new CreateLeadSaleUseCase(leadSaleRepository, leadRepository)
}
