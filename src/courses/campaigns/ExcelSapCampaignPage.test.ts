import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { ICategory, ICategoryCourseDetail } from "../../types/Categorie";

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(),
  get: vi.fn(),
  setCategory: vi.fn(),
  beginCheckout: vi.fn(),
  toggleBuy: vi.fn(),
  activateCampaign: vi.fn(),
  completePageView: vi.fn(),
}));
vi.mock("../../services/CategorieService", () => ({
  default: { getCategoryById: mocks.getCategory },
}));
vi.mock("../../services/ApiService", () => ({ default: { get: mocks.get } }));
vi.mock("../../store/EmergentBuyStore", () => ({
  emergentBuyStore: () => ({
    emergentBuy: { emergent: false },
    setCategoryEmergent: mocks.setCategory,
    handleEmergentBuy: mocks.toggleBuy,
  }),
}));
vi.mock("../../store/AuthStore", () => ({
  authStore: () => ({ getProfile: () => null }),
}));
vi.mock("../../composables/useTracking", () => ({
  useTracking: () => ({
    trackViewItem: vi.fn(),
    trackBeginCheckout: mocks.beginCheckout,
    trackCustom: vi.fn(),
    trackWhatsAppIntent: vi.fn(),
    trackViewContentCourse: vi.fn(),
  }),
}));
vi.mock("../../composables/useCampaignReturn", () => ({
  useCampaignReturn: () => ({ activateCampaign: mocks.activateCampaign }),
}));
vi.mock("../../analytics/pageViewCoordinator", () => ({
  pageViewCoordinator: {
    activeTokenFor: () => 1,
    complete: mocks.completePageView,
  },
}));
vi.mock("../emergent.buy.component.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../components/footer/footer.component.vue", () => ({
  default: { template: "<footer />" },
}));
import Page from "./ExcelSapCampaignPage.vue";

const fixtureCourses: ICategoryCourseDetail[] = [
  {
    id: 1,
    name_del_curso: "Excel básico",
    author: "José",
    info_tecnica: { url: "https://drive.google.com/course-paid" },
  },
  { id: 2, name_del_curso: "Excel intermedio", author: "Otra academia" },
  {
    id: 3,
    name_del_curso: "Power BI avanzado",
    author: "Academia",
    es_gratis: true,
    info_tecnica: { url: "https://drive.google.com/course-free" },
  },
  { id: 4, name_del_curso: "Notion para la productividad" },
  { id: 5, name_del_curso: "Excel completo" },
  { id: 6, name_del_curso: "Tablas dinámicas con Excel" },
];
const fixtureCategory = {
  id: 103,
  titulo: "Business Intelligence, Datos y Oficina",
  precio: 40000,
  precio_desc: 0,
  cantidad_cursos: 6,
  user_bought: false,
} as ICategory;
let app: ReturnType<typeof createApp> | undefined;
let host: HTMLDivElement;
let originalTitle: string;

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}
function buttons(selector: string) {
  const root = selector === ".course-row"
    ? host.querySelector(".route-dialog[open]") ?? host.querySelector(".full-catalog") ?? host
    : host;
  return Array.from(root.querySelectorAll<HTMLButtonElement>(selector));
}
async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/courses/103/tematica/ex",
        name: "excel-campaign",
        component: { template: "<div />" },
      },
      {
        path: "/courses/:id",
        name: "courses-description",
        component: { template: "<div />" },
      },
      {
        path: "/mycourses",
        name: "mycourses",
        component: { template: "<div />" },
      },
    ],
  });
  await router.push("/courses/103/tematica/ex?utm_source=test");
  await router.isReady();
  host = document.createElement("div");
  document.body.appendChild(host);
  app = createApp(Page).use(router);
  app.mount(host);
  await flush();
  return router;
}
async function selectRoute(title: string) {
  buttons(".route-card")
    .find((button) => button.querySelector("h3")?.textContent === `Ruta ${title}`)!
    .click();
  await flush();
}
async function openFirstCourse() {
  buttons(".course-row")[0]!.click();
  await flush();
}

