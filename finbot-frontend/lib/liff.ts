import liff from '@line/liff'

let initialized = false

export async function initLiff(): Promise<string | null> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  if (!liffId) {
    console.warn('NEXT_PUBLIC_LIFF_ID not set — running without LIFF auth')
    return null
  }

  // Skip LIFF on desktop browser (not inside LINE app)
  const isInLineApp = typeof window !== 'undefined' && /Line\//i.test(navigator.userAgent)
  if (!isInLineApp) {
    console.warn('Not in LINE app — skipping LIFF auth')
    return null
  }

  if (!initialized) {
    await Promise.race([
      liff.init({ liffId }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('LIFF init timeout')), 5000)),
    ])
    initialized = true
  }

  if (!liff.isLoggedIn()) {
    liff.login()
    return null
  }

  const token = liff.getAccessToken()
  if (token && typeof window !== 'undefined') {
    ;(window as any).__liff_token__ = token
  }
  return token
}

export function getLiffProfile() {
  if (!initialized || !liff.isLoggedIn()) return null
  return liff.getProfile()
}
