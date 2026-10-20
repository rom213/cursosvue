import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick, ref } from "vue";
import type { IPaginatedCourses } from "../../../services/CategorieService";
import { useStudyRouteSearch } from "./useStudyRouteSearch";
import type { SelectedStudyCourse } from "./useStudyRouteSearch";
import { technologyCampaign } from "../config/technologyCampaign";
import { personalizedCampaigns } from "../config/personalizedCampaigns";
import type { StudyCampaignConfig } from "../config/studyCampaignConfig";

let app: ReturnType<typeof createApp> | undefined;
let search: ReturnType<typeof useStudyRouteSearch>;
const request = vi.fn();
const selected = ref<SelectedStudyCourse | null>(null);
function mount(config: StudyCampaignConfig = technologyCampaign) {
  app = createApp({ setup() { search = useStudyRouteSearch(config, request, () => selected.value); return () => h("div"); } });
  app.mount(document.createElement("div"));
}
const empty = (offset = 0): IPaginatedCourses => ({ items: [], total: 0, limit: 10, offset });
function deferred() {
  let resolve!: (value: IPaginatedCourses) => void;
  const promise = new Promise<IPaginatedCourses>((yes) => { resolve = yes; });
  return { promise, resolve };
}
beforeEach(() => { selected.value = null; vi.useFakeTimers(); request.mockReset(); request.mockImplementation(async (_id, _q, offset) => empty(offset)); });
afterEach(() => { app?.unmount(); app = undefined; vi.useRealTimers(); });

