import { LeadRepository, LeadItemInput } from '@/repositories/lead'
import { v4 as uuid } from 'uuid'

type LeadRecord = {
  id: string
  nome: string
  email: string | null
  telefone: string
  message: string
  Status: string
  userId: string
  productId: string | null
  categoryId: string | null
  sellerNote: string | null
  lastBroadcastAt: Date | null
  lastMessageAt: Date | null
  deliveryDate: Date | null
  delivered: boolean
  createdAt: Date
  origin: string | null
}

export class InMemoryLeadRepository implements LeadRepository {
  public items: LeadRecord[] = []

  async findLeadById(leadId: string): Promise<any> {
    return this.items.find((l) => l.id === leadId) ?? null
  }

  async findLeadWhereUserByNumber(userId: string, number: string): Promise<any> {
    return (
      this.items.find((l) => l.userId === userId && l.telefone.replace(/\D/g, '') === number) ??
      null
    )
  }

  async countByUserId(
    userId: string,
    search: string,
    _status?: string,
    _startDate?: string,
    _endDate?: string,
    _phone?: string,
    _productId?: string,
    _categoryId?: string,
    origin?: string,
  ): Promise<number> {
    return this.items.filter((l) =>
      l.userId === userId &&
      l.nome.includes(search) &&
      (!origin || (l.origin ?? '').toLowerCase().includes(origin.toLowerCase())),
    ).length
  }

  async filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
    _status?: string,
    _startDate?: string,
    _endDate?: string,
    _phone?: string,
    _productId?: string,
    _categoryId?: string,
    origin?: string,
  ): Promise<any[]> {
    return this.items
      .filter((l) =>
        l.userId === userId &&
        l.nome.includes(search) &&
        (!origin || (l.origin ?? '').toLowerCase().includes(origin.toLowerCase())),
      )
      .slice(offset, offset + limit)
  }

  async upsertByPhone(params: { userId: string; phone: string; name: string; message: string; origin?: string }): Promise<any> {
    const existing = this.items.find((l) => l.userId === params.userId && l.telefone === params.phone)
    if (existing) {
      existing.message = params.message
      return { lead: existing, created: false }
    }
    const lead = await this.create({
      userId: params.userId,
      telefone: params.phone,
      nome: params.name,
      message: params.message,
      Status: 'NOVO_INTERESSE',
      origin: params.origin,
    })
    return { lead, created: true }
  }

  async delete(id: string): Promise<any> {
    const idx = this.items.findIndex((l) => l.id === id)
    if (idx === -1) throw new Error('Lead not found')
    const [lead] = this.items.splice(idx, 1)
    return lead
  }

  async create(data: any): Promise<any> {
    const lead: LeadRecord = {
      id: data.id ?? uuid(),
      nome: data.nome,
      email: data.email ?? null,
      telefone: data.telefone,
      message: data.message,
      Status: data.Status,
      userId: data.userId,
      productId: data.productId ?? null,
      categoryId: data.categoryId ?? null,
      sellerNote: null,
      lastBroadcastAt: null,
      lastMessageAt: null,
      deliveryDate: null,
      delivered: false,
      createdAt: data.createdAt ?? new Date(),
      origin: data.origin ?? null,
    }
    this.items.push(lead)
    return lead
  }

  async update(data: any): Promise<any> {
    const idx = this.items.findIndex((l) => l.id === data.id)
    if (idx === -1) throw new Error('Lead not found')
    this.items[idx] = { ...this.items[idx], ...data }
    return this.items[idx]
  }

  async setItems(_leadId: string, _items: LeadItemInput[]): Promise<void> {
    // no-op for tests — items relationship not needed
  }

  async findAllForBroadcast(userId: string): Promise<any[]> {
    return this.items.filter((l) => l.userId === userId)
  }

  async findLeadsByIds(ids: string[]): Promise<any[]> {
    return this.items.filter((l) => ids.includes(l.id))
  }
}
