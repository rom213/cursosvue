import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import Search from "./header.search.component.vue";
import { PILARES, TODA_LA_TIENDA_ID } from "../../courses/courseFilterData";

const mocks = vi.hoisted(() => ({ search: vi.fn(), select: vi.fn(), track: vi.fn() }));
vi.mock("../../services/CategorieService", () => ({ default: { searchCategories: mocks.search } }));
vi.mock("../../composables/useTracking", () => ({ useTracking: () => ({ trackSearch: mocks.track, trackSelectItem: mocks.select }) }));

let app: ReturnType<typeof createApp>;
let host: HTMLElement;
async function mount(id = 201, path = "/") {
  mocks.search.mockResolvedValue([{ id, titulo: "React avanzado", autor: "Academia" }]);
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/courses/:id/:courseSlug?", name: "courses-description", component: { template: "<div />" } },
  ] });
  await router.push(path); await router.isReady();
  host = document.createElement("div"); document.body.appendChild(host);
  app = createApp(Search).use(router); app.mount(host);
  return router;
}
async function type(value: string) {
  const input = host.querySelector("input")!;
  input.value = value; input.dispatchEvent(new Event("input", { bubbles: true }));
  await nextTick(); await vi.advanceTimersByTimeAsync(350); await nextTick();
}
beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { app?.unmount(); host?.remove(); vi.useRealTimers(); });

describe("destinos del buscador superior", () => {
  it("pasa de Desarrollo a Idiomas usando el bloque del resultado, aunque el ID sea el pilar", async () => {
    const router = await mount(100, "/courses/201?q_course=React");
    mocks.search.mockResolvedValue([{ id: "100", titulo: "Storyland - Amigos Ingleses - Cat-Idiomas", autor: "Amigos Ingleses", pack_nombre: "106 | 🇺🇸 Idiomas y Comunicación" }]);
    await type("ingles");
    host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.currentRoute.value.path).toBe("/courses/106");
    expect(router.currentRoute.value.query.q_course).toBe("Storyland - Amigos Ingleses - Cat-Idiomas");
    expect(router.currentRoute.value.query.q_search).toBe("ingles");
  });
  it("no hereda el bloque actual cuando el resultado carece de ID", async () => {
    const router = await mount(201, "/courses/201");
    mocks.search.mockResolvedValue([{ id: null, titulo: "Inglés sin destino" }]);
    await type("ingles"); host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.currentRoute.value.fullPath).toBe("/courses/201");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("No pudimos identificar");
    expect(router.currentRoute.value.query.q_course).toBeUndefined();
  });
  it.each([...PILARES.flatMap((p) => [p.pilarId, ...p.themes.map((t) => t.id)]), TODA_LA_TIENDA_ID])(
    "abre la página personalizada %i sin slug y conserva el curso elegido", async (id) => {
      const router = await mount(id); await type("react");
      host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click();
      await vi.advanceTimersByTimeAsync(0); await nextTick();
      expect(router.currentRoute.value.path).toBe(`/courses/${id}`);
      expect(router.currentRoute.value.query).toMatchObject({ q_search: "react", q_course: "React avanzado", q_author: "Academia" });
      expect(mocks.select).toHaveBeenCalledTimes(1);
      expect(host.querySelector(".search-dropdown")).toBeNull();
    },
  );
  it("conserva el slug para productos sin campaña", async () => {
    const router = await mount(200300); await type("react");
    host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.currentRoute.value.path).toBe("/courses/200300/react-avanzado");
  });
  it("ignora respuestas pendientes después de seleccionar un curso o borrar la búsqueda", async () => {
    await mount(); await type("react");
    let resolve!: (value: unknown[]) => void;
    mocks.search.mockReturnValue(new Promise((done) => { resolve = done; }));
    host.querySelector("input")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click();
    resolve([{ id: 200, titulo: "Resultado anterior" }]);
    await vi.advanceTimersByTimeAsync(0);
    expect(host.querySelector(".search-dropdown")).toBeNull();
    mocks.search.mockReturnValue(new Promise((done) => { resolve = done; }));
    await type("python");
    const input = host.querySelector("input")!;
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    resolve([{ id: 200, titulo: "Python anterior" }]);
    await vi.advanceTimersByTimeAsync(0);
    expect(host.querySelector(".search-dropdown")).toBeNull();
  });
});
