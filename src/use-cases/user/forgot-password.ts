import { UserRepository } from '@/repositories/user'
import { UserNotFound } from '@/error/user-not-found'
import { resend } from '@/lib/resend'
import NodeCache from 'node-cache'

export const resetCodeCache = new NodeCache({ stdTTL: 600 }) // 10 min

interface ForgotPasswordRequest {
  email: string
}

export class ForgotPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email }: ForgotPasswordRequest): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email)

    if (!user) {
      throw new UserNotFound()
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    resetCodeCache.set(email, code)

    await resend.emails.send({
      from: 'Zapzinho <noreply@webnarte.com>',
      to: email,
      subject: 'Código de recuperação de senha',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Recuperação de senha</h2>
          <p>Use o código abaixo para redefinir sua senha. Ele expira em <strong>10 minutos</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6c47ff; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 13px;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `,
    })
  }
}
