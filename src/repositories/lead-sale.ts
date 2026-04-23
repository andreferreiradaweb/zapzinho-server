export type LeadSaleItemInput = {
  productId: string
  quantity: number
  price: number
}

export interface LeadSaleRepository {
  create(data: {
    id: string
    leadId: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }): Promise<LeadSaleWithItems>
  findByLeadId(leadId: string): Promise<LeadSaleWithItems[]>
  findById(id: string): Promise<LeadSaleWithItems | null>
  update(data: {
    id: string
    userId: string
    discount: number
    items: LeadSaleItemInput[]
  }): Promise<LeadSaleWithItems>
}

export type LeadSaleWithItems = {
  id: string
  leadId: string
  userId: string
  discount: number
  createdAt: Date
  Items: {
    id: string
    productId: string
    quantity: number
    price: number
    Product: { title: string; price: string | null; costPrice: string | null }
  }[]
}
