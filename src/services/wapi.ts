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
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
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

interface GetQrCodeResult {
  success: boolean
  qrCode?: string // base64 image data URL
  error?: string
}

/**
 * Fetches the QR code for a given W-API instance.
 * Returns a base64 image string ready for display.
 */
export async function getInstanceQrCode(instanceId: string): Promise<GetQrCodeResult> {
  try {
    const url = `${env.WAPI_BASE_URL}/instance/qrcode?instanceId=${instanceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${body}` }
    }

    const data = await response.json()
    // W-API returns { value: "data:image/png;base64,..." }
    const qrCode: string = data.value ?? data.qrcode ?? data.qr ?? ''
    return { success: true, qrCode }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

interface InstanceStatusResult {
  success: boolean
  connected?: boolean
  status?: string
  error?: string
}

/**
 * Checks the connection status of a W-API instance.
 */
export async function getInstanceStatus(instanceId: string): Promise<InstanceStatusResult> {
  try {
    const url = `${env.WAPI_BASE_URL}/instance/status?instanceId=${instanceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${body}` }
    }

    const data = await response.json()
    const connected: boolean = data.connected ?? data.status === 'connected'
    return { success: true, connected, status: data.status }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
