import { describe, expect, it } from 'vitest'
import { cleanTrackingLocation, cleanTrackingReferrer } from '../trackingUrl'

describe('trackingUrl', () => {
  it('elimina parámetros internos y conserva atribución comercial', () => {
    const clean = cleanTrackingLocation(
      'https://example.test/courses/306/tematica?gtm_debug=x&utm_campaign=joyeria&fbclid=ABC&_dbg=1',
    )

    expect(clean).toEqual({
      pageLocation: 'https://example.test/courses/306/tematica?utm_campaign=joyeria&fbclid=ABC',
      pagePath: '/courses/306/tematica?utm_campaign=joyeria&fbclid=ABC',
    })
  })

  it('limpia también el referente sin descartar sus parámetros legítimos', () => {
    expect(cleanTrackingReferrer('https://example.test/courses?gtm_preview=env-2&utm_source=mail')).toBe(
      'https://example.test/courses?utm_source=mail',
    )
  })
})
