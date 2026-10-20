import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import type { IPaginatedCourses } from "../../../services/CategorieService";
import type { ICategoryCourseDetail } from "../../../types/Categorie";
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../../../services/ApiService", () => ({ default: { get: mocks.get } }));
import { useLazyStudyCatalog } from "./useLazyStudyCatalog";
import { TECHNOLOGY_ROUTES } from "../routes/technologyRoutes";
const python = TECHNOLOGY_ROUTES.find((route) => route.id === "python")!;
const react = TECHNOLOGY_ROUTES.find((route) => route.id === "react")!;
const courses: ICategoryCourseDetail[] = [
  { id: 1, name_del_curso: "Python básico" },
  { id: 2, name_del_curso: "Django y Python" },
  { id: 3, name_del_curso: "Flask desde cero" },
  { id: 4, name_del_curso: "FastAPI avanzado" },
  { id: 5, name_del_curso: "React básico" },
];
function page(url: string, items = courses) {
  const params = new URL(url, "https://example.test").searchParams;
  const q = (params.get("q") ?? "").toLowerCase();
  const matching = items.filter((course) => course.name_del_curso?.toLowerCase().includes(q));
  const offset = Number(params.get("offset"));
  const limit = Number(params.get("limit"));
  return { data: { items: matching.slice(offset, offset + limit), total: matching.length, offset, limit } };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
let app: ReturnType<typeof createApp> | undefined;
let host: HTMLElement;
let catalog: ReturnType<typeof useLazyStudyCatalog>;
function mount(categoryId = 200) {
  host = document.createElement("div");
  app = createApp({ setup() { catalog = useLazyStudyCatalog(categoryId); return () => h("div"); } });
  app.mount(host);
}
const tick = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await nextTick(); };
beforeEach(() => { vi.clearAllMocks(); mocks.get.mockImplementation(async (url: string) => page(url)); });
afterEach(() => { app?.unmount(); app = undefined; host?.remove(); });

