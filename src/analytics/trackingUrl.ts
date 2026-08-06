const INTERNAL_DEBUG_PARAMS = new Set([
  'gtm_debug',
  'gtm_auth',
  'gtm_preview',
  'gtm_cookies_win',
  '_dbg',
])

export interface CleanTrackingLocation {
  pageLocation: string
  pagePath: string
}

/** Elimina parámetros internos de preview sin tocar UTM, click IDs ni parámetros de negocio. */
export function cleanTrackingLocation(rawUrl: string, baseUrl?: string): CleanTrackingLocation {
  const fallbackBase = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  const url = new URL(rawUrl, fallbackBase)

  for (const parameter of INTERNAL_DEBUG_PARAMS) {
    url.searchParams.delete(parameter)
  }

  return {
    pageLocation: url.toString(),
    pagePath: `${url.pathname}${url.search}`,
  }
}

export function cleanTrackingReferrer(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined
  try {
    return cleanTrackingLocation(rawUrl).pageLocation
  } catch {
    return rawUrl
  }
}
