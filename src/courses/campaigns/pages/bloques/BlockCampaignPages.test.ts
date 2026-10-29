import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick, type Component } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { ICategory, ICategoryCourseDetail } from "../../../../types/Categorie";

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(),
  get: vi.fn(),
  setCategory: vi.fn(),
  beginCheckout: vi.fn(),
  toggleBuy: vi.fn(),
  activateCampaign: vi.fn(),
  completePageView: vi.fn(),
  viewItem: vi.fn(),
  custom: vi.fn(),
}));
vi.mock("../../../../services/CategorieService", () => ({
  default: { getCategoryById: mocks.getCategory },
}));
vi.mock("../../../../services/ApiService", () => ({ default: { get: mocks.get } }));
vi.mock("../../../../store/EmergentBuyStore", () => ({
  emergentBuyStore: () => ({
    emergentBuy: { emergent: false },
    setCategoryEmergent: mocks.setCategory,
    handleEmergentBuy: mocks.toggleBuy,
  }),
}));
vi.mock("../../../../store/AuthStore", () => ({
  authStore: () => ({ getProfile: () => null }),
}));
vi.mock("../../../../composables/useTracking", () => ({
  useTracking: () => ({
    trackViewItem: mocks.viewItem,
    trackBeginCheckout: mocks.beginCheckout,
    trackCustom: mocks.custom,
    trackWhatsAppIntent: vi.fn(),
    trackViewContentCourse: vi.fn(),
  }),
}));
vi.mock("../../../../composables/useCampaignReturn", () => ({
  useCampaignReturn: () => ({ activateCampaign: mocks.activateCampaign }),
}));
vi.mock("../../../../analytics/pageViewCoordinator", () => ({
  pageViewCoordinator: {
    activeTokenFor: () => 1,
    complete: mocks.completePageView,
  },
}));
vi.mock("../../../emergent.buy.component.vue", () => ({
  default: { template: "<div />" },
}));
vi.mock("../../../../components/footer/footer.component.vue", () => ({
  default: { template: "<footer />" },
}));
import { createBlockCampaign } from "../../config/blockCampaigns";
import type { BlockCampaignDefinition } from "../../config/blockCampaigns";
import type { StudyCampaignConfig } from "../../config/studyCampaignConfig";

const modules = import.meta.glob<{ default: Component }>("./BlockCampaignPage*.vue", { eager: true });
const definitions = Object.values(import.meta.glob<BlockCampaignDefinition>("../../config/bloques/*.json", { eager: true, import: "default" }));
let app: ReturnType<typeof createApp> | undefined;
let host: HTMLElement;
let course: ICategoryCourseDetail;
let config: StudyCampaignConfig;
const flush = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await nextTick(); };
async function mount(definition: BlockCampaignDefinition, paid = false) {
  config = createBlockCampaign(definition);
  course = { id: 90000 + config.categoryId, name_del_curso: config.routes[0]!.title.replace(/^Ruta /, "") + " básico", es_gratis: false, author: "Academia", info_tecnica: { url: `https://drive.google.com/block-${config.categoryId}` } };
  mocks.getCategory.mockResolvedValue({ id: config.categoryId, titulo: config.title, precio: 10000 + config.categoryId, cantidad_cursos: config.catalogTotal, user_bought: paid } as ICategory);
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/courses/:id", name: "courses-description", component: { template: "<div />" } }] });
  await router.push(`/courses/${config.categoryId}`); await router.isReady();
  host = document.createElement("div"); document.body.appendChild(host);
  app = createApp(modules[`./BlockCampaignPage${config.categoryId}.vue`]!.default).use(router); app.mount(host); await flush();
}
async function openRoute() {
  host.querySelector<HTMLButtonElement>(".route-card")!.click(); await flush();
  // Rutas con objetivos (Excel): «uso personal» incluye los cursos básicos.
  host.querySelector<HTMLButtonElement>(".route-dialog .purpose-option:last-child")?.click(); await flush();
}
async function openCourse() { host.querySelector<HTMLButtonElement>(".route-dialog .course-row")!.click(); await flush(); }
beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockImplementation(async (url: string) => {
    if (url.endsWith("/contenido")) return { data: { contenido: "<p>Temario del bloque</p>" } };
    if (url.includes("/facets?")) return { data: { items: [], total: 0 } };
    const params = new URL(url, "https://example.test").searchParams;
    const q = (params.get("q") ?? "").toLowerCase();
    const items = (course.name_del_curso ?? "").toLowerCase().includes(q) ? [course] : [];
    return { data: { items, total: items.length, limit: Number(params.get("limit")), offset: Number(params.get("offset")) } };
  });
  vi.spyOn(window, "open").mockImplementation(() => null);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => { app?.unmount(); app = undefined; host?.remove(); vi.restoreAllMocks(); });

