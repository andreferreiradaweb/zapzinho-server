import { Lead } from '@/lib/prisma'
import { UserRepository } from '@/repositories/user'
import { LeadRepository } from '@/repositories/lead'
import { ResourceNotFound } from '@/error/resource-not-found'
import { Prisma } from '@/lib/prisma'

interface HandleIncomingMessageRequest {
  instanceId: string
  phone: string        // digits only, e.g. 5511999999999
  name: string
  message: string
}

interface HandleIncomingMessageResponse {
  lead: Lead
  created: boolean     // true = novo lead, false = já existia
  skipped?: never
}

interface HandleIncomingMessageSkipped {
  skipped: true
}

/**
 * Extracts the value for a given variable code from message text.
 * Supports two formats:
 *   - "CODE: VALUE"  (line-separated, added by ShareButton)
 *   - "CODE=VALUE"   (URL query-param style, e.g. when customer pastes the URL directly)
 */
function extractMsgVar(message: string, code: string): string | null {
  if (!code || !message) return null
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const colonMatch = message.match(new RegExp(`(?:^|\\n)${escaped}:\\s*(.+)`, 'i'))
  if (colonMatch) return colonMatch[1].trim()

  const equalsMatch = message.match(new RegExp(`[?&]${escaped}=([^&\\s]+)`, 'i'))
  if (equalsMatch) return decodeURIComponent(equalsMatch[1].replace(/\+/g, ' '))

  return null
}

export class HandleIncomingMessageUseCase {
  constructor(
    private userRepository: UserRepository,
    private leadRepository: LeadRepository,
    private adminInstanceId: string,
  ) {}

  async execute({
    instanceId,
    phone,
    name,
    message,
  }: HandleIncomingMessageRequest): Promise<HandleIncomingMessageResponse | HandleIncomingMessageSkipped> {
    let user = await this.userRepository.findUserByInstanceId(instanceId)

    if (!user && instanceId === this.adminInstanceId) {
      user = await this.userRepository.findAdminUser()
    }

    if (!user) throw new ResourceNotFound()

    const hasVar1 = !!user.lpPhoneParam
    const hasVar2 = !!user.lpNameParam

    const extractedPhone = hasVar1 ? extractMsgVar(message, user.lpPhoneParam!) : null
    const extractedName = hasVar2 ? extractMsgVar(message, user.lpNameParam!) : null

    // When variables are configured, all configured ones must appear in the same message
    if (hasVar1 && hasVar2 && (!extractedPhone || !extractedName)) {
      return { skipped: true }
    }
    if (hasVar1 && !hasVar2 && !extractedPhone) {
      return { skipped: true }
    }
    if (!hasVar1 && hasVar2 && !extractedName) {
      return { skipped: true }
    }

    const resolvedPhone = extractedPhone
      ? extractedPhone.replace(/\D/g, '')
      : phone
    const resolvedName = extractedName || name || phone

    try {
      const { lead, created } = await this.leadRepository.upsertByPhone({
        userId: user.id,
        phone: resolvedPhone,
        name: resolvedName,
        message,
      })
      return { lead, created }
    } catch (err) {
      // Fallback for unique constraint race: find the already-created lead
      if (err instanceof Prisma.PrismaClientKnownRequestError && (err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
        const existing = await this.leadRepository.findLeadWhereUserByNumber(user.id, resolvedPhone)
        if (existing) {
          const updated = await this.leadRepository.update({
            id: existing.id,
            lastClientMessageAt: new Date(),
          })
          return { lead: updated, created: false }
        }
      }
      throw err
    }
  }
}
