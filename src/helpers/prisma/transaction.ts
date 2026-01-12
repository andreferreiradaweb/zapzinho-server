import { PrismaClient, Prisma } from '@/lib/prisma'
import { TransactionProvider } from '../transaction-provider'

export class PrismaTransactionProvider implements TransactionProvider {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async runTransaction(
    operation: () => Promise<void>,
    isolationLevel?: Prisma.TransactionIsolationLevel,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(operation, { isolationLevel })
    } finally {
      await this.prisma.$disconnect()
    }
  }
}
