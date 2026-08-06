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
  // fbclid/gclid se leen CRUDOS (rawQueryParam): URLSearchParams percent-decodifica y convierte
  // `+`→espacio, lo que altera el fbclid y hace que Meta reporte "fbclid modificado en fbc".
  for (const key of ["fbclid", "gclid"] as const) {
    const value = rawQueryParam(key);
    if (value && stored[key] !== value) {
      stored[key] = value;
      changed = true;
    }
  }
  if (changed) safeSet(sessionStorage, EVENT_ATTRIBUTION_KEY, JSON.stringify(stored));
  // Fija la cookie `_fbc` una sola vez al aterrizar con el fbclid EXACTO, para que todos los
  // eventos (y el Pixel/Stape) reutilicen el mismo fbc con un timestamp estable.
  if (stored.fbclid) ensureFbcCookie(stored.fbclid);
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

/** Duración de la cookie `_fbc` (90 días, igual que el default del Pixel de Meta). */
const FBC_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

/**
 * Fija la cookie `_fbc` (formato oficial `fb.1.<timestamp>.<fbclid>`) UNA sola vez al aterrizar,
 * usando el fbclid exacto. Si el Pixel/Stape ya la puso, no la toca. Así el fbc es idéntico y
 * estable entre todos los eventos (navegador y servidor), evitando el timestamp cambiante por
 * evento y el "fbclid modificado" que reporta Meta.
 */
function ensureFbcCookie(rawFbclid: string): void {
  if (typeof document === "undefined") return;
  if (readCookie("_fbc")) return; // el Pixel/Stape ya la fijó → no pisar
  const fbc = `fb.1.${Date.now()}.${rawFbclid}`;
  document.cookie = `_fbc=${fbc}; path=/; max-age=${FBC_COOKIE_MAX_AGE}; SameSite=Lax`;
}

// --- Ensamblado del contexto por evento ---------------------------------------------------

/**
 * Campos comunes que se adjuntan a TODO evento: identidad anónima, sesión, señales FB y utm_*.
 * No incluye `event_id`/`event_name`/urls: los pone quien emite el evento.
 */
export function getEventContext(): Partial<TrackedEvent> {
  // Conserva señales preexistentes aunque el navegador/reemplazo de document.cookie
  // falle al escribir `_fbc`; el tracking nunca debe perder un `_fbp` válido.
  const existingFbCookies = getFbCookies();
  const attribution = captureAttribution();
  const { id: sessionId } = touchSession();
  const refreshedFbCookies = getFbCookies(attribution.fbclid);
  const fbp = refreshedFbCookies.fbp ?? existingFbCookies.fbp;
  const fbc = refreshedFbCookies.fbc ?? existingFbCookies.fbc;

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

/**
 * Extrae un parámetro de la query string SIN decodificar (a diferencia de URLSearchParams, que
 * percent-decodifica y convierte `+`→espacio). Necesario para `fbclid`, cuyo valor debe llegar a
 * Meta exactamente como venía en la URL. Devuelve la subcadena cruda o null.
 */
function rawQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.search.match(new RegExp("[?&]" + name + "=([^&#]*)"));
  return match ? match[1] : null;
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
