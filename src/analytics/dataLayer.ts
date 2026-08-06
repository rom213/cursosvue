export type DataLayerValue = unknown

export interface DataLayerEvent {
  event: string
  event_id: string
  [key: string]: DataLayerValue
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

/**
 * Única puerta de entrada a Google Tag Manager. No conoce Vue, el backend ni
 * reglas de negocio; solamente traduce un evento a mensajes del dataLayer.
 */
export function pushDataLayerEvent(
  event: string,
  eventId: string,
  parameters: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  if (Object.prototype.hasOwnProperty.call(parameters, 'ecommerce')) {
    window.dataLayer.push({ ecommerce: null })
  }
  window.dataLayer.push({ event, event_id: eventId, ...parameters })
}
