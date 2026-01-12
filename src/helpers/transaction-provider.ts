// transaction-provider.ts

import { Prisma } from '../../generated/prisma/client'

export interface TransactionProvider {
  runTransaction(
    operation: () => Promise<void>,
    isolationLevel?: Prisma.TransactionIsolationLevel,
  ): Promise<void>
}
