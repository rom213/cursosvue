import type { ICategory } from '../types/Categorie'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export interface TrackingUserData {
  email: string
  phone: string
  first_name: string
  last_name: string
  country: string
  customer_id: string
}

interface GA4Item {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

const CURRENCY = 'COP'
const STORAGE_KEY = 'pending_purchase'

function mapCategoryToItem(category: ICategory): GA4Item {
  return {
    item_id: String(category.id),
    item_name: category.titulo ?? '',
    item_category: category.pack_nombre ?? 'Curso',
    price: category.precio_desc,
    quantity: 1
  }
}

function pushEvent(eventName: string, payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({
    event: eventName,
    event_id: crypto.randomUUID(),
    ...payload
  })
}

export function useTracking() {
  function trackViewItem(category: ICategory) {
    const item = mapCategoryToItem(category)
    pushEvent('view_item_stape', {
      ecommerce: {
        currency: CURRENCY,
        value: item.price,
        items: [item]
      }
    })
  }

  function trackAddToCart(category: ICategory) {
    const item = mapCategoryToItem(category)
    pushEvent('add_to_cart_stape', {
      ecommerce: {
        currency: CURRENCY,
        value: item.price,
        items: [item]
      }
    })
  }

  function trackBeginCheckout(categories: ICategory[], totalValue: number) {
    const items = categories.map(mapCategoryToItem)
    pushEvent('begin_checkout_stape', {
      ecommerce: {
        currency: CURRENCY,
        value: totalValue,
        cart_quantity: items.length,
        items
      }
    })
  }

  function trackAddPaymentInfo(categories: ICategory[], totalValue: number, paymentMethod: string) {
    const items = categories.map(mapCategoryToItem)
    pushEvent('add_payment_info_stape', {
      ecommerce: {
        currency: CURRENCY,
        value: totalValue,
        payment_type: paymentMethod,
        cart_quantity: items.length,
        items
      }
    })
  }

  function trackPurchase(categories: ICategory[], totalValue: number, transactionId: string, userData: TrackingUserData) {
    const items = categories.map(mapCategoryToItem)
    pushEvent('purchase_stape', {
      ecommerce: {
        currency: CURRENCY,
        value: totalValue,
        transaction_id: transactionId,
        cart_quantity: items.length,
        items
      },
      user_data: userData
    })
  }

  function trackPurchaseFromPending(
    pending: { items: GA4Item[]; value: number; currency: string },
    transactionId: string,
    userData: TrackingUserData
  ) {
    pushEvent('purchase_stape', {
      ecommerce: {
        currency: pending.currency,
        value: pending.value,
        transaction_id: transactionId,
        cart_quantity: pending.items.length,
        items: pending.items
      },
      user_data: userData
    })
  }

  function persistPurchaseData(categories: ICategory[], totalValue: number) {
    const items = categories.map(mapCategoryToItem)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      items,
      value: totalValue,
      currency: CURRENCY,
      timestamp: Date.now()
    }))
  }

  function getPendingPurchase(): { items: GA4Item[]; value: number; currency: string; timestamp: number } | null {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackPurchaseFromPending,
    persistPurchaseData,
    getPendingPurchase
  }
}
