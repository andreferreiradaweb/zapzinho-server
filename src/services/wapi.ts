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

interface SendImageParams {
  phone: string
  imageUrl: string
  caption?: string
}

/**
 * Sends a WhatsApp image message with caption via W-API.
 */
export async function sendWhatsAppImage({
  phone,
  imageUrl,
  caption,
}: SendImageParams): Promise<SendMessageResult> {
  const normalizedPhone = phone.replace(/\D/g, '')

  try {
    const url = `${env.WAPI_BASE_URL}/message/send-image?instanceId=${env.WAPI_INSTANCE_ID}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        image: imageUrl,
        ...(caption ? { caption } : {}),
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
    console.error('[W-API] Error sending image:', msg)
    return { success: false, error: msg }
  }
}

interface SendVideoParams {
  phone: string
  videoUrl: string
  caption?: string
}

/**
 * Sends a WhatsApp video message with optional caption via W-API.
 */
export async function sendWhatsAppVideo({
  phone,
  videoUrl,
  caption,
}: SendVideoParams): Promise<SendMessageResult> {
  const normalizedPhone = phone.replace(/\D/g, '')

  try {
    const url = `${env.WAPI_BASE_URL}/message/send-video?instanceId=${env.WAPI_INSTANCE_ID}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        video: videoUrl,
        ...(caption ? { caption } : {}),
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
    console.error('[W-API] Error sending video:', msg)
    return { success: false, error: msg }
  }
}

/**
 * Sends a WhatsApp text message using custom instance credentials (for prospecting).
 */
export async function sendWhatsAppMessageWithCredentials(
  instanceId: string,
  token: string,
  phone: string,
  message: string,
): Promise<SendMessageResult> {
  const normalizedPhone = phone.replace(/\D/g, '')
  try {
    const url = `${env.WAPI_BASE_URL}/message/send-text?instanceId=${instanceId}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: normalizedPhone, message, delayMessage: 0 }),
    })
    if (!response.ok) {
      const body = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${body}` }
    }
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

/**
 * Delay helper used between broadcast sends to avoid WhatsApp rate limiting.
 */
export function wapiDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1500))
}

export function wapiProspectingDelay(): Promise<void> {
  const ms =
    Math.floor(Math.random() * (env.WAPI_DELAY_MAX_MS - env.WAPI_DELAY_MIN_MS + 1)) +
    env.WAPI_DELAY_MIN_MS
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface GetQrCodeResult {
  success: boolean
  qrCode?: string // base64 image data URL
  alreadyConnected?: boolean
  error?: string
}

/**
 * Fetches the QR code for a given W-API instance.
 * Returns a base64 image string ready for display.
 */
export async function getInstanceQrCode(instanceId: string): Promise<GetQrCodeResult> {
  try {
    const url = `${env.WAPI_BASE_URL}/instance/qr-code?instanceId=${instanceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
    })

    const data = await response.json()

    // W-API returns { instanceId, connected: true } when already connected (no QR needed)
    if (data.connected === true) {
      return { success: true, qrCode: '', alreadyConnected: true }
    }

    if (!response.ok || data.error) {
      return { success: false, error: data.message ?? `HTTP ${response.status}` }
    }

    // W-API returns { qrcode: "data:image/png;base64,..." } when disconnected
    const qrCode: string = data.qrcode ?? data.value ?? data.qr ?? ''
    return { success: true, qrCode }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

interface DisconnectResult {
  success: boolean
  error?: string
}

/**
 * Disconnects a W-API instance (logout from WhatsApp).
 */
export async function disconnectInstance(instanceId: string): Promise<DisconnectResult> {
  try {
    const url = `${env.WAPI_BASE_URL}/instance/disconnect?instanceId=${instanceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
    })

    const data = await response.json()
    if (data.error) {
      return { success: false, error: data.message }
    }
    return { success: true }
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
    // W-API uses the same qr-code endpoint to check connection status
    const url = `${env.WAPI_BASE_URL}/instance/qr-code?instanceId=${instanceId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.WAPI_TOKEN}`,
      },
    })

    const data = await response.json()
    const connected: boolean = data.connected === true
    return { success: true, connected, status: connected ? 'connected' : 'disconnected' }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
