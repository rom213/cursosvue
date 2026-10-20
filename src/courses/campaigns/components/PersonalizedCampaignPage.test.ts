import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, h, KeepAlive, nextTick } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import type { ICategory, ICategoryCourseDetail } from "../../../types/Categorie";

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(),
  searchCategories: vi.fn(),
  get: vi.fn(),
  setCategory: vi.fn(),
  beginCheckout: vi.fn(),
  toggleBuy: vi.fn(),
  activateCampaign: vi.fn(),
  completePageView: vi.fn(),
  viewItem: vi.fn(),
  custom: vi.fn(),
}));
vi.mock("../../../services/CategorieService", () => ({
  default: { getCategoryById: mocks.getCategory, searchCategories: mocks.searchCategories },
}));
vi.mock("../../../services/ApiService", () => ({ default: { get: mocks.get } }));
vi.mock("../../../store/EmergentBuyStore", () => ({
  emergentBuyStore: () => ({
    emergentBuy: { emergent: false },
    setCategoryEmergent: mocks.setCategory,
    handleEmergentBuy: mocks.toggleBuy,
  }),
}));
vi.mock("../../../store/AuthStore", () => ({
  authStore: () => ({ getProfile: () => null }),
}));
vi.mock("../../../composables/useTracking", () => ({
  useTracking: () => ({
    trackViewItem: mocks.viewItem,
    trackBeginCheckout: mocks.beginCheckout,
    trackCustom: mocks.custom,
    trackWhatsAppIntent: vi.fn(),
    trackViewContentCourse: vi.fn(),
    trackSearch: vi.fn(),
    trackSelectItem: vi.fn(),
  }),
}));
vi.mock("../../../composables/useCampaignReturn", () => ({
  useCampaignReturn: () => ({ activateCampaign: mocks.activateCampaign }),
}));
vi.mock("../../../analytics/pageViewCoordinator", () => ({
  pageViewCoordinator: {
    activeTokenFor: () => 1,
    complete: mocks.completePageView,
  },
}));
vi.mock("../../emergent.buy.component.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../../components/footer/footer.component.vue", () => ({
  default: { template: "<footer />" },
}));
import Page from "./StudyCampaignPage.vue";
import { personalizedCampaigns } from "../config/personalizedCampaigns";
import type { StudyCampaignConfig } from "../config/studyCampaignConfig";
import { technologyCampaign } from "../config/technologyCampaign";
import CourseInfoPage from "../../courseInfoPage/course.info.page.vue";
import HeaderSearch from "../../../components/header/header.search.component.vue";

let app: ReturnType<typeof createApp> | undefined;
let host: HTMLElement;
const flush = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await nextTick(); };
const fixtures: ICategoryCourseDetail[] = [
  { id: 3, name_del_curso: "Python básico", info_tecnica: { url: "https://drive.google.com/python-paid" } },
  { id: 1, name_del_curso: "Emprendimiento y diseño básico", author: "Academia", info_tecnica: { url: "https://drive.google.com/course-paid" } },
  { id: 2, name_del_curso: "Emprendimiento y diseño avanzado", author: "Otro autor" },
];
async function mount(config: StudyCampaignConfig, paid = false, query: Record<string, string> = {}) {
  const category = { id: config.categoryId, titulo: config.title, precio: 50000, cantidad_cursos: config.catalogTotal, user_bought: paid } as ICategory;
  mocks.getCategory.mockResolvedValue(category);
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/courses/:id", name: "courses-description", component: { template: "<div />" } }] });
  await router.push({ path: `/courses/${config.categoryId}`, query }); await router.isReady();
  host = document.createElement("div"); document.body.appendChild(host);
  app = createApp(Page, { config }).use(router); app.mount(host); await flush();
  return router;
}
async function openRoute() { host.querySelector<HTMLButtonElement>(".route-card")!.click(); await flush(); }
const courseRows = () => host.querySelectorAll<HTMLButtonElement>(".route-dialog .course-row");
beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockImplementation(async (url: string) => {
    if (url.endsWith("/contenido")) return { data: { contenido: "<p>Temario del curso</p>" } };
    const params = new URL(url, "https://example.test").searchParams;
    const q = (params.get("q") ?? "").toLowerCase();
    const items = fixtures.filter((c) => c.name_del_curso!.toLowerCase().includes(q));
    return { data: { items, total: items.length, limit: Number(params.get("limit")), offset: Number(params.get("offset")) } };
  });
  vi.spyOn(window, "open").mockImplementation(() => null);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => { app?.unmount(); host?.remove(); vi.restoreAllMocks(); });