beforeEach(() => {
  vi.clearAllMocks();
  originalTitle = document.title;
  document.body.style.overflow = "";
  mocks.getCategory.mockResolvedValue({ ...fixtureCategory });
  mocks.get.mockImplementation(async (url: string) => apiResponse(url));
  vi.spyOn(window, "open").mockImplementation(() => null);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(() => {
  app?.unmount();
  app = undefined;
  host?.remove();
  vi.restoreAllMocks();
  document.title = originalTitle;
});


function apiResponse(url: string, allCourses = fixtureCourses) {
  const params = new URL(url, "https://example.test").searchParams;
  if (url.includes("/facets?")) {
    const authors = [...new Set(allCourses.map((course) => course.author).filter(Boolean))];
    return { data: { items: params.get("by") === "autor" ? authors.map((autor) => ({ autor, count: 1 })) : [], total: params.get("by") === "autor" ? authors.length : 0 } };
  }
  if (url.includes("/courses?")) {
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = normalize(params.get("q") ?? "");
    const author = params.get("autor");
    const courses = allCourses.filter((course) => normalize(course.name_del_curso ?? "").includes(query) && (!author || course.author === author));
    const offset = Number(params.get("offset"));
    const limit = Number(params.get("limit"));
    return { data: { items: courses.slice(offset, offset + limit), total: courses.length, offset, limit } };
  }
  return { data: { contenido: "<p>Descripción del curso seleccionado</p>" } };
}
async function loadCatalog() {
  Array.from(host.querySelectorAll<HTMLButtonElement>(".full-catalog button"))
    .find((button) => button.textContent?.trim() === "Ver catálogo completo")!.click();
  await flush();
}
function closeRoute() {
  host.querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!.click();
}
function closeCourse() {
  host.querySelector<HTMLButtonElement>(".course-dialog .dialog-close")!.click();
}

describe("carga de cursos bajo demanda: Excel", () => {
  it("muestra todas las tarjetas sin solicitar cursos ni filtros al entrar", async () => {
    await mountPage();
    expect(mocks.getCategory).toHaveBeenCalledWith(103);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(buttons(".route-card")).toHaveLength(14);
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain("Explora los cursos");
    expect(host.querySelector(".route-card-bottom")?.textContent).not.toContain("0 cursos");
    expect(buttons(".course-row")).toHaveLength(0);
    expect(host.querySelector(".full-catalog")?.textContent).toContain("Ver catálogo completo");
  });

  it("carga solo la ruta elegida, deduplica sus cursos y conserva niveles y búsqueda por autor", async () => {
    await mountPage();
    await selectRoute("Excel");
    expect(host.querySelector(".route-dialog[open]")).not.toBeNull();
    expect(buttons(".course-row")).toHaveLength(4);
    expect(host.querySelector("#ruta-titulo")?.textContent?.trim()).toBe("Ruta de Ruta Excel");
    expect(document.activeElement).toBe(host.querySelector("#ruta-titulo"));
    const calls = mocks.get.mock.calls.map(([url]) => String(url));
    expect(calls.filter((url) => url.includes("/courses?"))).not.toHaveLength(0);
    expect(calls.filter((url) => url.includes("/courses?")).every((url) => new URL(url, "https://example.test").searchParams.has("q") || new URL(url, "https://example.test").searchParams.has("subcategoria"))).toBe(true);
    expect(Array.from(host.querySelectorAll(".level-heading h3")).map((el) => el.textContent)).toEqual(["Inicial 1", "Intermedio 2", "Cursos completos 1"]);
    const input = host.querySelector<HTMLInputElement>("#route-course-search")!;
    input.value = "jose"; input.dispatchEvent(new Event("input", { bubbles: true })); await flush();
    expect(buttons(".course-row")).toHaveLength(1);
    expect(buttons(".course-row")[0]?.textContent).toContain("Excel básico");
    const requests = mocks.get.mock.calls.length;
    closeRoute(); await flush(); await selectRoute("Excel");
    expect(mocks.get).toHaveBeenCalledTimes(requests);
    expect(buttons(".course-row")).toHaveLength(4);
  });

  it("mantiene las tarjetas y permite reintentar una ruta sin exponer resultados parciales", async () => {
    mocks.get.mockRejectedValue(new Error("Sin conexión"));
    await mountPage(); await selectRoute("Excel");
    expect(host.querySelector(".route-error")?.textContent).toContain("No pudimos cargar esta ruta");
    expect(buttons(".course-row")).toHaveLength(0);
    expect(buttons(".route-card")).toHaveLength(14);
    mocks.get.mockImplementation(async (url: string) => apiResponse(url));
    host.querySelector<HTMLButtonElement>(".route-error button")!.click(); await flush();
    expect(host.querySelector(".route-error")).toBeNull();
    expect(buttons(".course-row")).toHaveLength(4);
  });

  it("confirma una ruta vacía después de abrirla", async () => {
    mocks.get.mockImplementation(async (url: string) => apiResponse(url, []));
    await mountPage(); await selectRoute("Excel");
    expect(host.querySelector(".empty-panel")?.textContent).toContain("No hay cursos disponibles en esta ruta");
    expect(host.querySelector(".route-error")).toBeNull();
    expect(buttons(".route-card")[0]?.textContent).toContain("0 cursos disponibles");
  });

  it("carga diez cursos por página y reutiliza la página anterior", async () => {
    const courses = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name_del_curso: `Excel curso ${i + 1}`, author: "Academia" }));
    mocks.get.mockImplementation(async (url: string) => apiResponse(url, courses));
    await mountPage(); await loadCatalog();
    expect(buttons(".course-row")).toHaveLength(10);
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining("limit=10&offset=0"));
    buttons(".catalog-pagination button")[1]!.click(); await flush();
    expect(host.querySelector(".catalog-pagination")?.textContent).toContain("Página 2 de 3");
    expect(buttons(".course-row")[0]?.textContent).toContain("curso 11");
    buttons(".catalog-pagination button")[1]!.click(); await flush();
    expect(buttons(".course-row")).toHaveLength(3);
    const requests = mocks.get.mock.calls.length;
    buttons(".catalog-pagination button")[0]!.click(); await flush();
    expect(buttons(".course-row")).toHaveLength(10);
    expect(mocks.get).toHaveBeenCalledTimes(requests);
  });

  it("busca por título y filtra por autor con los parámetros existentes", async () => {
    await mountPage(); await loadCatalog();
    const selector = host.querySelector<HTMLSelectElement>("#catalog-author")!;
    selector.dispatchEvent(new Event("focus")); await flush();
    expect(selector.textContent).toContain("José");
    selector.value = "José"; selector.dispatchEvent(new Event("change", { bubbles: true }));
    const input = host.querySelector<HTMLInputElement>("#catalog-course-search")!;
    input.value = "Excel"; input.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(buttons(".course-row")).toHaveLength(1));
    expect(buttons(".course-row")[0]?.textContent).toContain("Excel básico");
    const query = String(mocks.get.mock.calls[mocks.get.mock.calls.length - 1]?.[0]);
    expect(new URL(query, "https://example.test").searchParams.get("autor")).toBe("José");
    expect(new URL(query, "https://example.test").searchParams.get("q")).toBe("Excel");
  });

  it("un fallo del catálogo no bloquea las rutas y permite reintentar", async () => {
    mocks.get.mockRejectedValue(new Error("Sin conexión"));
    await mountPage(); await loadCatalog();
    expect(host.querySelector(".full-catalog .error-panel")).not.toBeNull();
    expect(buttons(".route-card")).toHaveLength(14);
    mocks.get.mockImplementation(async (url: string) => apiResponse(url));
    host.querySelector<HTMLButtonElement>(".full-catalog .error-panel button")!.click(); await flush();
    expect(buttons(".course-row")).toHaveLength(6);
  });

  it("compra el producto completo con el precio del backend", async () => {
    await mountPage();
    host.querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!.click();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 103, precio: 40000, precio_desc: 40000 }));
    expect(mocks.beginCheckout).toHaveBeenCalledWith([expect.objectContaining({ id: 103 })], 40000);
    expect(mocks.toggleBuy).toHaveBeenCalledTimes(1);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("permite abrir Drive al comprador desde una ruta sin iniciar otra compra", async () => {
    mocks.getCategory.mockResolvedValue({ ...fixtureCategory, user_bought: true });
    await mountPage(); await selectRoute("Excel"); await openFirstCourse();
    expect(host.querySelector(".dialog-footer button")?.textContent).toContain("Abrir curso en Google Drive");
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/course-paid", "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();

  });

  it("ofrece la compra de la categoría al abrir un curso pagado sin acceso", async () => {
    await mountPage(); await selectRoute("Excel"); await openFirstCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(window.open).not.toHaveBeenCalled();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 103 }));
    expect(host.querySelector<HTMLDialogElement>(".route-dialog")?.open).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("conserva el acceso gratuito y valida el correo", async () => {
    await mountPage(); await selectRoute("Power BI"); await openFirstCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    const input = host.querySelector<HTMLInputElement>("#study-free-email")!;
    input.value = "correo-invalido"; input.dispatchEvent(new Event("input", { bubbles: true }));
    host.querySelector<HTMLFormElement>(".free-dialog form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await flush();
    expect(host.querySelector("#free-email-error")?.textContent).toContain("correo válido");
    input.value = "alumno@example.com"; input.dispatchEvent(new Event("input", { bubbles: true }));
    host.querySelector<HTMLFormElement>(".free-dialog form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await flush();
    expect(window.open).toHaveBeenCalledWith("https://drive.google.com/course-free", "_blank", "noopener,noreferrer");
  });

  it("carga el temario bajo demanda y lo reutiliza al volver a abrirlo", async () => {
    await mountPage(); await selectRoute("Excel");
    expect(mocks.get.mock.calls.some(([url]) => String(url).includes("/contenido"))).toBe(false);
    await openFirstCourse();
    expect(host.querySelector(".course-content")?.textContent).toContain("Descripción");
    closeCourse(); await flush(); await openFirstCourse();
    expect(mocks.get.mock.calls.filter(([url]) => String(url).includes("/contenido"))).toHaveLength(1);
  });

  it("ignora el temario anterior si responde después del curso actual", async () => {
    let resolveOld!: (value: { data: { contenido: string } }) => void;
    const old = new Promise<{ data: { contenido: string } }>((resolve) => { resolveOld = resolve; });
    mocks.get.mockImplementation(async (url: string) => url.includes("courses/1/contenido") ? old : apiResponse(url));
    await mountPage(); await selectRoute("Excel"); await openFirstCourse();
    closeCourse(); await flush(); buttons(".course-row")[1]!.click(); await flush();
    resolveOld({ data: { contenido: "<p>Respuesta antigua</p>" } }); await flush();
    expect(host.querySelector(".course-content")?.textContent).not.toContain("Respuesta antigua");
    expect(host.querySelector(".course-content")?.textContent).toContain("Descripción");
  });

  it("restaura foco y scroll al cerrar los modales con Escape", async () => {
    await mountPage();
    const trigger = buttons(".route-card").find((button) => button.querySelector("h3")?.textContent === "Ruta Excel")!;
    await selectRoute("Excel"); const courseTrigger = buttons(".course-row")[0]!;
    await openFirstCourse();
    host.querySelector<HTMLDialogElement>(".course-dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })); await flush();
    expect(document.activeElement).toBe(courseTrigger);
    expect(document.body.style.overflow).toBe("hidden");
    host.querySelector<HTMLDialogElement>(".route-dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })); await flush();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("conserva las rutas cuando falla la carga del precio", async () => {
    mocks.getCategory.mockResolvedValue(null); await mountPage();
    expect(host.querySelector(".inline-error")?.textContent).toContain("compra está temporalmente deshabilitada");
    expect(host.querySelector<HTMLButtonElement>('[data-track="campaign-final-web"]')?.disabled).toBe(true);
    await selectRoute("Excel"); expect(buttons(".course-row")).toHaveLength(4);
  });

  it("mantiene contexto, metadatos y seguimiento sin cargar el catálogo", async () => {
    await mountPage();
    expect(mocks.activateCampaign).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 103 }));
    expect(mocks.get).not.toHaveBeenCalled();
    expect(document.querySelector('meta[property="og:image"]')).not.toBeNull();
    app!.unmount(); app = undefined;
    expect(document.title).toBe(originalTitle);
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
  });
});
