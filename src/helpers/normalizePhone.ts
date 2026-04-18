/**
 * Normalizes Brazilian WhatsApp numbers to 13 digits (55 + 2-digit DDD + 9-digit local).
 * Strips non-digits and, for 12-digit numbers starting with 55, inserts the missing "9"
 * after the area code (position 4) to match the modern Brazilian mobile format.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('55')) {
    return digits.slice(0, 4) + '9' + digits.slice(4)
  }
  return digits
}
