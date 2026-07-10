import type { RouteLocationNormalized, Router } from "vue-router";

import EventService, { type TrackedEvent } from "../services/EventService";
import {
  captureAttribution,
  getAnonymousId,
  getEventContext,
  newEventId,
  resolveVisitKind,
  touchSession,
} from "../composables/useEventContext";

/**
 * Registro first-party de navegación (F2.5). Aditivo: el dataLayer/GTM sigue igual; aquí solo
 * mandamos PageView a `POST /api/events` y, una vez por carga, FirstVisit o ReturnVisit.
 * Reutiliza el mismo generador de `event_id` que el dataLayer para permitir dedup CAPI en F4.
 */

/** La inicialización de sesión (FirstVisit/ReturnVisit) corre una sola vez por carga de página. */
let sessionStarted = false;

function startSession(): void {
  if (sessionStarted) return;
  sessionStarted = true;

  captureAttribution(); // fija utm_*/fbclid/gclid del landing en la sesión
  getAnonymousId(); // garantiza el id anónimo estable
  const { isNew } = touchSession(); // authoritative: define si la sesión es nueva

  const kind = resolveVisitKind(isNew);
  if (!kind) return;

  emit(kind === "first" ? "FirstVisit" : "ReturnVisit", document.referrer || undefined);
}

/** referrer_url: en el landing, el referrer externo; en navegación interna, la página anterior. */
function referrerFor(from: RouteLocationNormalized): string | undefined {
  if (from.name) return window.location.origin + from.fullPath;
  return document.referrer || undefined;
}

function emit(eventName: string, referrerUrl?: string): void {
  const event: TrackedEvent = {
    event_id: newEventId(),
    event_name: eventName,
    event_source_url: window.location.href,
    referrer_url: referrerUrl,
    ...getEventContext(),
  };
  EventService.sendEvents(event);
}

export function registerTrackingGuards(router: Router): void {
  router.afterEach((_to, from) => {
    if (typeof document === "undefined") return;
    startSession();
    emit("PageView", referrerFor(from));
  });
}
