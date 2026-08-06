import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ICategory } from '../../types/Categorie'

const { sendEvents } = vi.hoisted(() => ({ sendEvents: vi.fn() }))

vi.mock('../../services/EventService', () => ({
  default: { sendEvents },
}))

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
  removeItem(key: string) { this.values.delete(key) }
}

const category: ICategory = {
  id: 7,
  titulo: 'Pack de prueba',
  pack_nombre: 'Pack',
  precio: 80,
  precio_desc: 100,
  cupos_google: 1,
  reference_code: '',
  signature: '',
  user_bought: false,
  user_comment: false,
  created_at: '',
  courses: [],
}

let useTracking: typeof import('../useTracking').useTracking

beforeEach(async () => {
  sendEvents.mockReset()
  ;(globalThis as any).localStorage = new MemoryStorage()
  ;(globalThis as any).sessionStorage = new MemoryStorage()
  ;(globalThis as any).document = { cookie: '' }
  ;(globalThis as any).window = {
    dataLayer: [],
    location: { search: '', href: 'https://example.test/courses', origin: 'https://example.test' },
  }
  vi.resetModules()
  ;({ useTracking } = await import('../useTracking'))
})

afterEach(() => vi.restoreAllMocks())

describe('useTracking', () => {
  it('publica el nombre GA4 estándar y usa el precio realmente cobrado', () => {
    useTracking().trackAddToCart(category)

    expect(window.dataLayer[1]).toMatchObject({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'COP',
        value: 80,
        items: [{ item_id: '7', price: 80, quantity: 1 }],
      },
    })
  })

  it('comparte event_id entre dataLayer y backend', () => {
    useTracking().trackAuthentication(false, 'google')

    const browserEvent = window.dataLayer[0] as { event_id: string }
    expect(browserEvent).toMatchObject({ event: 'login', method: 'google' })
    expect(sendEvents).toHaveBeenCalledWith(expect.objectContaining({
      event_id: browserEvent.event_id,
      event_name: 'Login',
    }))
  })

  it('normaliza eventos personalizados para GA4 sin cambiar el contrato del backend', () => {
    useTracking().trackCustom('LessonProgress', { custom_data: { progress: 50 } })

    expect(window.dataLayer[0]).toMatchObject({ event: 'lesson_progress', progress: 50 })
    expect(sendEvents).toHaveBeenCalledWith(expect.objectContaining({ event_name: 'LessonProgress' }))
  })

  it('distingue un registro nuevo de un inicio de sesión', () => {
    useTracking().trackAuthentication(true, 'facebook')

    expect(window.dataLayer[0]).toMatchObject({ event: 'sign_up', method: 'facebook' })
    expect(sendEvents).toHaveBeenCalledWith(expect.objectContaining({
      event_name: 'CompleteRegistration',
    }))
  })

  it('usa una referencia determinística para deduplicar purchase', () => {
    useTracking().trackPurchaseFromPending(
      { items: [{ item_id: '7', item_name: 'Pack', item_category: 'Pack', price: 80, quantity: 1 }], value: 80, currency: 'COP' },
      'order-123',
      { email: '', phone: '', first_name: '', last_name: '', country: '', customer_id: '' },
    )

    expect(window.dataLayer[1]).toMatchObject({ event: 'purchase', event_id: 'purchase-order-123' })
    expect(sendEvents).toHaveBeenCalledWith(expect.objectContaining({
      event_id: 'purchase-order-123',
      order_id: 'order-123',
    }))
  })

  it('descarta una compra pendiente vencida', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000_000)
    useTracking().persistPurchaseData([category], 80)
    now.mockReturnValue(10_000_000 + 2 * 60 * 60 * 1000 + 1)

    expect(useTracking().getPendingPurchase()).toBeNull()
  })
})
