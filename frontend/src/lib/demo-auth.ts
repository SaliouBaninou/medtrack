export type DemoOtpPurpose = "verification" | "password-reset"

const OTP_STORAGE_KEY = "medtrack-demo-otp"
const DEMO_OTP = "246810"

type StoredOtp = {
  email: string
  code: string
  purpose: DemoOtpPurpose
  expiresAt: number
  verified: boolean
}

function readOtp(): StoredOtp | null {
  try {
    const value = localStorage.getItem(OTP_STORAGE_KEY)
    return value ? (JSON.parse(value) as StoredOtp) : null
  } catch {
    return null
  }
}

export function startDemoOtp(email: string, purpose: DemoOtpPurpose) {
  const value: StoredOtp = {
    email: email.trim().toLowerCase(),
    code: DEMO_OTP,
    purpose,
    expiresAt: Date.now() + 10 * 60 * 1000,
    verified: false,
  }
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(value))
  return DEMO_OTP
}

export function verifyDemoOtp(email: string, code: string, purpose: DemoOtpPurpose) {
  const current = readOtp()
  if (!current || current.email !== email.trim().toLowerCase() || current.purpose !== purpose) {
    return { ok: false as const, reason: "Aucun code actif pour cette adresse. Demandez un nouveau code." }
  }
  if (Date.now() > current.expiresAt) {
    localStorage.removeItem(OTP_STORAGE_KEY)
    return { ok: false as const, reason: "Ce code a expiré. Demandez-en un nouveau." }
  }
  if (current.code !== code.trim()) {
    return { ok: false as const, reason: "Le code saisi est incorrect." }
  }
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({ ...current, verified: true }))
  return { ok: true as const }
}

export function hasVerifiedDemoOtp(email: string, purpose: DemoOtpPurpose) {
  const current = readOtp()
  return Boolean(
    current?.verified &&
    current.email === email.trim().toLowerCase() &&
    current.purpose === purpose &&
    Date.now() <= current.expiresAt,
  )
}

export function finishDemoOtp() {
  localStorage.removeItem(OTP_STORAGE_KEY)
}

export function markDemoPasswordUpdated(email: string) {
  localStorage.setItem(
    "medtrack-demo-password-updated",
    JSON.stringify({ email: email.trim().toLowerCase(), updatedAt: Date.now() }),
  )
}
