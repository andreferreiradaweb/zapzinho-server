import { LeadStatus } from '@/lib/prisma'
import { LeadSaleRepository } from '@/repositories/lead-sale'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'

interface DeleteLeadSaleRequest {
  saleId: string
  userId: string
}

export class DeleteLeadSaleUseCase {
  constructor(
    private leadSaleRepository: LeadSaleRepository,
    private leadRepository: LeadRepository,
  ) {}

  async execute({ saleId, userId }: DeleteLeadSaleRequest): Promise<void> {
    const sale = await this.leadSaleRepository.findById(saleId)
    if (!sale) throw new ResourceNotFound()
    if (sale.userId !== userId) throw new InvalidCredentialsError()

    await this.leadSaleRepository.delete(saleId)

    const remaining = await this.leadSaleRepository.findByLeadId(sale.leadId)
    if (remaining.length === 0) {
      await this.leadRepository.update({
        id: sale.leadId,
        Status: LeadStatus.NEGOCIACAO,
      })
    }
  }
}
