import { Prisma } from '@/lib/prisma'
import { TransactionProvider } from '../transaction-provider'

export class PrismaTransactionProvider implements TransactionProvider {
  async runTransaction(
    operation: () => Promise<void>,
    _isolationLevel?: Prisma.TransactionIsolationLevel,
  ): Promise<void> {
    await operation()
  }
}
