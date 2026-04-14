import { env } from '@/config/validatedEnv'

interface SendMessageParams {
  phone: string
  message: string
}

interface SendMessageResult {
  success: boolean
  error?: string
}

/**
 * Sends a WhatsApp text message via W-API.
 * Normalizes phone to digits-only (removes + and spaces).
 */
export async function sendWhatsAppMessage({
  phone,
  message,
}: SendMessageParams): Promise<SendMessageResult> {
  const normalizedPhone = phone.replace(/\D/g, '')

  try {
    const url = `${env.WAPI_BASE_URL}/message/send-text?instanceId=${env.WAPI_INSTANCE_ID}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.WAPI_TOKEN,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message,
        delayMessage: 0,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${body}` }
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[W-API] Error sending message:', msg)
    return { success: false, error: msg }
  }
}

/**
 * Delay helper used between broadcast sends to avoid WhatsApp rate limiting.
 */
export function wapiDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, env.WAPI_DELAY_MS))
}
