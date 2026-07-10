import type { ICategory } from '../types/Categorie'
import EventService, { type TrackedEvent } from '../services/EventService'
import { getEventContext, newEventId } from './useEventContext'

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
const CONTENT_TYPE = 'product'

function mapCategoryToItem(category: ICategory): GA4Item {
  return {
    item_id: String(category.id),
    item_name: category.titulo ?? '',
    item_category: category.pack_nombre ?? 'Curso',
    price: category.precio_desc,
    quantity: 1
  }
}

function isCategoryFree(category: ICategory): boolean {
  return (category.precio_desc ?? category.precio ?? 0) <= 0
}

/** Comercio para eventos de una sola categoría (ViewContent/AddToCart). */
function fbFieldsFromCategory(category: ICategory): Partial<TrackedEvent> {
  return {
    content_id: category.id,
    content_ids: [category.id],
    content_type: CONTENT_TYPE,
    content_name: category.titulo,
    is_free: isCategoryFree(category),
    value: category.precio_desc,
    currency: CURRENCY,
    num_items: 1
  }
}

/** Comercio para eventos de varias categorías (InitiateCheckout/AddPaymentInfo/Purchase). */
function fbFieldsFromCategories(categories: ICategory[], value: number): Partial<TrackedEvent> {
  return {
    content_ids: categories.map((c) => c.id),
    content_type: CONTENT_TYPE,
    value,
    currency: CURRENCY,
    num_items: categories.length
  }
}

/** Envía un evento al backend (POST /api/events) adjuntando el contexto de identidad/atribución. */
function sendBackend(event_id: string, event_name: string, fields?: Partial<TrackedEvent>) {
  try {
    EventService.sendEvents({
      event_id,
      event_name,
      event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...getEventContext(),
      ...fields
    })
  } catch (error) {
    // El tracking es best-effort: nunca debe romper la lógica de negocio.
    console.error('useTracking: fallo emitiendo al backend', error)
  }
}

/**
 * Emisión dual (F3.1): empuja al dataLayer (GTM/Stape) y, con el MISMO `event_id`, al backend.
 * Un único punto de emisión evita duplicar llamadas en cada componente y permite la
 * deduplicación navegador↔servidor cuando llegue la Conversions API (F4).
 */
function emit(
  dataLayerName: string,
  dataLayerPayload: Record<string, unknown>,
  backend: { event_name: string; fields?: Partial<TrackedEvent> } | null,
  eventId?: string
) {
  // `eventId` explícito → id determinístico (p. ej. compra) para deduplicar navegador↔servidor.
  const event_id = eventId || newEventId()
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({
    event: dataLayerName,
    event_id,
    ...dataLayerPayload
  })
  if (backend) sendBackend(event_id, backend.event_name, backend.fields)
}

export function useTracking() {
  function trackViewItem(category: ICategory) {
    const item = mapCategoryToItem(category)
    emit(
      'view_item_stape',
      { ecommerce: { currency: CURRENCY, value: item.price, items: [item] } },
      { event_name: 'ViewContent', fields: fbFieldsFromCategory(category) }
    )
  }

  function trackAddToCart(category: ICategory) {
    const item = mapCategoryToItem(category)
    emit(
      'add_to_cart_stape',
      { ecommerce: { currency: CURRENCY, value: item.price, items: [item] } },
      { event_name: 'AddToCart', fields: fbFieldsFromCategory(category) }
    )
  }

  function trackBeginCheckout(categories: ICategory[], totalValue: number) {
    const items = categories.map(mapCategoryToItem)
    emit(
      'begin_checkout_stape',
      { ecommerce: { currency: CURRENCY, value: totalValue, cart_quantity: items.length, items } },
      { event_name: 'InitiateCheckout', fields: fbFieldsFromCategories(categories, totalValue) }
    )
  }

  function trackAddPaymentInfo(categories: ICategory[], totalValue: number, paymentMethod: string) {
    const items = categories.map(mapCategoryToItem)
    emit(
      'add_payment_info_stape',
      {
        ecommerce: {
          currency: CURRENCY,
          value: totalValue,
          payment_type: paymentMethod,
          cart_quantity: items.length,
          items
        }
      },
      {
        event_name: 'AddPaymentInfo',
        fields: {
          ...fbFieldsFromCategories(categories, totalValue),
          custom_data: { payment_method: paymentMethod }
        }
      }
    )
  }

  function trackPurchase(categories: ICategory[], totalValue: number, transactionId: string, userData: TrackingUserData) {
    const items = categories.map(mapCategoryToItem)
    emit(
      'purchase_stape',
      {
        ecommerce: {
          currency: CURRENCY,
          value: totalValue,
          transaction_id: transactionId,
          cart_quantity: items.length,
          items
        },
        user_data: userData
      },
      {
        event_name: 'Purchase',
        fields: { ...fbFieldsFromCategories(categories, totalValue), order_id: transactionId }
      }
    )
  }

  function trackPurchaseFromPending(
    pending: { items: GA4Item[]; value: number; currency: string },
    transactionId: string,
    userData: TrackingUserData
  ) {
    emit(
      'purchase_stape',
      {
        ecommerce: {
          currency: pending.currency,
          value: pending.value,
          transaction_id: transactionId,
          cart_quantity: pending.items.length,
          items: pending.items
        },
        user_data: userData
      },
      {
        event_name: 'Purchase',
        fields: {
          content_ids: pending.items.map((i) => Number(i.item_id)).filter((n) => !Number.isNaN(n)),
          content_type: CONTENT_TYPE,
          value: pending.value,
          currency: pending.currency,
          num_items: pending.items.length,
          order_id: transactionId
        }
      },
      // Mismo id que el Purchase server-side de los webhooks → Facebook/ingesta deduplican.
      transactionId ? `purchase-${transactionId}` : undefined
    )
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

  /**
   * Evento first-party solo-backend (custom o estándar que no va al dataLayer): F3.4.
   * Adjunta identidad/atribución automáticamente; `fields` añade content_id/search_string/etc.
   */
  function trackCustom(eventName: string, fields?: Partial<TrackedEvent>) {
    sendBackend(newEventId(), eventName, fields)
  }

  /** ViewContent de un curso individual dentro de un paquete (F3.2, handleCourseClick). */
  function trackViewContentCourse(course: { id?: number; name_del_curso?: string; es_gratis?: boolean }) {
    trackCustom('ViewContent', {
      content_id: course.id,
      content_ids: course.id != null ? [course.id] : undefined,
      content_type: 'course',
      content_name: course.name_del_curso,
      is_free: Boolean(course.es_gratis)
    })
  }

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackPurchaseFromPending,
    persistPurchaseData,
    getPendingPurchase,
    trackCustom,
    trackViewContentCourse
  }
}
