import type { ICategory } from '../types/Categorie'
import type { TrackedEvent } from '../services/EventService'
import {
  categoriesToGA4Items,
  categoryPrice,
  categoryToGA4Item,
  TRACKING_CURRENCY,
  type GA4Item,
} from '../analytics/ecommerce'
import { dispatchTrackingEvent } from '../analytics/trackingDispatcher'
import { currentPageTrackingContext } from '../analytics/pageViewCoordinator'

export interface WhatsAppTrackingContext {
  source: string
  campaignId?: string
  contentName?: string
  contentCategory?: string
}

export interface TrackingUserData {
  email: string
  phone: string
  first_name: string
  last_name: string
  country: string
  customer_id: string
}

interface PendingPurchase {
  items: GA4Item[]
  value: number
  currency: string
  timestamp: number
}

const STORAGE_KEY = 'pending_purchase'
const CONTENT_TYPE = 'product'
const PENDING_PURCHASE_TTL_MS = 2 * 60 * 60 * 1000

function isCategoryFree(category: ICategory): boolean {
  return categoryPrice(category) <= 0
}

function backendFieldsFromCategory(category: ICategory): Partial<TrackedEvent> {
  const price = categoryPrice(category)
  return {
    content_id: category.id,
    content_ids: [category.id],
    content_type: CONTENT_TYPE,
    content_name: category.titulo,
    is_free: isCategoryFree(category),
    ...(price > 0 ? { value: price, currency: TRACKING_CURRENCY } : {}),
    num_items: 1,
  }
}

function backendFieldsFromCategories(
  categories: ICategory[],
  value: number,
): Partial<TrackedEvent> {
  return {
    content_ids: categories.map((category) => category.id),
    content_type: CONTENT_TYPE,
    value,
    currency: TRACKING_CURRENCY,
    num_items: categories.length,
  }
}

function itemsWithTotal(categories: ICategory[], totalValue: number): GA4Item[] {
  const items = categoriesToGA4Items(categories)
  if (items.length === 1 && Number.isFinite(totalValue)) {
    return [{ ...items[0], price: totalValue }]
  }
  return items
}

/** Convierte el shape first-party a parámetros legibles por GTM sin duplicar custom_data. */
function analyticsParameters(fields?: Partial<TrackedEvent>): Record<string, unknown> {
  if (!fields) return {}
  const { custom_data, ...parameters } = fields
  return { ...parameters, ...custom_data }
}

