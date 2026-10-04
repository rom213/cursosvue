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
  return Array.from(host.querySelectorAll<HTMLButtonElement>(selector));
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
    .find((button) => button.querySelector("h3")?.textContent === title)!
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
  mocks.get.mockImplementation(async (url: string) => {
    if (url.includes("/courses?"))
      return {
        data: {
          items: fixtureCourses,
          total: fixtureCourses.length,
          offset: 0,
          limit: 100,
        },
      };
    return { data: { contenido: "<p>Descripción del curso seleccionado</p>" } };
  });
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

describe("página de rutas de datos y oficina", () => {
  it("muestra cursos reales, niveles, rutas disponibles y búsqueda por autor", async () => {
    await mountPage();
    expect(mocks.getCategory).toHaveBeenCalledWith(103);
    expect(mocks.get.mock.calls[0]?.[0]).toContain(
      "/103/courses?limit=100&offset=0",
    );
    expect(host.querySelector(".count-pill")?.textContent).toContain(
      "6 cursos",
    );
    expect(
      buttons(".route-card").map(
        (button) => button.querySelector("h3")?.textContent,
      ),
    ).toEqual([
      "Excel",
      "Power BI",
      "Análisis de datos",
      "Office",
      "Business Intelligence",
      "Productividad y colaboración",
    ]);
    expect(
      Array.from(host.querySelectorAll(".level-heading h3")).map(
        (heading) => heading.textContent,
      ),
    ).toEqual([
      "Inicial 1",
      "Intermedio 1",
      "Cursos completos 1",
      "Cursos complementarios 1",
    ]);
    const input = host.querySelector<HTMLInputElement>("#route-course-search")!;
    input.value = "jose";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(buttons(".course-row")).toHaveLength(1);
    expect(buttons(".course-row")[0]?.textContent).toContain("Excel básico");
    input.value = "inexistente";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(host.querySelector(".empty-panel")?.textContent).toContain(
      "No encontramos cursos",
    );
    await selectRoute("Power BI");
    expect(input.value).toBe("");
    expect(host.querySelector("#ruta-titulo")?.textContent?.trim()).toBe(
      "Ruta de Power BI",
    );
    expect(document.activeElement).toBe(host.querySelector("#ruta-titulo"));
    expect(buttons(".course-row")[0]?.textContent).toContain(
      "Power BI avanzado",
    );
  });

  it("abre las rutas en un modal y mantiene desplegada la última seleccionada al cerrar", async () => {
    await mountPage();
    const dialog = host.querySelector<HTMLDialogElement>(".route-dialog")!;
    expect(dialog.open).toBe(false);
    expect(host.querySelector("#ruta-titulo")?.textContent).toContain("Excel");
    expect(dialog.querySelector("#ruta-detalle")).toBeNull();
    const trigger = buttons(".route-card").find(
      (button) => button.querySelector("h3")?.textContent === "Power BI",
    )!;
    await selectRoute("Power BI");
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector("#ruta-titulo")?.textContent).toContain(
      "Power BI",
    );
    expect(host.querySelectorAll("#ruta-detalle")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("hidden");
    const input = dialog.querySelector<HTMLInputElement>(
      "#route-course-search",
    )!;
    input.value = "avanzado";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await flush();
    expect(dialog.open).toBe(false);
    expect(dialog.querySelector("#ruta-detalle")).toBeNull();
    expect(host.querySelector("#ruta-titulo")?.textContent).toContain(
      "Power BI",
    );
    expect(input.value).toBe("avanzado");
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    await selectRoute("Excel");
    expect(dialog.querySelector("#ruta-titulo")?.textContent).toContain(
      "Excel",
    );
    dialog.querySelector<HTMLButtonElement>(".dialog-close")!.click();
    await flush();
    expect(dialog.open).toBe(false);
    expect(host.querySelector("#ruta-titulo")?.textContent).toContain("Excel");
  });

  it("conserva el bloqueo de scroll al cerrar una descripción sobre el modal de ruta", async () => {
    await mountPage();
    await selectRoute("Power BI");
    const trigger = buttons(".course-row")[0]!;
    await openFirstCourse();
    host
      .querySelector<HTMLDialogElement>(".course-dialog")!
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    await flush();
    expect(host.querySelector<HTMLDialogElement>(".route-dialog")!.open).toBe(
      true,
    );
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(trigger);
    host
      .querySelector<HTMLDialogElement>(".route-dialog")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    expect(document.body.style.overflow).toBe("");
  });

  it("cierra el modal de ruta antes de abrir la compra del bloque", async () => {
    await mountPage();
    await selectRoute("Excel");
    await openFirstCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    await flush();
    expect(host.querySelector<HTMLDialogElement>(".route-dialog")!.open).toBe(
      false,
    );
    expect(host.querySelector<HTMLDialogElement>(".course-dialog")!.open).toBe(
      false,
    );
    expect(document.body.style.overflow).toBe("");
    expect(mocks.setCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 103 }),
    );
  });

  it("distingue los mensajes flotantes de WhatsApp del contenido y de la ruta elegida", async () => {
    await mountPage();
    const message = (link: HTMLAnchorElement) =>
      new URL(link.href).searchParams.get("text")!;
    const pageLink = host.querySelector<HTMLAnchorElement>(
      ".whatsapp-float-page",
    )!;
    expect(pageLink.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    expect(message(pageLink)).toContain("me gustó todo el contenido");
    expect(message(pageLink)).toContain("bloque 103 completo");
    expect(message(pageLink)).not.toContain("ruta de Excel");
    expect(host.querySelector(".whatsapp-float-route")).toBeNull();
    await selectRoute("Power BI");
    expect(host.querySelector(".whatsapp-float-page")).toBeNull();
    const routeLink = host.querySelector<HTMLAnchorElement>(
      ".route-dialog .whatsapp-float-route",
    )!;
    expect(routeLink.querySelector("svg")).not.toBeNull();
    expect(message(routeLink)).toContain("me gustó la ruta de Power BI");
    expect(message(routeLink)).toContain("bloque 103 completo");
    expect(routeLink.target).toBe("_blank");
    expect(routeLink.rel).toBe("noopener noreferrer");
    host
      .querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!
      .click();
    await flush();
    expect(
      message(host.querySelector<HTMLAnchorElement>(".whatsapp-float-page")!),
    ).toBe(message(pageLink));
    await selectRoute("Excel");
    expect(
      message(host.querySelector<HTMLAnchorElement>(".whatsapp-float-route")!),
    ).toContain("me gustó la ruta de Excel");
    expect(host.querySelector(".mobile-purchase button")).not.toBeNull();
  });

  it("compra el bloque 103 y normaliza el precio para el checkout", async () => {
    await mountPage();
    host
      .querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!
      .click();
    expect(mocks.setCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 103, precio: 40000, precio_desc: 40000 }),
    );
    expect(mocks.beginCheckout).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 103 })],
      40000,
    );
    expect(mocks.toggleBuy).toHaveBeenCalledTimes(1);
  });

  it("ofrece la compra para un curso pagado sin abrir su Drive", async () => {
    await mountPage();
    await openFirstCourse();
    expect(host.querySelector(".course-dialog")?.hasAttribute("open")).toBe(
      true,
    );
    expect(host.querySelector(".course-content")?.textContent).toContain(
      "Descripción",
    );
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).not.toHaveBeenCalled();
    expect(mocks.setCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 103 }),
    );
    expect(host.querySelector(".course-dialog")?.hasAttribute("open")).toBe(
      false,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("conserva el acceso comprado y la navegación a mis cursos", async () => {
    mocks.getCategory.mockResolvedValue({
      ...fixtureCategory,
      user_bought: true,
    });
    const router = await mountPage();
    await openFirstCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    expect(window.open).toHaveBeenCalledWith(
      "https://drive.google.com/course-paid",
      "_blank",
      "noopener,noreferrer",
    );
    host
      .querySelector<HTMLButtonElement>(".course-dialog .dialog-close")!
      .click();
    host
      .querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!
      .click();
    await flush();
    expect(router.currentRoute.value.name).toBe("mycourses");
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });

  it("mantiene el correo requerido para un curso gratuito sin sesión", async () => {
    await mountPage();
    await selectRoute("Power BI");
    await openFirstCourse();
    host.querySelector<HTMLButtonElement>(".dialog-footer button")!.click();
    await flush();
    expect(window.open).not.toHaveBeenCalled();
    expect(host.querySelector(".free-dialog")?.hasAttribute("open")).toBe(true);
    const input = host.querySelector<HTMLInputElement>("#study-free-email")!;
    input.value = "correo-invalido";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    host
      .querySelector<HTMLFormElement>(".free-dialog form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(host.querySelector("#free-email-error")?.textContent).toContain(
      "correo válido",
    );
    input.value = "alumno@example.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    host
      .querySelector<HTMLFormElement>(".free-dialog form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(window.open).toHaveBeenCalledWith(
      "https://drive.google.com/course-free",
      "_blank",
      "noopener,noreferrer",
    );
    expect(host.querySelector(".free-dialog")?.hasAttribute("open")).toBe(
      false,
    );
  });

  it("muestra error sin exponer un catálogo parcial y permite reintentar", async () => {
    const firstHundred = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name_del_curso: `Excel básico ${index}`,
    }));
    mocks.get.mockImplementation(async (url: string) => {
      if (url.includes("offset=100")) throw new Error("Sin conexión");
      return {
        data: { items: firstHundred, total: 101, offset: 0, limit: 100 },
      };
    });
    await mountPage();
    expect(host.querySelector(".error-panel")?.textContent).toContain(
      "catálogo completo",
    );
    expect(buttons(".route-card")).toHaveLength(0);
    expect(host.querySelector("#ruta-detalle")).toBeNull();
    mocks.get.mockResolvedValue({
      data: { items: fixtureCourses, total: 6, offset: 0, limit: 100 },
    });
    host.querySelector<HTMLButtonElement>(".error-panel button")!.click();
    await flush();
    expect(buttons(".route-card").length).toBeGreaterThan(0);
  });

  it("descarta la descripción anterior al abrir otro curso", async () => {
    let resolveOld!: (value: { data: { contenido: string } }) => void;
    const oldResponse = new Promise<{ data: { contenido: string } }>(
      (resolve) => {
        resolveOld = resolve;
      },
    );
    mocks.get.mockImplementation(async (url: string) => {
      if (url.includes("/courses?"))
        return {
          data: { items: fixtureCourses, total: 6, offset: 0, limit: 100 },
        };
      if (url.includes("courses/1/")) return oldResponse;
      return { data: { contenido: "<p>Descripción actual</p>" } };
    });
    await mountPage();
    await openFirstCourse();
    host
      .querySelector<HTMLButtonElement>(".course-dialog .dialog-close")!
      .click();
    buttons(".course-row")[1]!.click();
    await flush();
    resolveOld({ data: { contenido: "<p>Descripción anterior</p>" } });
    await flush();
    expect(host.querySelector(".course-content")?.textContent).toBe(
      "Descripción actual",
    );
  });

  it("deshabilita compra cuando no hay categoría y conserva la exploración", async () => {
    mocks.getCategory.mockResolvedValue(null);
    await mountPage();
    expect(host.querySelector(".inline-error")?.textContent).toContain(
      "compra está temporalmente deshabilitada",
    );
    expect(
      host.querySelector<HTMLButtonElement>('[data-track="campaign-final-web"]')
        ?.disabled,
    ).toBe(true);
    expect(buttons(".route-card").length).toBeGreaterThan(0);
  });

  it("restaura foco y scroll al cerrar con Escape y conserva el contexto de campaña", async () => {
    await mountPage();
    expect(mocks.activateCampaign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "datos_oficina_103",
        categoryId: 103,
        path: "/courses/103/tematica/ex?utm_source=test",
      }),
    );
    expect(mocks.completePageView).toHaveBeenCalledWith(
      1,
      expect.stringContaining("Rutas de Excel"),
    );
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
    ).toContain("datos-oficina/social.webp");
    const trigger = buttons(".course-row")[0]!;
    await openFirstCourse();
    expect(document.body.style.overflow).toBe("hidden");
    host
      .querySelector<HTMLDialogElement>(".course-dialog")!
      .dispatchEvent(new Event("cancel", { cancelable: true }));
    await flush();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    app!.unmount();
    app = undefined;
    expect(document.title).toBe(originalTitle);
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
  });
});
