import { pushDataLayerEvent } from './dataLayer'

export interface ConfirmedPurchaseItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

export interface ConfirmedPurchase {
  transaction_id: string
  order_reference: string
  event_id: string
  currency: string
  value: number
  payment_type: string
  items: ConfirmedPurchaseItem[]
}

export interface ConfirmedPurchaseResponse {
  status: string
  purchase?: ConfirmedPurchase | null
  categories?: { id: number }[]
}

const sentInThisPage = new Set<string>()

function isValidPurchase(purchase: ConfirmedPurchase): boolean {
  if (!purchase.transaction_id || !purchase.order_reference) return false
  if (purchase.event_id !== `purchase-${purchase.order_reference}`) return false
  if (!purchase.currency || !Number.isFinite(purchase.value) || purchase.value <= 0) return false
  if (!purchase.payment_type || !Array.isArray(purchase.items) || purchase.items.length === 0) return false

  return purchase.items.every((item) =>
    Boolean(item.item_id)
    && Boolean(item.item_name)
    && Boolean(item.item_category)
    && Number.isFinite(item.price)
    && item.price > 0
    && Number.isInteger(item.quantity)
    && item.quantity > 0,
  )
}

function storageKey(transactionId: string): string {
  return `ga4_purchase_sent_${transactionId}`
}

function wasSent(key: string): boolean {
  if (sentInThisPage.has(key)) return true
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

/** Emite solo a dataLayer; no conoce usuarios, backend, carrito ni Meta CAPI. */
export function sendConfirmedPurchaseToDataLayer(
  response: ConfirmedPurchaseResponse | null | undefined,
): boolean {
  if (response?.status !== 'APPROVED' || !response.purchase) return false
  const purchase = response.purchase
  if (!isValidPurchase(purchase)) return false

  const key = storageKey(purchase.transaction_id)
  if (wasSent(key)) return false

  const items = purchase.items.map((item) => ({
    item_id: item.item_id,
    item_name: item.item_name,
    item_category: item.item_category,
    price: item.price,
    quantity: item.quantity,
  }))

  pushDataLayerEvent('purchase', purchase.event_id, {
    ecommerce: {
      transaction_id: purchase.transaction_id,
      currency: purchase.currency,
      value: purchase.value,
      payment_type: purchase.payment_type,
      items,
    },
  })

  sentInThisPage.add(key)
  try {
    localStorage.setItem(key, 'true')
  } catch {
    // La protección en memoria sigue evitando duplicados durante esta carga.
  }
  return true
}
