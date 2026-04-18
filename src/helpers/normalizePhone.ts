/**
 * Normalizes Brazilian WhatsApp numbers to 13 digits (55 + 2-digit DDD + 9-digit local).
 * Handles inputs with or without the country code (55) and with or without the 9th digit.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  // 10 digits: DDD (2) + local (8) — add 55 and the missing 9
  if (digits.length === 10) {
    return '55' + digits.slice(0, 2) + '9' + digits.slice(2)
  }
  // 11 digits: DDD (2) + local (9) — add 55
  if (digits.length === 11) {
    return '55' + digits
  }
  // 12 digits with 55: missing the 9 — insert 9 after area code
  if (digits.length === 12 && digits.startsWith('55')) {
    return digits.slice(0, 4) + '9' + digits.slice(4)
  }
  return digits
}
