import { PrismaUserRepository } from '@/repositories/prisma/user'
import { UpdateRagSettingsUseCase } from '@/use-cases/user/update-rag-settings'

export function makeUpdateRagSettings() {
  return new UpdateRagSettingsUseCase(new PrismaUserRepository())
}
