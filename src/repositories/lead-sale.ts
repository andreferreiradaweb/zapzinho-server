import { LeadSale } from '@/lib/prisma'

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
    items: LeadSaleItemInput[]
  }): Promise<LeadSale>
  findByLeadId(leadId: string): Promise<LeadSaleWithItems[]>
}

export type LeadSaleWithItems = {
  id: string
  leadId: string
  userId: string
  createdAt: Date
  Items: {
    id: string
    productId: string
    quantity: number
    price: number
    Product: { title: string; price: string | null }
  }[]
}