describe("consultas del catálogo bajo demanda", () => {
  it("comparte el límite de tres peticiones entre buscador y rutas e ignora búsquedas obsoletas en cola", async () => {
    let active = 0; let maximum = 0; let current = true;
    const releases: (() => void)[] = [];
    mocks.get.mockImplementation(async (url: string) => {
      active++; maximum = Math.max(maximum, active);
      await new Promise<void>((resolve) => releases.push(resolve));
      active--; return page(url);
    });
    mount(100200300);
    const searches = [100, 200, 300].map((id) => catalog.searchCourses(id, "Python", 0, () => current));
    const stale = catalog.searchCourses(200, "obsoleta", 0, () => current).catch(() => null);
    const route = catalog.loadRoute({ ...python, sourceCategoryId: 200 });
    await tick(); expect(active).toBe(3);
    current = false;
    for (let i = 0; i < 6; i++) { releases.splice(0).forEach((release) => release()); await tick(); }
    await Promise.all([...searches, stale, route]);
    expect(maximum).toBe(3);
    expect(mocks.get.mock.calls.some(([url]) => String(url).includes("obsoleta"))).toBe(false);
    expect(catalog.stateFor("python").loaded).toBe(true);
  });
  it("consulta una ruta en su pilar de origen y el catálogo general en el producto completo", async () => {
    mount(100200300);
    await catalog.loadRoute({ ...python, sourceCategoryId: 200 });
    expect(catalog.stateFor("python").items).toHaveLength(4);
    expect(mocks.get.mock.calls.every(([url]) => String(url).startsWith("api/category/200/courses?"))).toBe(true);
    mocks.get.mockClear();
    await catalog.loadCatalog();
    expect(mocks.get).toHaveBeenCalledTimes(1);
    expect(String(mocks.get.mock.calls[0]![0])).toContain("api/category/100200300/courses?");
  });
  it("no solicita datos al montar y reutiliza las rutas completas sin duplicados", async () => {
    mount(); expect(mocks.get).not.toHaveBeenCalled();
    await catalog.loadRoute(python);
    expect(catalog.stateFor("python").items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    const calls = mocks.get.mock.calls.length;
    await catalog.loadRoute(python);
    expect(mocks.get).toHaveBeenCalledTimes(calls);
  });

  it("limita a tres las peticiones simultáneas y comparte cargas repetidas", async () => {
    let active = 0; let maximum = 0;
    const releases: (() => void)[] = [];
    mocks.get.mockImplementation(async (url: string) => {
      active++; maximum = Math.max(maximum, active);
      await new Promise<void>((resolve) => releases.push(resolve));
      active--; return page(url);
    });
    mount(); const task = catalog.loadRoute(python);
    expect(catalog.loadRoute(python)).toBe(task);
    await tick(); expect(active).toBe(3);
    for (let round = 0; round < 5; round++) { releases.splice(0).forEach((resolve) => resolve()); await tick(); }
    await task;
    expect(maximum).toBe(3);
    expect(catalog.stateFor("python").items).toHaveLength(4);
    expect(mocks.get).toHaveBeenCalledTimes(4);
  });

  it("carga las páginas de cada consulta sin exponer una ruta parcial si una falla", async () => {
    const hundred = Array.from({ length: 100 }, (_, id) => ({ id, name_del_curso: `Python ${id}` }));
    mocks.get.mockImplementation(async (url: string) => {
      const params = new URL(url, "https://example.test").searchParams;
      if (params.get("q") !== "python") return page(url, []);
      if (params.get("offset") === "100") throw new Error("Página incompleta");
      return { data: { items: hundred, total: 101, offset: 0, limit: 100 } };
    });
    mount(); await catalog.loadRoute(python);
    expect(catalog.stateFor("python")).toMatchObject({ loaded: false, error: true, items: [] });
    mocks.get.mockImplementation(async (url: string) => page(url));
    await catalog.loadRoute(python, true);
    expect(catalog.stateFor("python")).toMatchObject({ loaded: true, error: false });
    expect(catalog.stateFor("python").items).toHaveLength(4);
  });

  it("mantiene las respuestas de rutas distintas en sus propias cachés", async () => {
    const old = deferred<{ data: IPaginatedCourses }>();
    mocks.get.mockImplementation(async (url: string) => new URL(url, "https://example.test").searchParams.get("q") === "python" ? old.promise : page(url));
    mount(); const first = catalog.loadRoute(python); await tick();
    await catalog.loadRoute(react);
    expect(catalog.stateFor("react").items.map((course) => course.id)).toEqual([5]);
    old.resolve(page("courses?limit=100&offset=0&q=python")); await first;
    expect(catalog.stateFor("react").items.map((course) => course.id)).toEqual([5]);
    expect(catalog.stateFor("python").items).toHaveLength(4);
  });

  it("ignora una búsqueda antigua que responde después de la actual", async () => {
    const old = deferred<{ data: IPaginatedCourses }>();
    mocks.get.mockImplementation(async (url: string) => new URL(url, "https://example.test").searchParams.get("q") === "Python" ? old.promise : page(url));
    mount(); catalog.catalogSearch.value = "Python"; await nextTick();
    const first = catalog.loadCatalog();
    catalog.catalogSearch.value = "React"; await nextTick(); await catalog.loadCatalog();
    expect(catalog.catalogItems.value.map((item) => item.id)).toEqual([5]);
    old.resolve(page("courses?limit=10&offset=0&q=python")); await first;
    expect(catalog.catalogItems.value.map((item) => item.id)).toEqual([5]);
    expect(catalog.catalogError.value).toBe(false);
  });

  it("descarta una búsqueda que responde durante la espera del nuevo término", async () => {
    const old = deferred<{ data: IPaginatedCourses }>();
    mocks.get.mockReturnValue(old.promise);
    mount(); const first = catalog.loadCatalog();
    catalog.catalogSearch.value = "React"; await nextTick();
    old.resolve(page("courses?limit=10&offset=0")); await first;
    expect(catalog.catalogItems.value).toEqual([]);
    expect(catalog.catalogLoading.value).toBe(true);
  });

  it("ignora resultados al desmontar y no lanza peticiones que estaban en cola", async () => {
    const responses: ReturnType<typeof deferred<{ data: IPaginatedCourses }>>[] = [];
    mocks.get.mockImplementation(() => { const pending = deferred<{ data: IPaginatedCourses }>(); responses.push(pending); return pending.promise; });
    mount(); const task = catalog.loadRoute(python); await tick();
    expect(responses).toHaveLength(3);
    app!.unmount(); app = undefined;
    responses.forEach((response) => response.resolve({ data: { items: [], total: 0, offset: 0, limit: 100 } }));
    await task;
    expect(mocks.get).toHaveBeenCalledTimes(3);
    expect(catalog.stateFor("python").loaded).toBe(false);
  });
});
