import { beforeEach, describe, expect, it } from 'vitest'
import { pushDataLayerEvent } from '../dataLayer'

describe('pushDataLayerEvent', () => {
  beforeEach(() => {
    ;(globalThis as { window?: unknown }).window = { dataLayer: [] }
  })

  it('limpia ecommerce antes de publicar un evento ecommerce', () => {
    pushDataLayerEvent('view_cart', 'evt-1', { ecommerce: { value: 10 } })

    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      { event: 'view_cart', event_id: 'evt-1', ecommerce: { value: 10 } },
    ])
  })

  it('no limpia ecommerce para eventos sin payload ecommerce', () => {
    pushDataLayerEvent('login', 'evt-2', { method: 'google' })

    expect(window.dataLayer).toEqual([
      { event: 'login', event_id: 'evt-2', method: 'google' },
    ])
  })
})
