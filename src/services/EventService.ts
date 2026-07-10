// src/services/EventService.ts
import ApiService from "./ApiService";

/**
 * Evento first-party tal como lo envía el cliente a `POST /api/events`.
 * Espeja `TrackedEventIn` del backend (servises/events/schemas.py). El servidor pone/deriva
 * `user_id`, `client_ip_address`, `client_user_agent` y `channel`: NO los mandamos desde aquí.
 */
export interface TrackedEvent {
  event_id: string;
  event_name: string;
  event_source_url?: string;
  referrer_url?: string;

  // Identidad first-party (la logueada la resuelve el servidor desde el token)
  anonymous_id?: string;
  session_id?: string;

  // Señales de Facebook (matching)
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  gclid?: string;

  // Atribución de marketing
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Datos de comercio (se rellenan a partir de F3)
  value?: number;
  currency?: string;
  content_id?: number;
  content_ids?: unknown[];
  content_type?: string;
  is_free?: boolean;
  content_name?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  search_string?: string;
  custom_data?: Record<string, unknown>;
}

/**
 * Click autocapturado tal como lo envía el cliente a `POST /api/nav-events`.
 * Espeja `NavEventIn` del backend (servises/events/navigation_schemas.py). Endpoint y tabla
 * separados de `TrackedEvent`: nunca llega al pixel. El servidor pone/deriva `user_id`/`device`.
 */
export interface NavEvent {
  event_id: string;
  event_type: "click";
  occurred_at?: string;

  page_url: string;
  page_path: string;
  route_name?: string;

  target_tag: string;
  target_selector: string;
  target_text?: string;
  track_name?: string;
  href?: string;
  content_id?: number;
  is_interactive: boolean;

  anonymous_id?: string;
  session_id?: string;
}

/**
 * Cola de envío genérica: agrupa items por debounce, los manda por POST y sabe drenarse por
 * `sendBeacon`/`fetch keepalive` al ocultar la pestaña. Cada instancia apunta a su propio
 * endpoint — así `api/events` (pixel) y `api/nav-events` (navegación) nunca comparten cola.
 */
class FlushQueue<T> {
  private queue: T[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly endpoint: string,
    private readonly flushDelayMs: number,
    /** Tope de items por POST. `Infinity` = un solo POST con todo lo acumulado (comportamiento
     *  original de `api/events`: nunca cambiar esto para esa cola). */
    private readonly maxBatch: number = Infinity
  ) {}

  /** Encola uno o varios items y programa el envío agrupado. */
  public send(items: T | T[]): void {
    if (typeof window === "undefined") return;
    const batch = Array.isArray(items) ? items : [items];
    if (batch.length === 0) return;
    this.queue.push(...batch);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flushViaPost();
    }, this.flushDelayMs);
  }

  /** Vacía la cola por POST, en tandas de `maxBatch`. Fire-and-forget: un fallo no rompe la UI. */
  private async flushViaPost(): Promise<void> {
    let batch = this.drain();
    while (batch.length > 0) {
      try {
        await ApiService.post(this.endpoint, { events: batch });
      } catch (error) {
        // No reencolar para evitar bucles; el tracking es best-effort.
        console.error(`EventService: fallo enviando a ${this.endpoint}`, error);
        return;
      }
      batch = this.drain();
    }
  }

  /** Drena la cola de forma síncrona con transporte apto para descarga de página. */
  public flushViaBeacon(): void {
    let batch = this.drain();
    while (batch.length > 0) {
      this.sendBeaconBatch(batch);
      batch = this.drain();
    }
  }

  private sendBeaconBatch(batch: T[]): void {
    const url = `${ApiService.baseUrl}/${this.endpoint}`;
    // `text/plain` es un content-type "safelisted" → sin preflight CORS (imposible en un beacon).
    // El backend parsea el body como JSON aunque el content-type no sea application/json.
    const body = JSON.stringify({ events: batch });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(url, blob)) return;
    }

    // Fallback: fetch keepalive sobrevive a la descarga de la pestaña.
    try {
      void fetch(url, {
        method: "POST",
        keepalive: true,
        credentials: "include",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
      });
    } catch (error) {
      console.error(`EventService: fallo en flush por beacon/keepalive (${this.endpoint})`, error);
    }
  }

  private drain(): T[] {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queue.length === 0) return [];
    const limit = Number.isFinite(this.maxBatch) ? this.maxBatch : this.queue.length;
    return this.queue.splice(0, limit);
  }
}

const EVENTS_ENDPOINT = "api/events";
/** Debounce de agrupación: junta los eventos disparados en la misma interacción en un solo POST. */
const EVENTS_FLUSH_DELAY_MS = 800;

const NAV_EVENTS_ENDPOINT = "api/nav-events";
/** Debounce mayor: los clicks vienen en ráfagas, conviene juntar más antes de mandar. */
const NAV_EVENTS_FLUSH_DELAY_MS = 2000;
/** Tope por POST (el schema acepta hasta 200; 50 evita payloads gigantes en sesiones muy activas). */
const NAV_EVENTS_MAX_BATCH = 50;

/**
 * Envío de eventos con dos garantías:
 *  - En sesión activa se manda por `ApiService.post` (lleva el header Authorization → identidad logueada).
 *  - Al ocultar/cerrar la pestaña se drenan las colas con `navigator.sendBeacon` (fallback `fetch keepalive`),
 *    que no bloquea el cierre. El beacon no lleva Authorization: esos eventos quedan atados por `anonymous_id`.
 *
 * Dos colas independientes: `api/events` (pixel, sin cambios de comportamiento) y `api/nav-events`
 * (navegación, ver doc/eventos/plan-mapa-navegacion.md). Nunca se mezclan.
 */
class EventService {
  private eventsQueue = new FlushQueue<TrackedEvent>(EVENTS_ENDPOINT, EVENTS_FLUSH_DELAY_MS);
  private navQueue = new FlushQueue<NavEvent>(
    NAV_EVENTS_ENDPOINT,
    NAV_EVENTS_FLUSH_DELAY_MS,
    NAV_EVENTS_MAX_BATCH
  );
  private listenersBound = false;

  constructor() {
    this.bindUnloadListeners();
  }

  /** Encola uno o varios eventos del pixel y programa el envío agrupado. */
  public sendEvents(events: TrackedEvent | TrackedEvent[]): void {
    this.eventsQueue.send(events);
  }

  /** Encola uno o varios clicks de navegación y programa el envío agrupado. */
  public sendNavEvents(events: NavEvent | NavEvent[]): void {
    this.navQueue.send(events);
  }

  private bindUnloadListeners(): void {
    if (this.listenersBound || typeof document === "undefined") return;
    this.listenersBound = true;

    // `visibilitychange → hidden` es el evento fiable en móviles (pagehide no siempre dispara).
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.eventsQueue.flushViaBeacon();
        this.navQueue.flushViaBeacon();
      }
    });
    // `pagehide` cubre el cierre/navegación fuera del SPA en escritorio.
    window.addEventListener("pagehide", () => {
      this.eventsQueue.flushViaBeacon();
      this.navQueue.flushViaBeacon();
    });
  }
}

export default new EventService();
