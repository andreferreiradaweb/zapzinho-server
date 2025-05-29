// transaction-provider.ts

import { Prisma } from '@prisma/client'

export interface TransactionProvider {
  runTransaction(
    operation: () => Promise<void>,
    isolationLevel?: Prisma.TransactionIsolationLevel,
  ): Promise<void>
}
