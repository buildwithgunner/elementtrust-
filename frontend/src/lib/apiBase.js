const LOCALHOST_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
])

function ensureHttps(url) {
  if (!url) return url

  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`
  }

  try {
    const parsed = new URL(url)

    if (parsed.protocol === 'http:' && !LOCALHOST_HOSTNAMES.has(parsed.hostname)) {
      parsed.protocol = 'https:'
    }

    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url.replace(/^http:\/\//, 'https://')
  }
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL

  if (configured) {
    return ensureHttps(configured)
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `${window.location.origin}`
}
