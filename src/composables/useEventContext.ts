// src/composables/useEventContext.ts
import type { TrackedEvent } from "../services/EventService";
import {
  EVENT_ANON_ID_KEY,
  EVENT_ATTRIBUTION_KEY,
  EVENT_FIRST_VISIT_KEY,
  EVENT_SESSION_ACTIVE_KEY,
  EVENT_SESSION_ID_KEY,
} from "../constants/storageKeys";

/**
 * Contexto de identidad y atribución que se adjunta a cada evento first-party.
 *
 * Este módulo NO envía nada (no importa EventService): solo lee/persiste identidad, sesión y
 * señales de marketing. La orquestación (emitir PageView/FirstVisit/ReturnVisit) vive en el
 * guard del router (router/tracking.ts).
 */

/** ~30 min de inactividad cierran la sesión (estándar de analítica). */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
}

export type VisitKind = "first" | "return" | null;

/** UUID v4; usa crypto.randomUUID (ya lo usa useTracking para el dataLayer). */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback muy improbable (navegadores sin randomUUID en contexto inseguro).
  return `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// --- Identidad anónima (localStorage, estable para siempre) -------------------------------

/** Id anónimo del dispositivo. Se genera una vez y NUNCA rota (tampoco al loguear). */
export function getAnonymousId(): string {
  let id = safeGet(localStorage, EVENT_ANON_ID_KEY);
  if (!id) {
    id = newEventId();
    safeSet(localStorage, EVENT_ANON_ID_KEY, id);
  }
  return id;
}

// --- Sesión (sessionStorage, expira por inactividad) --------------------------------------

/**
 * Devuelve el id de sesión vigente, creándolo si no existe o si expiró por inactividad.
 * `isNew` = true cuando esta llamada arrancó una sesión nueva. Refresca la marca de actividad.
 */
export function touchSession(): { id: string; isNew: boolean } {
  const now = Date.now();
  const existingId = safeGet(sessionStorage, EVENT_SESSION_ID_KEY);
  const lastActive = Number(safeGet(sessionStorage, EVENT_SESSION_ACTIVE_KEY) ?? 0);

  let id = existingId ?? "";
  let isNew = false;
  if (!existingId || now - lastActive > SESSION_TIMEOUT_MS) {
    id = newEventId();
    isNew = true;
    safeSet(sessionStorage, EVENT_SESSION_ID_KEY, id);
  }
  safeSet(sessionStorage, EVENT_SESSION_ACTIVE_KEY, String(now));
  return { id, isNew };
}

// --- FirstVisit / ReturnVisit -------------------------------------------------------------

/**
 * Clasifica esta carga como primera visita del dispositivo, regreso de un conocido, o nada.
 * `sessionIsNew` viene de {@link touchSession}. Marca el flag de primera visita al detectarla.
 */
export function resolveVisitKind(sessionIsNew: boolean): VisitKind {
  const hadFirstVisit = safeGet(localStorage, EVENT_FIRST_VISIT_KEY);
  if (!hadFirstVisit) {
    safeSet(localStorage, EVENT_FIRST_VISIT_KEY, String(Date.now()));
    return "first";
  }
  // Visitante ya conocido: solo cuenta como "regreso" al abrir una sesión nueva.
  return sessionIsNew ? "return" : null;
}

// --- Atribución de marketing (utm_*, fbclid, gclid) ---------------------------------------

/**
 * Captura utm_* , fbclid y gclid de la URL actual y los fusiona con lo ya guardado en la sesión
 * (el landing manda: no se pisan valores existentes con vacíos). Devuelve la atribución vigente.
 */
export function captureAttribution(): Attribution {
  const stored = readAttribution();
  if (typeof window === "undefined") return stored;

  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value && stored[key] !== value) {
      stored[key] = value;
      changed = true;
    }
  }
  for (const key of ["fbclid", "gclid"] as const) {
    const value = params.get(key);
    if (value && stored[key] !== value) {
      stored[key] = value;
      changed = true;
    }
  }
  if (changed) safeSet(sessionStorage, EVENT_ATTRIBUTION_KEY, JSON.stringify(stored));
  return stored;
}

function readAttribution(): Attribution {
  const raw = safeGet(sessionStorage, EVENT_ATTRIBUTION_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}

// --- Señales de Facebook (_fbp / _fbc) ----------------------------------------------------

/**
 * Lee las cookies `_fbp`/`_fbc` que planta el Pixel. Si no hay `_fbc` pero conocemos un `fbclid`,
 * lo construye con el formato oficial `fb.1.<timestamp>.<fbclid>` para el matching de CAPI.
 */
export function getFbCookies(fbclid?: string): { fbp?: string; fbc?: string } {
  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return { fbp: fbp || undefined, fbc: fbc || undefined };
}

// --- Ensamblado del contexto por evento ---------------------------------------------------

/**
 * Campos comunes que se adjuntan a TODO evento: identidad anónima, sesión, señales FB y utm_*.
 * No incluye `event_id`/`event_name`/urls: los pone quien emite el evento.
 */
export function getEventContext(): Partial<TrackedEvent> {
  const attribution = captureAttribution();
  const { id: sessionId } = touchSession();
  const { fbp, fbc } = getFbCookies(attribution.fbclid);

  return {
    anonymous_id: getAnonymousId(),
    session_id: sessionId,
    fbp,
    fbc,
    fbclid: attribution.fbclid,
    gclid: attribution.gclid,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_term: attribution.utm_term,
    utm_content: attribution.utm_content,
  };
}

// --- Helpers ------------------------------------------------------------------------------

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function safeGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: Storage, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    /* modo incógnito / almacenamiento lleno: el tracking degrada silenciosamente. */
  }
}
