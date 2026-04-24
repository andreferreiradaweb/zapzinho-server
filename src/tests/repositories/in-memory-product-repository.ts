import { ProductRepository } from '@/repositories/product'
import { v4 as uuid } from 'uuid'

type ProductRecord = {
  id: string
  title: string
  description: string | null
  code: string | null
  price: string | null
  costPrice: string | null
  condition: string | null
  photos: string[]
  userId: string
  categoryId: string | null
  createdAt: Date
  Leads: unknown[]
}

export class InMemoryProductRepository implements ProductRepository {
  public items: ProductRecord[] = []

  async findProductById(productId: string): Promise<any> {
    return this.items.find((p) => p.id === productId) ?? null
  }

  async countByUserId(userId: string, search: string): Promise<number> {
    return this.items.filter(
      (p) => p.userId === userId && p.title.includes(search),
    ).length
  }

  async filterManyByUserId(
    userId: string,
    offset: number,
    limit: number,
    search: string,
  ): Promise<any[]> {
    return this.items
      .filter((p) => p.userId === userId && p.title.includes(search))
      .slice(offset, offset + limit)
  }

  async getAllProductsForOptions(userId: string): Promise<any[]> {
    return this.items
      .filter((p) => p.userId === userId)
      .map((p) => ({ id: p.id, title: p.title }))
  }

  async create(data: any): Promise<any> {
    const product: ProductRecord = {
      id: data.id ?? uuid(),
      title: data.title,
      description: data.description ?? null,
      code: data.code ?? null,
      price: data.price ?? null,
      costPrice: data.costPrice ?? null,
      condition: data.condition ?? null,
      photos: data.photos ?? [],
      userId: data.userId,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
      Leads: [],
    }
    this.items.push(product)
    return product
  }

  async update(data: any): Promise<any> {
    const idx = this.items.findIndex((p) => p.id === data.id)
    if (idx === -1) throw new Error('Product not found')
    this.items[idx] = { ...this.items[idx], ...data }
    return this.items[idx]
  }

  async delete(id: string): Promise<any> {
    const idx = this.items.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Product not found')
    const [product] = this.items.splice(idx, 1)
    return product
  }
}