describe.each(definitions)("página propia del bloque $categoryId", (definition) => {
  it("muestra su presentación y cantidades sin descargar el catálogo", async () => {
    await mount(definition);
    expect(host.querySelector("h1")?.textContent).toContain(config.headline);
    expect(host.querySelector(".pack-strip h2")?.textContent).toBe(config.title);
    expect(host.querySelector(".pack-strip")?.textContent).toContain("el bloque completo");
    expect(host.querySelectorAll(".route-card")).toHaveLength(config.routes.length);
    expect(host.querySelector(".route-card-bottom")?.textContent).toContain(String(config.counts[config.routes[0]!.id]));
    expect(mocks.getCategory).toHaveBeenCalledWith(config.categoryId);
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.viewItem).toHaveBeenCalledTimes(1);
    expect(host.querySelector<HTMLAnchorElement>('.hero-actions a[href*="wa.me"]')!.href).toContain(encodeURIComponent(`bloque ${config.categoryId}`));
  });
  it("carga solo una ruta del bloque y compra el ID correcto al solicitar acceso", async () => {
    await mount(definition); await openRoute();
    expect(host.querySelectorAll(".route-dialog .course-row")).toHaveLength(1);
    expect(mocks.get.mock.calls.every(([url]) => String(url).startsWith(`api/category/${config.categoryId}/`))).toBe(true);
    await openCourse();
    expect(host.querySelector(".course-content")?.textContent).toContain("Temario del bloque");
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click(); await flush();
    expect(window.open).not.toHaveBeenCalled();
    expect(mocks.setCategory).toHaveBeenCalledWith(expect.objectContaining({ id: config.categoryId, precio: 10000 + config.categoryId }));
    expect(mocks.beginCheckout).toHaveBeenCalledWith([expect.objectContaining({ id: config.categoryId })], 10000 + config.categoryId);
    expect(mocks.toggleBuy).toHaveBeenCalledTimes(1);
  });
  it("muestra el acceso comprado y abre Drive desde esta página sin ofrecer otra compra", async () => {
    await mount(definition, true);
    expect(host.querySelector(".pack-strip")?.textContent).toContain("TU ACCESO ESTÁ ACTIVO");
    expect(host.querySelector(".price")).toBeNull();
    expect(host.querySelector(".final-section")).toBeNull();
    expect(host.querySelector('a[href*="wa.me"]')).toBeNull();
    host.querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!.click();
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
    await openRoute(); await openCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).toHaveBeenCalledWith(`https://drive.google.com/block-${config.categoryId}`, "_blank", "noopener,noreferrer");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });
  it("busca cursos y recomienda rutas únicamente dentro del bloque", async () => {
    await mount(definition);
    const input = host.querySelector<HTMLInputElement>("#study-route-search")!;
    input.value = course.name_del_curso!.split(" ")[0]!; input.dispatchEvent(new Event("input", { bubbles: true })); await flush();
    await vi.waitFor(() => expect(host.querySelector(".finder-course-list .course-row")).not.toBeNull());
    expect(mocks.get.mock.calls.every(([url]) => String(url).startsWith(`api/category/${config.categoryId}/courses?`))).toBe(true);
    expect(host.querySelectorAll(".finder-group")).toHaveLength(1);
    expect(host.querySelector(".finder-course-routes button")).not.toBeNull();
    host.querySelector<HTMLButtonElement>(".route-finder button")!.click(); await flush();
    expect(host.querySelectorAll(".route-card")).toHaveLength(config.routes.length);
    expect(host.querySelector(".finder-courses")).toBeNull();
  });
});