describe.each(Object.values(personalizedCampaigns))("campaña $categoryId", (config) => {
  it("muestra su presentación, cantidades, créditos y FAQ sin cargar cursos", async () => {
    await mount(config);
    expect(host.querySelector("h1")?.textContent).toContain(config.headline);
    expect(host.querySelector(".pack-strip h2")?.textContent).toBe(config.title);
    expect(host.querySelectorAll(".route-card")).toHaveLength(config.routes.length);
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain(String(config.counts[config.routes[0]!.id]));
    expect(host.querySelector<HTMLAnchorElement>(".image-credits")?.getAttribute("href")).toBe(config.creditsUrl);
    expect(host.querySelector(".faq-list")?.textContent).toContain(config.title);
    expect(host.textContent).not.toContain("${config.");
    expect(host.textContent).not.toContain("Tecnología, Código e Ingeniería");
    expect(mocks.getCategory).toHaveBeenCalledWith(config.categoryId);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.viewItem).toHaveBeenCalledTimes(1);
  });
  it("carga y almacena solo la ruta seleccionada, actualiza el conteo y conserva el foco", async () => {
    await mount(config); await openRoute();
    expect(courseRows()).toHaveLength(2);
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain("2 cursos disponibles");
    expect(document.activeElement).toBe(host.querySelector("#ruta-titulo"));
    expect(mocks.get.mock.calls.every(([url]) => String(url).startsWith(`api/category/${config.routes[0]!.sourceCategoryId ?? config.categoryId}/courses?`))).toBe(true);
    const calls = mocks.get.mock.calls.length;
    host.querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!.click(); await flush();
    await openRoute(); expect(mocks.get).toHaveBeenCalledTimes(calls);
  });
  it("compra siempre el producto completo y WhatsApp menciona el mismo ID", async () => {
    await mount(config);
    const link = host.querySelector<HTMLAnchorElement>('a[href*="wa.me"]')!;
    expect(decodeURIComponent(link.href)).toContain(String(config.categoryId));
    host.querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!.click();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: config.categoryId, precio: 50000 }));
    expect(mocks.beginCheckout).toHaveBeenCalledWith([expect.objectContaining({ id: config.categoryId })], 50000);
    expect(mocks.toggleBuy).toHaveBeenCalledTimes(1);
  });
  it("muestra la presentación de comprador y abre Drive sin iniciar otra compra", async () => {
    await mount(config, true);
    expect(host.querySelector("h1")?.textContent).toContain(config.paidHeadline);
    expect(host.querySelector(".pack-strip")?.textContent).toContain("TU ACCESO ESTÁ ACTIVO");
    expect(host.querySelector(".price")).toBeNull();
    expect(host.querySelector(".final-section")).toBeNull();
    expect(host.querySelector('a[href*="wa.me"]')).toBeNull();
    host.querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!.click();
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
    await openRoute(); courseRows()[0]!.click(); await flush();
    expect(host.querySelector(".course-content")?.textContent).toContain("Temario del curso");
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/course-paid", "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });
  it("conserva las cantidades al fallar una ruta y permite reintentar", async () => {
    await mount(config); mocks.get.mockRejectedValue(new Error("Sin conexión")); await openRoute();
    expect(host.querySelector(".route-dialog .error-panel")).not.toBeNull();
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain(String(config.counts[config.routes[0]!.id]));
    mocks.get.mockResolvedValue({ data: { items: [], total: 0, limit: 100, offset: 0 } });
    host.querySelector<HTMLButtonElement>(".route-dialog .error-panel button")!.click(); await flush();
    expect(host.querySelector(".route-dialog .error-panel")).toBeNull();
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain("0 cursos disponibles");
  });
});


describe("todas las rutas en Toda la Tienda", () => {
  it("muestra las 60 rutas sin cargarlas y conserva las imágenes y conteos de origen", async () => {
    const config = personalizedCampaigns["100200300"];
    await mount(config);
    const cards = [...host.querySelectorAll(".route-card")];
    expect(cards).toHaveLength(60);
    cards.forEach((card, index) => {
      const route = config.routes[index]!;
      expect(card.querySelector("h3")?.textContent).toBe(route.title);
      expect(card.querySelector("img")?.getAttribute("src")).toBe(route.image);
      expect(card.querySelector(".route-card-bottom")?.textContent).toContain(String(config.counts[route.id]));
    });
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it("carga Python del pilar 200 pero la compra sigue siendo de Toda la Tienda", async () => {
    await mount(personalizedCampaigns["100200300"]);
    [...host.querySelectorAll<HTMLButtonElement>(".route-card")].find((card) => card.querySelector("h3")?.textContent === "Ruta Python")!.click();
    await flush();
    expect(courseRows()).toHaveLength(1);
    expect(mocks.get.mock.calls.every(([url]) => String(url).startsWith("api/category/200/courses?"))).toBe(true);
    courseRows()[0]!.click(); await flush();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 100200300 }));
    expect(mocks.beginCheckout).toHaveBeenCalledWith([expect.objectContaining({ id: 100200300 })], 50000);
  });
});


