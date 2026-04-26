import { LeadSaleRepository, LeadSaleWithItems, LeadSaleItemInput } from '@/repositories/lead-sale'

export class InMemoryLeadSaleRepository implements LeadSaleRepository {
  public items: LeadSaleWithItems[] = []

  async create(data: {
    id: string
    leadId: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }): Promise<LeadSaleWithItems> {
    const sale: LeadSaleWithItems = {
      id: data.id,
      leadId: data.leadId,
      userId: data.userId,
      discount: data.discount,
      createdAt: new Date(),
      Items: data.items.map((item, idx) => ({
        id: `item-${idx}`,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        costPrice: item.costPrice ?? null,
        Product: {
          title: `Produto ${item.productId}`,
          price: String(item.price),
          costPrice: null,
        },
      })),
    }
    this.items.push(sale)
    return sale
  }

  async findByLeadId(leadId: string): Promise<LeadSaleWithItems[]> {
    return this.items.filter((s) => s.leadId === leadId)
  }

  async findById(id: string): Promise<LeadSaleWithItems | null> {
    return this.items.find((s) => s.id === id) ?? null
  }

  async update(data: {
    id: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }): Promise<LeadSaleWithItems> {
    const idx = this.items.findIndex((s) => s.id === data.id)
    if (idx === -1) throw new Error('LeadSale not found')
    this.items[idx] = {
      ...this.items[idx],
      discount: data.discount,
      Items: data.items.map((item, i) => ({
        id: `item-${i}`,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        costPrice: item.costPrice ?? null,
        Product: {
          title: `Produto ${item.productId}`,
          price: String(item.price),
          costPrice: null,
        },
      })),
    }
    return this.items[idx]
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((s) => s.id !== id)
  }
}
