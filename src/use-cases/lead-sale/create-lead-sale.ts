import { LeadStatus } from '@/lib/prisma'
import { LeadSaleRepository, LeadSaleWithItems } from '@/repositories/lead-sale'
import { LeadRepository, LeadItemInput } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { InvalidCredentialsError } from '@/error/invalid-credentials-error'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

interface CreateLeadSaleRequest {
  leadId: string
  userId: string
  discount: number
  items: { productId: string; quantity: number; costPrice?: number | null }[]
}

export class CreateLeadSaleUseCase {
  constructor(
    private leadSaleRepository: LeadSaleRepository,
    private leadRepository: LeadRepository,
  ) {}

  async execute({ leadId, userId, discount, items }: CreateLeadSaleRequest): Promise<LeadSaleWithItems> {
    const lead = await this.leadRepository.findLeadById(leadId)
    if (!lead) throw new ResourceNotFound()
    if (lead.userId !== userId) throw new InvalidCredentialsError()

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

    const sale = await this.leadSaleRepository.create({
      id: randomUUID(),
      leadId,
      userId,
      discount,
      items: saleItems,
    })

    const newItems: LeadItemInput[] = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }))

    await Promise.all([
      this.leadRepository.update({
        id: leadId,
        Status: LeadStatus.VENDIDO,
        productId: items[0].productId,
      }),
      this.leadRepository.setItems(leadId, newItems),
    ])

    return sale
  }
}