async function searchRoutes(text: string) {
  const input = host.querySelector<HTMLInputElement>("#study-route-search")!;
  input.value = text; input.dispatchEvent(new Event("input", { bubbles: true })); await flush();
}
async function waitForSearch() {
  await vi.waitFor(() => expect(host.querySelectorAll('.finder-group [aria-busy="true"]')).toHaveLength(0));
}
describe("navegación del buscador entre bloques reales", () => {
  it("cambia de Desarrollo a Inglés con KeepAlive y no consulta Inglés en el bloque anterior", async () => {
    const englishTitle = "Storyland - Amigos Ingleses - Cat-Idiomas";
    mocks.getCategory.mockImplementation(async (id: number) => ({ id, titulo: `Bloque ${id}`, precio: 10000, cantidad_cursos: 10, user_bought: false }));
    mocks.searchCategories.mockResolvedValue([{ id: "100", titulo: englishTitle, autor: "Amigos Ingleses", pack_nombre: "106 | 🇺🇸 Idiomas y Comunicación" }]);
    mocks.get.mockImplementation(async (url: string) => {
      if (url.endsWith("/contenido")) return { data: { contenido: "<p>Temario de inglés</p>" } };
      const params = new URL(url, "https://example.test").searchParams;
      const pool = url.includes("/106/")
        ? [{ id: 2224, name_del_curso: englishTitle, author: "CAT-IDIOMAS" }, { id: 2225, name_del_curso: "Inglés básico", author: "Academia" }]
        : [{ id: 3780, name_del_curso: "React avanzado", author: "Academia" }];
      const items = pool.filter((course) => course.name_del_curso.toLowerCase().includes((params.get("q") ?? "").toLowerCase()));
      return { data: { items, total: items.length, limit: Number(params.get("limit")), offset: Number(params.get("offset")) } };
    });
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: "/courses/:id/:courseSlug?", name: "courses-description", component: CourseInfoPage },
    ] });
    await router.push("/courses/201?q_course=React%20avanzado"); await router.isReady();
    host = document.createElement("div"); document.body.appendChild(host);
    app = createApp({ render: () => h("div", [h(HeaderSearch), h(RouterView, {}, {
      default: ({ Component }: { Component: object }) => h(KeepAlive, { include: ["CourseInfoPage"] }, () => h(Component)),
    })]) }).use(router);
    app.mount(host);
    await vi.waitFor(() => expect(host.querySelector('.study-page[data-campaign="201"] .route-card')).not.toBeNull());
    await vi.waitFor(() => expect(host.querySelector('.route-match-label')?.textContent).toBe("Contiene el curso que buscaste"));
    const before = mocks.get.mock.calls.length;
    const input = host.querySelector<HTMLInputElement>(".search-input")!;
    input.value = "ingles"; input.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(host.querySelector(".search-dropdown button")).not.toBeNull());
    host.querySelector<HTMLButtonElement>(".search-dropdown button")!.click(); await flush();
    await vi.waitFor(() => expect(host.querySelector('.study-page[data-campaign="106"] .route-match-label')?.textContent).toBe("Contiene el curso que buscaste"));
    expect(router.currentRoute.value.path).toBe("/courses/106");
    expect(host.querySelector('.study-page[data-campaign="201"]')).toBeNull();
    expect(host.querySelector(".route-card h3")?.textContent).toBe("Ruta Inglés");
    expect(host.querySelectorAll(".route-card")).toHaveLength(3);
    expect(mocks.get.mock.calls.slice(before).every(([url]) => String(url).startsWith("api/category/106/courses?"))).toBe(true);
    await openRoute();
    expect(courseRows()[0]?.textContent).toContain(englishTitle);
    expect(courseRows()[0]?.classList.contains("course-row-highlighted")).toBe(true);
    expect(courseRows().length).toBeGreaterThan(1);
    host.querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!.click(); await flush();
    router.back(); await flush();
    await vi.waitFor(() => expect(host.querySelector('.study-page[data-campaign="201"] .route-card')).not.toBeNull());
    router.forward(); await flush();
    await vi.waitFor(() => expect(host.querySelector('.study-page[data-campaign="106"] .route-match-label')?.textContent).toBe("Contiene el curso que buscaste"));
  });
});
describe("curso seleccionado desde el buscador superior", () => {
  const title = "React y TypeScript avanzado";
  beforeEach(() => {
    const courses = [
      { id: 80, name_del_curso: "Python básico" },
      ...Array.from({ length: 8 }, (_, i) => ({ id: i + 100, name_del_curso: `React inicial ${i}` })),
      { id: 90, name_del_curso: title, author: "Academia", info_tecnica: { url: "https://drive.google.com/react" } },
    ];
    mocks.get.mockImplementation(async (url: string) => {
      if (url.endsWith("/contenido")) return { data: { contenido: "<p>Temario seleccionado</p>" } };
      const params = new URL(url, "https://example.test").searchParams;
      const items = courses.filter((c) => c.name_del_curso.toLowerCase().includes((params.get("q") ?? "").toLowerCase()));
      return { data: { items, total: items.length, limit: Number(params.get("limit")), offset: Number(params.get("offset")) } };
    });
  });
  it("sube todas las rutas del curso sin ocultar las otras y coloca el curso antes de los niveles", async () => {
    await mount(technologyCampaign, false, { q_course: title, q_author: "Academia" });
    await vi.waitFor(() => expect(host.querySelector(".route-match-label")?.textContent).toBe("Contiene el curso que buscaste"));
    const cards = [...host.querySelectorAll<HTMLButtonElement>(".route-card")];
    expect(cards).toHaveLength(41);
    expect(cards[0]!.querySelector("h3")?.textContent).toBe("Ruta JavaScript y TypeScript");
    expect(cards[1]!.querySelector("h3")?.textContent).toBe("Ruta React y Next.js");
    cards[1]!.click(); await flush();
    expect(courseRows()[0]!.textContent).toContain(title);
    expect(courseRows()[0]!.classList.contains("course-row-highlighted")).toBe(true);
    expect(host.querySelector(".level-group h3")?.textContent).toContain("Curso que buscaste");
    expect([...courseRows()].filter((row) => row.textContent?.includes(title))).toHaveLength(1);
    expect(courseRows().length).toBeGreaterThan(1);
    expect(host.querySelector<HTMLInputElement>("#route-course-search")!.value).toBe("");
    courseRows()[0]!.click(); await flush();
    expect(host.querySelector(".course-content")?.textContent).toContain("Temario seleccionado");
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 200 }));
  });
  it("actualiza otro curso del mismo producto y restaura la selección al volver atrás", async () => {
    const router = await mount(technologyCampaign, false, { q_course: title });
    await vi.waitFor(() => expect(host.querySelector(".route-match-label")?.textContent).toContain("Contiene el curso"));
    await router.push({ path: "/courses/200", query: { q_course: "Python básico", _t: "2" } }); await flush();
    await vi.waitFor(() => expect(host.querySelector(".route-card h3")?.textContent).toBe("Ruta Python"));
    expect(host.querySelectorAll(".route-card")).toHaveLength(41);
    await openRoute();
    expect(courseRows()[0]?.textContent).toContain("Python básico");
    router.back(); await flush();
    await vi.waitFor(() => expect(host.querySelector(".route-card h3")?.textContent).toBe("Ruta JavaScript y TypeScript"));
    expect(host.querySelector(".route-dialog")?.hasAttribute("open")).toBe(false);
    host.querySelector<HTMLButtonElement>(".route-finder button")!.click(); await flush();
    expect(host.querySelectorAll(".route-card")).toHaveLength(41);
    expect(host.querySelector(".route-card h3")?.textContent).toBe("Ruta Python");
    expect(router.currentRoute.value.query.q_course).toBeUndefined();
  });
  it("mantiene todas las rutas ante un error y permite reintentar sin perder la selección", async () => {
    const implementation = mocks.get.getMockImplementation()!;
    mocks.get.mockRejectedValueOnce(new Error("sin conexión"));
    await mount(technologyCampaign, true, { q_course: title });
    await vi.waitFor(() => expect(host.querySelector(".finder-group .error-panel")).not.toBeNull());
    expect(host.querySelectorAll(".route-card")).toHaveLength(41);
    mocks.get.mockImplementation(implementation);
    host.querySelector<HTMLButtonElement>(".finder-group .error-panel button")!.click(); await flush();
    expect(host.querySelector(".route-card h3")?.textContent).toBe("Ruta JavaScript y TypeScript");
    host.querySelector<HTMLButtonElement>(".finder-course-list .course-row")!.click(); await flush();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/react", "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });
});
describe.each([...Object.values(personalizedCampaigns), technologyCampaign])("buscador en $categoryId", (config) => {
  it("filtra rutas, consulta cursos en sus pilares y restaura todas las tarjetas al limpiar", async () => {
    await mount(config);
    expect(mocks.get).not.toHaveBeenCalled();
    await searchRoutes("python");
    expect(host.querySelector<HTMLInputElement>("#catalog-course-search")!.value).toBe("");
    await waitForSearch();
    const expectedIds = config.categoryId === 100200300 ? [100, 200, 300] : [config.categoryId];
    expect(mocks.get.mock.calls.map(([url]) => Number(String(url).match(/category\/(\d+)/)?.[1]))).toEqual(expectedIds);
    expect(host.querySelectorAll(".finder-course-list .course-row")).toHaveLength(expectedIds.length);
    expect(host.querySelectorAll(".route-card").length).toBeLessThan(config.routes.length);
    [...host.querySelectorAll<HTMLButtonElement>(".route-finder button")].find((button) => button.textContent?.trim() === "Limpiar búsqueda")!.click(); await flush();
    expect(host.querySelectorAll(".route-card")).toHaveLength(config.routes.length);
    expect(host.querySelector(".finder-courses")).toBeNull();
    expect(document.activeElement).toBe(host.querySelector("#study-route-search"));
  });
});