describe("buscador de rutas y cursos", () => {
  it("conserva las 60 rutas y prioriza solo las del pilar de origen del curso seleccionado", async () => {
    request.mockImplementation(async (id: number) => id === 200
      ? { ...empty(), total: 2, items: [{ id: 1, name_del_curso: "Python y React avanzado", author: "Otro" }, { id: 2, name_del_curso: "Python y React avanzado", author: "Academia" }] }
      : empty());
    mount(personalizedCampaigns["100200300"]);
    selected.value = { title: "Python y React avanzado", author: "Academia" };
    search.query.value = selected.value.title;
    expect(search.matchedRoutes.value).toHaveLength(60);
    await vi.advanceTimersByTimeAsync(300);
    expect(search.matchedRoutes.value).toHaveLength(60);
    expect(search.matchedRoutes.value.filter((route) => route.selectedCourseMatch).map((route) => route.id)).toEqual(["python", "react"]);
    expect(search.matchedRoutes.value.slice(0, 2).map((route) => route.id)).toEqual(["python", "react"]);
    expect(search.resultGroups.value[1]!.results[0]!.course.id).toBe(2);
    const originalRest = personalizedCampaigns["100200300"].routes.filter((route) => !["python", "react"].includes(route.id)).map((route) => route.id);
    expect(search.matchedRoutes.value.slice(2).map((route) => route.id)).toEqual(originalRest);
  });
  it("conserva las tarjetas y el temario de un curso sin ruta, y descarta la selección anterior al escribir rápido", async () => {
    const old = deferred();
    request.mockReturnValueOnce(old.promise).mockResolvedValue({ ...empty(), total: 1, items: [{ id: 9, name_del_curso: "Origami avanzado" }] });
    mount(); selected.value = { title: "Python básico", author: "" }; search.query.value = selected.value.title;
    await vi.advanceTimersByTimeAsync(300);
    selected.value = { title: "Origami avanzado", author: "" }; search.query.value = selected.value.title;
    await vi.advanceTimersByTimeAsync(300);
    old.resolve({ ...empty(), total: 1, items: [{ id: 1, name_del_curso: "Python básico" }] }); await nextTick();
    expect(search.matchedRoutes.value).toHaveLength(41);
    expect(search.matchedRoutes.value.some((route) => route.selectedCourseMatch)).toBe(false);
    expect(search.resultGroups.value[0]!.results[0]!.course.id).toBe(9);
    expect(search.resultGroups.value[0]!.results[0]!.routes).toEqual([]);
  });
  it("no carga cursos al entrar ni con un carácter; filtra títulos, tildes y tecnologías inmediatamente", async () => {
    mount(personalizedCampaigns["100200300"]);
    expect(search.matchedRoutes.value).toHaveLength(60);
    search.query.value = "p";
    await vi.advanceTimersByTimeAsync(400);
    expect(request).not.toHaveBeenCalled();
    search.query.value = "  FOTOGRAFÍA  ";
    expect(search.matchedRoutes.value[0]?.id).toBe("300-fotografia");
    expect(request).not.toHaveBeenCalled();
    search.query.value = "django";
    expect(search.matchedRoutes.value.some((r) => r.id === "python")).toBe(true);
    await vi.advanceTimersByTimeAsync(299); expect(request).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(request).toHaveBeenCalledTimes(3);
    expect(request.mock.calls.map(([id]) => id)).toEqual([100, 200, 300]);
  });
  it("busca únicamente en el pilar actual y reutiliza los resultados de una consulta", async () => {
    mount(); search.query.value = "python";
    await vi.advanceTimersByTimeAsync(300);
    expect(request).toHaveBeenCalledWith(200, "python", 0, expect.any(Function));
    search.clearSearch();
    expect(search.matchedRoutes.value).toHaveLength(41);
    search.query.value = "python"; await vi.advanceTimersByTimeAsync(300);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("recomienda rutas del origen correcto y permite cursos sin una ruta", async () => {
    request.mockImplementation(async (id: number) => ({ ...empty(), total: 2, items: [
      { id: id + 1, name_del_curso: "Misterio de Python" }, { id: id + 2, name_del_curso: "Origami para principiantes" },
    ] }));
    mount(personalizedCampaigns["100200300"]);
    search.query.value = "misterio"; await vi.advanceTimersByTimeAsync(300);
    const python = search.matchedRoutes.value.find((r) => r.id === "python");
    expect(python).toMatchObject({ rank: 0, matchingCourses: 1 });
    expect(search.resultGroups.value[0]!.results[0]!.routes).toEqual([]);
    expect(search.resultGroups.value[1]!.results[0]!.routes.map((r) => r.id)).toContain("python");
    expect(search.resultGroups.value[1]!.results[1]!.routes).toEqual([]);
  });
  it("prioriza coincidencias de título y admite varias rutas por curso", async () => {
    request.mockResolvedValue({ ...empty(), total: 1, items: [{ id: 1, name_del_curso: "Python y React" }] });
    mount(); search.query.value = "python"; await vi.advanceTimersByTimeAsync(300);
    expect(search.matchedRoutes.value[0]?.id).toBe("python");
    expect(search.resultGroups.value[0]!.results[0]!.routes.map((r) => r.id)).toEqual(["python", "react"]);
  });
  it("pagina cada pilar por separado y calcula recomendaciones solo con los cursos mostrados", async () => {
    request.mockImplementation(async (id: number, _q: string, offset: number) => ({
      items: Array.from({ length: offset ? 2 : 10 }, (_, i) => ({ id: id * 100 + offset + i, name_del_curso: offset ? "React avanzado" : "Python inicial" })),
      total: 12, offset, limit: 10,
    }));
    mount(personalizedCampaigns["100200300"]);
    search.query.value = "tutorial"; await vi.advanceTimersByTimeAsync(300);
    expect(search.matchedRoutes.value.find((r) => r.id === "python")?.matchingCourses).toBe(10);
    await search.loadGroup(200, 2);
    expect(search.resultGroups.value.map((g) => g.page)).toEqual([1, 2, 1]);
    expect(search.matchedRoutes.value.some((r) => r.id === "python")).toBe(false);
    expect(search.matchedRoutes.value.find((r) => r.id === "react")?.matchingCourses).toBe(2);
    expect(request).toHaveBeenLastCalledWith(200, "tutorial", 10, expect.any(Function));
    await search.loadGroup(200, 1); expect(request).toHaveBeenCalledTimes(4);
  });
  it("descarta respuestas anteriores antes de terminar el debounce y al limpiar", async () => {
    const old = deferred(); request.mockReturnValueOnce(old.promise);
    mount(); search.query.value = "python"; await vi.advanceTimersByTimeAsync(300);
    const isCurrent = request.mock.calls[0]![3];
    search.query.value = "react"; expect(isCurrent()).toBe(false);
    old.resolve({ ...empty(), total: 1, items: [{ id: 1, name_del_curso: "Python básico" }] });
    await nextTick(); expect(search.resultGroups.value[0]!.results).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    search.clearSearch(); await vi.advanceTimersByTimeAsync(500);
    expect(search.resultGroups.value[0]!.results).toEqual([]);
    expect(search.canSearchCourses.value).toBe(false);
  });
  it("mantiene otros pilares ante un error y permite reintentar sin perderlos", async () => {
    request.mockImplementation(async (id: number) => { if (id === 200) throw Error("Sin conexión"); return { ...empty(), total: 1, items: [{ id, name_del_curso: "Diseño básico" }] }; });
    mount(personalizedCampaigns["100200300"]); search.query.value = "diseño"; await vi.advanceTimersByTimeAsync(300);
    expect(search.resultGroups.value.map((g) => g.error)).toEqual([false, true, false]);
    expect(search.resultGroups.value[2]!.results).toHaveLength(1);
    request.mockResolvedValue(empty()); await search.loadGroup(200, 1, true);
    expect(search.resultGroups.value[1]!.error).toBe(false);
    expect(search.resultGroups.value[2]!.results).toHaveLength(1);
  });
  it("rechaza páginas inválidas e ignora respuestas después de desmontar", async () => {
    request.mockResolvedValue({ ...empty(), total: 4, items: [] });
    mount(); search.query.value = "python"; await vi.advanceTimersByTimeAsync(300);
    expect(search.resultGroups.value[0]!.error).toBe(true);
    const pending = deferred(); request.mockReturnValue(pending.promise);
    const retry = search.loadGroup(200, 1, true);
    const isCurrent = request.mock.calls[request.mock.calls.length - 1]![3];
    app!.unmount(); app = undefined; expect(isCurrent()).toBe(false);
    pending.resolve({ ...empty(), total: 1, items: [{ id: 1, name_del_curso: "Python" }] }); await retry;
    expect(search.resultGroups.value[0]!.results).toEqual([]);
  });
});
