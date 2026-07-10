/**
 * Pruebas de la lógica pura de contexto de eventos (F2.2/F2.3/F2.4): identidad anónima estable,
 * expiración de sesión por inactividad, clasificación FirstVisit/ReturnVisit, construcción de `fbc`
 * y fusión de atribución. Stubbea los globales del navegador (entorno node, sin jsdom).
 *
 * Comando: npm run test:unit src/composables/__tests__/useEventContext.spec.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, String(v));
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  clear(): void {
    this.map.clear();
  }
}

function setLocation(search: string, href = "https://x.test/", origin = "https://x.test") {
  (globalThis as any).window.location = { search, href, origin };
}

let ctx: typeof import("../useEventContext");

beforeEach(async () => {
  (globalThis as any).localStorage = new MemoryStorage();
  (globalThis as any).sessionStorage = new MemoryStorage();
  (globalThis as any).document = { cookie: "" };
  (globalThis as any).window = { location: { search: "", href: "https://x.test/", origin: "https://x.test" } };
  vi.resetModules();
  ctx = await import("../useEventContext");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("anonymous_id", () => {
  it("se genera una vez y es estable entre llamadas", () => {
    const a = ctx.getAnonymousId();
    const b = ctx.getAnonymousId();
    expect(a).toBe(b);
    expect(a).toBeTruthy();
  });
});

describe("touchSession", () => {
  it("primera llamada isNew=true, siguiente isNew=false con mismo id", () => {
    const first = ctx.touchSession();
    const second = ctx.touchSession();
    expect(first.isNew).toBe(true);
    expect(second.isNew).toBe(false);
    expect(second.id).toBe(first.id);
  });

  it("tras >30 min de inactividad arranca una sesión nueva", () => {
    const t0 = 1_000_000_000_000;
    const now = vi.spyOn(Date, "now").mockReturnValue(t0);
    const first = ctx.touchSession();
    now.mockReturnValue(t0 + 31 * 60 * 1000); // +31 min
    const later = ctx.touchSession();
    expect(later.isNew).toBe(true);
    expect(later.id).not.toBe(first.id);
  });
});

describe("resolveVisitKind", () => {
  it("primera visita del dispositivo => 'first' y marca el flag", () => {
    expect(ctx.resolveVisitKind(true)).toBe("first");
    // ya marcado: en una sesión nueva de conocido => 'return'
    expect(ctx.resolveVisitKind(true)).toBe("return");
    // conocido pero sesión no nueva => null
    expect(ctx.resolveVisitKind(false)).toBe(null);
  });
});

describe("captureAttribution", () => {
  it("captura utm/fbclid de la URL y no los pisa con vacíos en navegación interna", () => {
    setLocation("?utm_source=fb&utm_medium=cpc&fbclid=ABC");
    const a = ctx.captureAttribution();
    expect(a.utm_source).toBe("fb");
    expect(a.utm_medium).toBe("cpc");
    expect(a.fbclid).toBe("ABC");

    setLocation(""); // navegación interna sin params
    const b = ctx.captureAttribution();
    expect(b.utm_source).toBe("fb");
    expect(b.fbclid).toBe("ABC");
  });
});

describe("getFbCookies", () => {
  it("lee _fbp y construye _fbc desde fbclid cuando la cookie no existe", () => {
    (globalThis as any).document.cookie = "_fbp=fb.1.123.456; foo=bar";
    const r = ctx.getFbCookies("CLICKID");
    expect(r.fbp).toBe("fb.1.123.456");
    expect(r.fbc).toMatch(/^fb\.1\.\d+\.CLICKID$/);
  });

  it("prefiere la cookie _fbc real si existe", () => {
    (globalThis as any).document.cookie = "_fbc=fb.1.999.REAL";
    const r = ctx.getFbCookies("CLICKID");
    expect(r.fbc).toBe("fb.1.999.REAL");
  });
});

describe("getEventContext", () => {
  it("ensambla identidad + sesión + señales fb + utm", () => {
    setLocation("?utm_campaign=verano&fbclid=Z");
    (globalThis as any).document.cookie = "_fbp=fb.1.1.1";
    const c = ctx.getEventContext();
    expect(c.anonymous_id).toBeTruthy();
    expect(c.session_id).toBeTruthy();
    expect(c.utm_campaign).toBe("verano");
    expect(c.fbclid).toBe("Z");
    expect(c.fbp).toBe("fb.1.1.1");
    expect(c.fbc).toMatch(/\.Z$/);
  });
});