describe("acciones desde los resultados del buscador", () => {
  it("abre una ruta recomendada y conserva la compra del producto completo", async () => {
    await mount(personalizedCampaigns["100200300"]);
    await searchRoutes("python"); await waitForSearch();
    const pythonGroup = host.querySelector('[aria-labelledby="finder-pillar-200"]')!;
    const related = [...pythonGroup.querySelectorAll<HTMLButtonElement>(".finder-course-routes button")].find((button) => button.textContent?.includes("Ruta Python"))!;
    related.click(); await flush();
    expect(host.querySelector("#ruta-titulo")?.textContent).toContain("Ruta Python");
    host.querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!.click(); await flush();
    expect(document.activeElement).toBe(related);
    pythonGroup.querySelector<HTMLButtonElement>(".course-row")!.click(); await flush();
    expect(host.querySelector(".course-content")?.textContent).toContain("Temario del curso");
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 100200300 }));
    expect(mocks.beginCheckout).toHaveBeenCalledWith([expect.objectContaining({ id: 100200300 })], 50000);
  });
  it("permite al comprador abrir un curso sin ruta y sin otra compra", async () => {
    mocks.get.mockImplementation(async (url: string) => url.endsWith("/contenido")
      ? { data: { contenido: "<p>Temario sin ruta</p>" } }
      : { data: { items: [{ id: 99, name_del_curso: "Origami para principiantes", info_tecnica: { url: "https://drive.google.com/origami" } }], total: 1, limit: 10, offset: 0 } });
    await mount(personalizedCampaigns["300"], true);
    await searchRoutes("origami"); await waitForSearch();
    expect(host.querySelector(".finder-course-routes")?.textContent).toContain("Sin ruta asociada");
    host.querySelector<HTMLButtonElement>(".finder-course-list .course-row")!.click(); await flush();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/origami", "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });
  it("mantiene el acceso gratuito desde un curso encontrado y valida el correo", async () => {
    mocks.get.mockImplementation(async (url: string) => url.endsWith("/contenido")
      ? { data: { contenido: "<p>Temario gratuito</p>" } }
      : { data: { items: [{ id: 99, name_del_curso: "Origami gratis", es_gratis: true, info_tecnica: { url: "https://drive.google.com/free-origami" } }], total: 1, limit: 10, offset: 0 } });
    await mount(personalizedCampaigns["300"]);
    await searchRoutes("origami"); await waitForSearch();
    host.querySelector<HTMLButtonElement>(".finder-course-list .course-row")!.click(); await flush();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    const input = host.querySelector<HTMLInputElement>("#study-free-email")!;
    input.value = "alumno@example.com"; input.dispatchEvent(new Event("input", { bubbles: true }));
    host.querySelector<HTMLFormElement>(".free-dialog form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await flush();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/free-origami", "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });
});
