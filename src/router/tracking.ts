import type { RouteLocationNormalized, Router } from "vue-router";
import { nextTick } from "vue";

import EventService, { type TrackedEvent } from "../services/EventService";
import {
  captureAttribution,
  getAnonymousId,
  getEventContext,
  newEventId,
  resolveVisitKind,
  touchSession,
} from "../composables/useEventContext";
import { pageViewCoordinator } from "../analytics/pageViewCoordinator";

/**
 * Registro de navegación SPA (F2.5). Cada ruta emite el mismo PageView a GTM y al backend;
 * FirstVisit/ReturnVisit siguen siendo señales first-party que solo necesita el backend.
 * Ambos canales comparten `event_id` para permitir deduplicación.
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
  router.afterEach(async (to, from) => {
    if (typeof document === "undefined") return;
    startSession();
    const referrerUrl = referrerFor(from);
    const token = pageViewCoordinator.begin({
      pageLocation: window.location.href,
      pageReferrer: referrerUrl,
    });

    if (to.meta.deferPageView === true) return;

    await nextTick();
    pageViewCoordinator.complete(token, document.title);
  });
}
