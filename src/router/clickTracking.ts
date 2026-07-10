import type { RouteLocationNormalized, Router } from "vue-router";

import EventService, { type NavEvent } from "../services/EventService";
import { getAnonymousId, newEventId, touchSession } from "../composables/useEventContext";

/**
 * Autocaptura global de clicks (F2 del mapa de navegación). Un único listener en `document`
 * registra TODO click, instrumentado o no, y lo manda a `POST /api/nav-events` — tabla y
 * endpoint separados del pixel (ver doc/eventos/plan-mapa-navegacion.md). No usa `getEventContext()`
 * completo ni `EventService.sendEvents`: cero fbp/utm/dataLayer en este payload.
 */

const INTERACTIVE_SELECTOR = "a, button, [role=button], [data-track], input, label, summary";
const TRACK_IGNORE_SELECTOR = "[data-track-ignore]";
const NO_TEXT_TAGS = new Set(["input", "textarea", "select"]);
const MAX_TEXT_LENGTH = 150;
const MAX_SELECTOR_CLASSES = 2;

/** Registro idempotente (patrón `sessionStarted` de tracking.ts): un solo listener por carga. */
let bound = false;

// --- Sampling por sesión (F5.3): interruptor apagado por defecto (rate 1.0 = captura todo) ---
const SAMPLING_KEY = "nav_sampling_in";
let sampledIn: boolean | null = null;

function samplingRate(): number {
  const raw = Number((import.meta.env as Record<string, string | undefined>).VITE_NAV_SAMPLING_RATE);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Decide UNA vez por sesión si esta sesión emite clicks (toda dentro o toda fuera, para no romper
 * recorridos). Persiste la decisión en `sessionStorage`. Con rate 1.0 nada cambia.
 */
export function isSessionSampledIn(): boolean {
  const rate = samplingRate();
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  try {
    const cached = sessionStorage.getItem(SAMPLING_KEY);
    if (cached !== null) return cached === "1";
    const decision = Math.random() < rate;
    sessionStorage.setItem(SAMPLING_KEY, decision ? "1" : "0");
    return decision;
  } catch {
    return true; // sin sessionStorage → best-effort, no muestrear
  }
}

function sampledInSession(): boolean {
  if (sampledIn === null) sampledIn = isSessionSampledIn();
  return sampledIn;
}

/** Clase "semántica" para el selector: sin dígitos (escalas de Tailwind) ni valores arbitrarios `-[`. */
function isSemanticClass(cls: string): boolean {
  if (!cls) return false;
  if (/\d/.test(cls)) return false;
  if (cls.includes("-[")) return false;
  return true;
}

/** `tag#id.clase1.clase2`, filtrando clases utilitarias ilegibles (decisión abierta #2 del plan). */
export function buildSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  let selector = tag;
  if (el.id) selector += `#${el.id}`;
  const classes = Array.from(el.classList)
    .filter(isSemanticClass)
    .slice(0, MAX_SELECTOR_CLASSES);
  if (classes.length > 0) selector += `.${classes.join(".")}`;
  return selector;
}

/** `innerText` colapsado a un espacio, truncado. `undefined` en campos de formulario (nunca `value`). */
export function extractText(el: Element): string | undefined {
  const tag = el.tagName.toLowerCase();
  if (NO_TEXT_TAGS.has(tag)) return undefined;
  const raw = (el as HTMLElement).innerText ?? el.textContent ?? "";
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return undefined;
  return collapsed.slice(0, MAX_TEXT_LENGTH);
}

/** `data-track` propio o del ancestro más cercano (nombre curado de un CTA). */
export function resolveTrackName(el: Element): string | undefined {
  return el.closest("[data-track]")?.getAttribute("data-track") ?? undefined;
}

/** `data-content-id` del ancestro más cercano, o el primer parámetro numérico de la ruta. */
export function resolveContentId(
  route: RouteLocationNormalized,
  el: Element
): number | undefined {
  const attr = el.closest("[data-content-id]")?.getAttribute("data-content-id");
  if (attr) {
    const n = Number(attr);
    if (Number.isFinite(n)) return n;
  }
  for (const value of Object.values(route.params)) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined) continue;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Target semántico más cercano; sin ancestro interactivo devuelve el elemento crudo. */
export function resolveTarget(target: Element): { el: Element; isInteractive: boolean } {
  const interactive = target.closest(INTERACTIVE_SELECTOR);
  if (interactive) return { el: interactive, isInteractive: true };
  return { el: target, isInteractive: false };
}

function hrefOf(el: Element): string | undefined {
  if (el.tagName.toLowerCase() !== "a") return undefined;
  return (el as HTMLAnchorElement).getAttribute("href") ?? undefined;
}

/** Arma el `NavEvent` a partir de la ruta actual y el elemento resuelto del click. */
export function buildNavEvent(
  route: RouteLocationNormalized,
  el: Element,
  isInteractive: boolean
): NavEvent {
  const pagePath = route.matched[route.matched.length - 1]?.path ?? route.path;
  return {
    event_id: newEventId(),
    event_type: "click",
    page_url: window.location.href,
    page_path: pagePath,
    route_name: route.name ? String(route.name) : undefined,
    target_tag: el.tagName.toLowerCase(),
    target_selector: buildSelector(el),
    target_text: extractText(el),
    track_name: resolveTrackName(el),
    href: hrefOf(el),
    content_id: resolveContentId(route, el),
    is_interactive: isInteractive,
    anonymous_id: getAnonymousId(),
    session_id: touchSession().id,
  };
}

function makeHandler(router: Router): (e: MouseEvent) => void {
  return (e: MouseEvent) => {
    if (!sampledInSession()) return; // sesión fuera del muestreo (F5.3)
    const raw = e.target;
    if (!(raw instanceof Element)) return;
    if (raw.closest(TRACK_IGNORE_SELECTOR)) return;

    const route = router.currentRoute.value;
    if (route.path.startsWith("/admin")) return;

    const { el, isInteractive } = resolveTarget(raw);
    const event = buildNavEvent(route, el, isInteractive);
    EventService.sendNavEvents(event);
  };
}

/** Registra el listener global de clicks una sola vez por carga de página. */
export function registerClickTracking(router: Router): void {
  if (bound || typeof document === "undefined") return;
  bound = true;
  document.addEventListener("click", makeHandler(router), { capture: true });
}