function analyticsEventName(eventName: string): string {
  return eventName
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export function useTracking() {
  function trackViewItemList(categories: ICategory[], listId: string, listName: string) {
    if (categories.length === 0) return
    const items = categories.map((category, index) =>
      categoryToGA4Item(category, { id: listId, name: listName, index }),
    )
    dispatchTrackingEvent({
      analytics: {
        name: 'view_item_list',
        parameters: { ecommerce: { item_list_id: listId, item_list_name: listName, items } },
      },
      backend: {
        name: 'ViewItemList',
        fields: {
          content_ids: categories.map((category) => category.id),
          num_items: categories.length,
          custom_data: { item_list_id: listId, item_list_name: listName },
        },
      },
    })
  }

  function trackSelectItem(category: ICategory, listId: string, listName: string) {
    const item = categoryToGA4Item(category, { id: listId, name: listName })
    dispatchTrackingEvent({
      analytics: {
        name: 'select_item',
        parameters: { ecommerce: { item_list_id: listId, item_list_name: listName, items: [item] } },
      },
      backend: {
        name: 'SelectItem',
        fields: {
          ...backendFieldsFromCategory(category),
          custom_data: { item_list_id: listId, item_list_name: listName },
        },
      },
    })
  }

  function trackViewItem(category: ICategory) {
    const item = categoryToGA4Item(category)
    dispatchTrackingEvent({
      analytics: {
        name: 'view_item',
        parameters: {
          ecommerce: { currency: TRACKING_CURRENCY, value: item.price, items: [item] },
        },
      },
      backend: { name: 'ViewContent', fields: backendFieldsFromCategory(category) },
    })
  }

  function trackAddToCart(category: ICategory) {
    const item = categoryToGA4Item(category)
    dispatchTrackingEvent({
      analytics: {
        name: 'add_to_cart',
        parameters: {
          ecommerce: { currency: TRACKING_CURRENCY, value: item.price, items: [item] },
        },
      },
      backend: { name: 'AddToCart', fields: backendFieldsFromCategory(category) },
    })
  }

  function trackViewCart(categories: ICategory[], totalValue: number) {
    dispatchTrackingEvent({
      analytics: {
        name: 'view_cart',
        parameters: {
          ecommerce: {
            currency: TRACKING_CURRENCY,
            value: totalValue,
            items: itemsWithTotal(categories, totalValue),
          },
        },
      },
      backend: { name: 'ViewCart', fields: backendFieldsFromCategories(categories, totalValue) },
    })
  }

  function trackRemoveFromCart(category: ICategory) {
    const item = categoryToGA4Item(category)
    dispatchTrackingEvent({
      analytics: {
        name: 'remove_from_cart',
        parameters: {
          ecommerce: { currency: TRACKING_CURRENCY, value: item.price, items: [item] },
        },
      },
      backend: { name: 'RemoveFromCart', fields: backendFieldsFromCategory(category) },
    })
  }

  function trackBeginCheckout(categories: ICategory[], totalValue: number) {
    dispatchTrackingEvent({
      analytics: {
        name: 'begin_checkout',
        parameters: {
          ecommerce: {
            currency: TRACKING_CURRENCY,
            value: totalValue,
            items: itemsWithTotal(categories, totalValue),
          },
        },
      },
      backend: {
        name: 'InitiateCheckout',
        fields: backendFieldsFromCategories(categories, totalValue),
      },
    })
  }

  function trackAddPaymentInfo(
    categories: ICategory[],
    totalValue: number,
    paymentMethod: string,
  ) {
    dispatchTrackingEvent({
      analytics: {
        name: 'add_payment_info',
        parameters: {
          ecommerce: {
            currency: TRACKING_CURRENCY,
            value: totalValue,
            payment_type: paymentMethod,
            items: itemsWithTotal(categories, totalValue),
          },
        },
      },
      backend: {
        name: 'AddPaymentInfo',
        fields: {
          ...backendFieldsFromCategories(categories, totalValue),
          custom_data: { payment_method: paymentMethod },
        },
      },
    })
  }

  function trackPurchase(
    categories: ICategory[],
    totalValue: number,
    transactionId: string,
    userData: TrackingUserData,
  ) {
    dispatchTrackingEvent({
      analytics: {
        name: 'purchase',
        parameters: {
          ecommerce: {
            currency: TRACKING_CURRENCY,
            value: totalValue,
            transaction_id: transactionId,
            items: itemsWithTotal(categories, totalValue),
          },
          user_data: userData,
        },
      },
      backend: {
        name: 'Purchase',
        fields: { ...backendFieldsFromCategories(categories, totalValue), order_id: transactionId },
      },
      eventId: `purchase-${transactionId}`,
    })
  }

  function trackPurchaseFromPending(
    pending: Pick<PendingPurchase, 'items' | 'value' | 'currency'>,
    transactionId: string,
    userData: TrackingUserData,
  ) {
    dispatchTrackingEvent({
      analytics: {
        name: 'purchase',
        parameters: {
          ecommerce: {
            currency: pending.currency,
            value: pending.value,
            transaction_id: transactionId,
            items: pending.items,
          },
          user_data: userData,
        },
      },
      backend: {
        name: 'Purchase',
        fields: {
          content_ids: pending.items
            .map((item) => Number(item.item_id))
            .filter((id) => !Number.isNaN(id)),
          content_type: CONTENT_TYPE,
          value: pending.value,
          currency: pending.currency,
          num_items: pending.items.length,
          order_id: transactionId,
        },
      },
      eventId: `purchase-${transactionId}`,
    })
  }

  function persistPurchaseData(categories: ICategory[], totalValue: number) {
    const pending: PendingPurchase = {
      items: itemsWithTotal(categories, totalValue),
      value: totalValue,
      currency: TRACKING_CURRENCY,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
  }

  function getPendingPurchase(): PendingPurchase | null {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    try {
      const pending = JSON.parse(raw) as PendingPurchase
      if (!pending.timestamp || Date.now() - pending.timestamp > PENDING_PURCHASE_TTL_MS) return null
      if (!Array.isArray(pending.items) || pending.items.length === 0) return null
      return pending
    } catch {
      return null
    }
  }

  /** Evento de negocio no estándar. Se envía a GTM y al backend con el mismo event_id. */
  function trackCustom(eventName: string, fields?: Partial<TrackedEvent>) {
    dispatchTrackingEvent({
      analytics: { name: analyticsEventName(eventName), parameters: analyticsParameters(fields) },
      backend: { name: eventName, fields },
    })
  }

  function trackSearch(searchTerm: string, resultCount: number) {
    dispatchTrackingEvent({
      analytics: { name: 'search', parameters: { search_term: searchTerm, results_count: resultCount } },
      backend: { name: 'Search', fields: { search_string: searchTerm, num_items: resultCount } },
    })
  }

  function trackAuthentication(isNewUser: boolean, method: 'google' | 'facebook') {
    dispatchTrackingEvent({
      analytics: {
        name: isNewUser ? 'sign_up' : 'login',
        parameters: { method },
      },
      backend: {
        name: isNewUser ? 'CompleteRegistration' : 'Login',
        fields: { custom_data: { method } },
      },
    })
  }

  function trackReferralClick(affiliateId: string) {
    dispatchTrackingEvent({
      analytics: { name: 'referral_click', parameters: { affiliate_id: affiliateId } },
      backend: { name: 'ReferralClick', fields: { custom_data: { affiliaty_id: affiliateId } } },
    })
  }

  function trackViewPromotion(promotionId: string, promotionName: string, creativeName: string) {
    dispatchTrackingEvent({
      analytics: {
        name: 'view_promotion',
        parameters: { ecommerce: { promotion_id: promotionId, promotion_name: promotionName, creative_name: creativeName } },
      },
      backend: {
        name: 'PromoView',
        fields: { custom_data: { promotion_id: promotionId, promotion_name: promotionName, creative_name: creativeName } },
      },
    })
  }

  function trackSelectPromotion(promotionId: string, promotionName: string, creativeName: string) {
    dispatchTrackingEvent({
      analytics: {
        name: 'select_promotion',
        parameters: { ecommerce: { promotion_id: promotionId, promotion_name: promotionName, creative_name: creativeName } },
      },
      backend: {
        name: 'PromoClick',
        fields: { custom_data: { promotion_id: promotionId, promotion_name: promotionName, creative_name: creativeName } },
      },
    })
  }

  function trackGenerateLead(source: string, contentId?: number) {
    dispatchTrackingEvent({
      analytics: { name: 'generate_lead', parameters: { lead_source: source, content_id: contentId } },
      backend: {
        name: 'Lead',
        fields: { content_id: contentId, custom_data: { lead_source: source } },
      },
    })
  }

  function trackViewContentCourse(
    course: { id?: number; name_del_curso?: string; es_gratis?: boolean },
    pack?: ICategory,
  ) {
    const price = pack ? categoryPrice(pack) : 0
    const fields: Partial<TrackedEvent> = {
      content_id: course.id,
      content_ids: course.id == null ? undefined : [course.id],
      content_type: 'course',
      content_name: course.name_del_curso,
      is_free: Boolean(course.es_gratis),
      ...(price > 0 ? { value: price, currency: TRACKING_CURRENCY } : {}),
    }
    dispatchTrackingEvent({
      analytics: { name: 'view_course', parameters: analyticsParameters(fields) },
      backend: { name: 'ViewContent', fields },
    })
  }

  function trackWhatsAppIntent(category: ICategory, context: WhatsAppTrackingContext) {
    const item = categoryToGA4Item(category)
    const pageContext = currentPageTrackingContext()
    const contentName = context.contentName ?? category.titulo
    const contentCategory = context.contentCategory ?? CONTENT_TYPE
    dispatchTrackingEvent({
      analytics: {
        name: 'whatsapp_contact',
        parameters: {
          ecommerce: { currency: TRACKING_CURRENCY, value: item.price, items: [item] },
          content_id: String(category.id),
          ...(context.campaignId ? { campaign_id: context.campaignId } : {}),
          content_name: contentName,
          content_category: contentCategory,
          value: item.price,
          currency: TRACKING_CURRENCY,
          contact_method: 'whatsapp',
          source: context.source,
          channel: 'whatsapp',
          ...pageContext,
        },
      },
      backend: {
        name: 'Contact',
        fields: {
          ...backendFieldsFromCategory(category),
          custom_data: {
            method: 'whatsapp',
            intent: 'purchase',
            source: context.source,
            channel: 'whatsapp',
            ...(context.campaignId ? { campaign_id: context.campaignId } : {}),
          },
        },
      },
    })
  }

  return {
    trackViewItemList,
    trackSelectItem,
    trackViewItem,
    trackAddToCart,
    trackViewCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackPurchaseFromPending,
    persistPurchaseData,
    getPendingPurchase,
    trackCustom,
    trackSearch,
    trackAuthentication,
    trackReferralClick,
    trackViewPromotion,
    trackSelectPromotion,
    trackGenerateLead,
    trackViewContentCourse,
    trackWhatsAppIntent,
  }
}
