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
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    // Use the configured API URL as is, trimming trailing slash.
    return configured.replace(/\/$/, "");
  }
  // Development: use localhost backend
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:8000";
  }
  // Production: same origin as frontend
  return `${window.location.origin}`;
}
