import EventService, { type TrackedEvent } from '../services/EventService'
import { getEventContext, newEventId } from '../composables/useEventContext'
import { pushDataLayerEvent } from './dataLayer'

export interface TrackingDispatch {
  analytics: {
    name: string
    parameters?: Record<string, unknown>
  }
  backend: {
    name: string
    fields?: Partial<TrackedEvent>
  } | null
  eventId?: string
}

/** Coordina los canales sin conocer cómo se construye cada evento de negocio. */
export function dispatchTrackingEvent(message: TrackingDispatch): string {
  const eventId = message.eventId || newEventId()
  pushDataLayerEvent(
    message.analytics.name,
    eventId,
    message.analytics.parameters,
  )

  if (message.backend) {
    try {
      EventService.sendEvents({
        event_id: eventId,
        event_name: message.backend.name,
        event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...getEventContext(),
        ...message.backend.fields,
      })
    } catch (error) {
      console.error('trackingDispatcher: fallo emitiendo al backend', error)
    }
  }

  return eventId
}
