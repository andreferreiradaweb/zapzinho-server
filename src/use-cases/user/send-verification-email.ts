import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '@/error/user-not-found'
import { resend } from '@/lib/resend'
import NodeCache from 'node-cache'

export const emailVerifyCache = new NodeCache({ stdTTL: 600 }) // 10 min

interface SendVerificationEmailRequest {
  email: string
}

export class SendVerificationEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email }: SendVerificationEmailRequest): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email)

    if (!user) {
      throw new UserNotFound()
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    emailVerifyCache.set(email, code)

    await resend.emails.send({
      from: 'Zapzinho <noreply@webnarte.com>',
      to: email,
      subject: 'Confirme seu e-mail',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Confirme seu e-mail</h2>
          <p>Use o código abaixo para verificar seu endereço de e-mail. Ele expira em <strong>10 minutos</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6c47ff; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 13px;">Se você não criou uma conta, ignore este e-mail.</p>
        </div>
      `,
    })
  }
}
