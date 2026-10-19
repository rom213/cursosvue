import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { ICategory } from "../../types/Categorie";

const mocks = vi.hoisted(() => ({
  category: undefined as ICategory | undefined,
  checkout: vi.fn(), setCategory: vi.fn(), toggleBuy: vi.fn(),
}));
vi.mock("../../store/CategoryStore", () => ({ categoryStore: () => ({
  categories: [], findCategoryById: (id: number) => id === mocks.category?.id ? mocks.category : undefined,
}) }));
vi.mock("../../store/AuthStore", () => ({ authStore: () => ({ getProfile: () => ({ user: { email: "estudiante@example.com" } }) }) }));
vi.mock("../../store/EmergentBuyStore", () => ({ emergentBuyStore: () => ({
  setCategoryEmergent: mocks.setCategory, handleEmergentBuy: mocks.toggleBuy,
}) }));
vi.mock("../../services/CategorieService", () => ({ default: {
  getCategoryById: async (id: number) => id === mocks.category?.id ? mocks.category : null,
  getCourses: async () => ({ items: [{ id: 901, name_del_curso: "Curso de prueba", author: "Academia", es_gratis: false, info_tecnica: { url: "https://drive.google.com/course-test" } }], total: 1, offset: 0, limit: 10 }),
  getFacets: async () => ({ items: [], total: 0 }),
  getCategoryBloques: async () => [],
  getCourseContenido: async () => "<p>Temario de prueba</p>",
} }));
vi.mock("../../composables/usePromoQuery", () => ({ usePromoQuery: () => ({
  promoName: { value: null }, promoType: { value: null }, promoBannerClicked: { value: false }, consumeBannerClick: vi.fn(),
}) }));
vi.mock("../../composables/useTracking", () => ({ useTracking: () => ({
  trackBeginCheckout: mocks.checkout, trackViewItem: vi.fn(), trackViewContentCourse: vi.fn(),
  trackCustom: vi.fn(), trackWhatsAppIntent: vi.fn(), trackGenerateLead: vi.fn(), trackReferralClick: vi.fn(),
}) }));
vi.mock("../emergent.buy.component.vue", () => ({ default: { template: "<div />" } }));
vi.mock("../../components/footer/footer.component.vue", () => ({ default: { template: "<footer />" } }));
vi.mock("./CourseFaqSection.vue", () => ({ default: { template: "<p>Preguntas de compra</p>" } }));
vi.mock("./componentCourseInfo/comments.body.component.vue", () => ({ default: { template: "<div />" } }));
import Page from "./CourseInfoDetailPage.vue";
let app: ReturnType<typeof createApp> | undefined;
let host: HTMLDivElement;
const flush = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await nextTick(); };
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
});
afterEach(() => { app?.unmount(); host?.remove(); vi.restoreAllMocks(); });
async function mount(id: number, bought: boolean) {
  mocks.category = { id, titulo: "Categoría de prueba", user_bought: bought, precio: 30000, precio_desc: 40000, cantidad_cursos: 1 } as ICategory;
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: "/courses/:id", name: "courses-description", component: { template: "<div />" } },
  ] });
  await router.push(`/courses/${id}?pub=whasapt`); await router.isReady();
  host = document.createElement("div"); document.body.appendChild(host);
  app = createApp(Page).use(router); app.mount(host); await flush(); await flush();
  return router;
}
function clickText(text: string) {
  const button = Array.from(host.querySelectorAll("button")).find((button) => button.textContent?.trim() === text);
  expect(button, text).toBeDefined(); button!.click();
}

describe("vista genérica para compradores", () => {
  it.each([103, 100, 300, 100200, 100200300])("muestra el acceso activo sin venta para la categoría %s", async (id) => {
    const router = await mount(id, true);
    expect(host.querySelector('[data-testid="purchased-access"]')?.textContent).toContain("Tu acceso está activo");
    expect(host.querySelector('[data-testid="purchase-panel"]')).toBeNull();
    expect(host.textContent).not.toContain("Comprar desde la web");
    expect(host.textContent).not.toContain("Pago unico");
    expect(host.textContent).not.toContain("30,000");
    expect(host.querySelector('a[href*="wa.me"]')).toBeNull();
    clickText("Explorar mis cursos"); await flush();
    expect(router.currentRoute.value.params.id).toBe(String(id));
    expect(document.activeElement).toBe(host.querySelector("#lista-completa-header"));
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    expect(mocks.checkout).not.toHaveBeenCalled();
    expect(mocks.setCategory).not.toHaveBeenCalled();
    expect(mocks.toggleBuy).not.toHaveBeenCalled();
  });
  it("mantiene la información de compra para quien no ha comprado", async () => {
    await mount(103, false);
    expect(host.querySelector('[data-testid="purchase-panel"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="purchased-access"]')).toBeNull();
    clickText("Comprar desde la web");
    expect(mocks.checkout).toHaveBeenCalledWith([expect.objectContaining({ id: 103 })], 30000);
    expect(host.querySelector('a[href*="wa.me"]')).not.toBeNull();
  });
  it("ofrece ayuda de acceso al comprador y vuelve al contenido sin salir", async () => {
    await mount(103, true);
    clickText("Preguntas"); await flush();
    expect(host.textContent).toContain("Cómo acceder a tus cursos");
    expect(host.textContent).not.toContain("Preguntas de compra");
    clickText("Explorar mis cursos"); await flush();
    expect(host.textContent).toContain("Curso de prueba");
    expect(document.activeElement).toBe(host.querySelector("#lista-completa-header"));
  });
});
