import { LeadSaleRepository, LeadSaleWithItems } from '@/repositories/lead-sale'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { prisma } from '@/lib/prisma'

interface UpdateLeadSaleRequest {
  saleId: string
  userId: string
  discount: number
  items: { productId: string; quantity: number; costPrice?: number | null }[]
}

export class UpdateLeadSaleUseCase {
  constructor(private leadSaleRepository: LeadSaleRepository) {}

  async execute({ saleId, userId, discount, items }: UpdateLeadSaleRequest): Promise<LeadSaleWithItems> {
    const existing = await this.leadSaleRepository.findById(saleId)
    if (!existing) throw new ResourceNotFound()
    if (existing.userId !== userId) throw new InvalidCredentialsError()

    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    })

    const priceMap = new Map(
      products.map((p) => [
        p.id,
        parseFloat((p.price ?? '0').replace(',', '.')) || 0,
      ]),
    )

    const saleItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: priceMap.get(item.productId) ?? 0,
      costPrice: item.costPrice ?? null,
    }))

    return this.leadSaleRepository.update({ id: saleId, userId, discount, items: saleItems })
  }
}
