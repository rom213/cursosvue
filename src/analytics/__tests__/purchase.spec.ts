import { beforeEach, describe, expect, it } from 'vitest'
import {
  sendConfirmedPurchaseToDataLayer,
  type ConfirmedPurchaseResponse,
} from '../purchase'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function approved(transactionId: string): ConfirmedPurchaseResponse {
  return {
    status: 'APPROVED',
    purchase: {
      transaction_id: transactionId,
      order_reference: `order-${transactionId}`,
      event_id: `purchase-order-${transactionId}`,
      currency: 'COP',
      value: 7840,
      payment_type: 'Wompi',
      items: [{
        item_id: '301',
        item_name: 'Identidad Visual',
        item_category: 'Curso',
        price: 7840,
        quantity: 1,
      }],
    },
  }
}

beforeEach(() => {
  ;(globalThis as any).window = { dataLayer: [] }
  ;(globalThis as any).localStorage = new MemoryStorage()
})

describe('sendConfirmedPurchaseToDataLayer', () => {
  it('publica un purchase limpio con ecommerce confirmado', () => {
    const response = approved('tx-approved')
    ;(response.purchase!.items[0] as any).email = 'private@example.test'
    ;(response.purchase!.items[0] as any).message = 'mensaje privado'
    expect(sendConfirmedPurchaseToDataLayer(response)).toBe(true)

    expect(window.dataLayer).toEqual([
      { ecommerce: null },
      {
        event: 'purchase',
        event_id: 'purchase-order-tx-approved',
        ecommerce: {
          transaction_id: 'tx-approved',
          currency: 'COP',
          value: 7840,
          payment_type: 'Wompi',
          items: [{
            item_id: '301',
            item_name: 'Identidad Visual',
            item_category: 'Curso',
            price: 7840,
            quantity: 1,
          }],
        },
      },
    ])
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/private@example|mensaje privado/)
  })

  it('no publica estados no aprobados', () => {
    expect(sendConfirmedPurchaseToDataLayer({ status: 'PENDING', purchase: null })).toBe(false)
    expect(sendConfirmedPurchaseToDataLayer({ status: 'DECLINED', purchase: null })).toBe(false)
    expect(window.dataLayer).toEqual([])
  })

  it('no repite una transacción ya marcada en almacenamiento', () => {
    const response = approved('tx-dedup')
    expect(sendConfirmedPurchaseToDataLayer(response)).toBe(true)
    expect(sendConfirmedPurchaseToDataLayer(response)).toBe(false)
    expect(window.dataLayer.filter((item) => item.event === 'purchase')).toHaveLength(1)
  })

  it('respeta una transacción marcada durante una carga anterior', () => {
    localStorage.setItem('ga4_purchase_sent_tx-reload', 'true')

    expect(sendConfirmedPurchaseToDataLayer(approved('tx-reload'))).toBe(false)
    expect(window.dataLayer).toEqual([])
  })

  it('rechaza artículos inválidos y event_id que no coincide con la orden', () => {
    const invalidItem = approved('tx-invalid-item')
    invalidItem.purchase!.items[0].item_id = ''
    const invalidEventId = approved('tx-invalid-event')
    invalidEventId.purchase!.event_id = 'random-event-id'

    expect(sendConfirmedPurchaseToDataLayer(invalidItem)).toBe(false)
    expect(sendConfirmedPurchaseToDataLayer(invalidEventId)).toBe(false)
    expect(window.dataLayer).toEqual([])
  })
})
