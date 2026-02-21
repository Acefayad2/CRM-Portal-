/**
 * SMS validation utilities - used by /api/sms/send
 */

const PHONE_REGEX = /^\+\d{10,15}$/
const MAX_MESSAGE_LENGTH = 1200

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" }
  }
  const trimmed = phone.trim()
  if (!PHONE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Phone must start with + and have 10-15 digits (e.g. +18777804236)",
    }
  }
  return { valid: true }
}

export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message is required" }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer (currently ${message.length})`,
    }
  }
  return { valid: true }
}
