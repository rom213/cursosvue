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
  viewItem: vi.fn(),
  custom: vi.fn(),
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
    trackViewItem: mocks.viewItem,
    trackBeginCheckout: mocks.beginCheckout,
    trackCustom: mocks.custom,
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
import Page from "./TechnologyCampaignPage.vue";

const fixtureCourses: ICategoryCourseDetail[] = [
  {
    id: 1,
    name_del_curso: "Python básico",
    author: "José",
    info_tecnica: { url: "https://drive.google.com/course-paid" },
  },
  { id: 2, name_del_curso: "Python intermedio", author: "Otra academia" },
  {
    id: 3,
    name_del_curso: "React y Next.js avanzado",
    author: "Academia",
    es_gratis: true,
    info_tecnica: { url: "https://drive.google.com/course-free" },
  },
  { id: 4, name_del_curso: "AutoCAD para proyectos" },
  { id: 5, name_del_curso: "Python completo" },
  { id: 6, name_del_curso: "Tablas dinámicas con Python" },
];
const fixtureCategory = {
  id: 200,
  titulo: "Tecnología, Código e Ingeniería",
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
  await router.push("/courses/200?utm_source=test");
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

describe("página de rutas de tecnología", () => {
  it("conserva el contexto al cambiar UTM sin duplicar la vista de producto", async () => {
    const router = await mountPage();
    await router.push("/courses/200?utm_source=otra");
    await flush();
    expect(mocks.activateCampaign).toHaveBeenLastCalledWith(expect.objectContaining({
      id: "tecnologia_200", path: "/courses/200?utm_source=otra", categoryId: 200,
    }));
    expect(mocks.viewItem).toHaveBeenCalledTimes(1);
    expect(mocks.custom.mock.calls.filter(([name]) => name === "CampaignView")).toHaveLength(1);
    expect(mocks.completePageView).not.toHaveBeenCalled();
  });

  it("no sobrescribe los metadatos de la página de destino al desmontarse", async () => {
    await mountPage();
    document.title = "Otra página";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')!;
    description.content = "Descripción de destino";
    app!.unmount(); app = undefined;
    expect(document.title).toBe("Otra página");
    expect(description.content).toBe("Descripción de destino");
    description.remove();
  });

  it("pagina el catálogo completo y reinicia la página al buscar sin filtrar por ruta", async () => {
    const catalog = Array.from({ length: 23 }, (_, index) => ({
      id: index + 1,
      name_del_curso: `${index % 2 ? "React y Next.js" : "Python"} curso ${index + 1}`,
      author: index === 22 ? "José" : "Academia",
    }));
    mocks.get.mockResolvedValue({ data: { items: catalog, total: 23, offset: 0, limit: 100 } });
    await mountPage();
    expect(host.querySelector("#ruta-detalle")).toBeNull();
    expect(host.querySelector(".route-card.selected")).toBeNull();
    expect(buttons(".course-row")).toHaveLength(10);
    const [previous, next] = buttons(".catalog-pagination button");
    expect(previous!.disabled).toBe(true);
    next!.click();
    await flush();
    expect(host.querySelector(".catalog-pagination")?.textContent).toContain("Página 2 de 3");
    expect(buttons(".course-row")[0]?.textContent).toContain("curso 11");
    next!.click();
    await flush();
    expect(buttons(".course-row")).toHaveLength(3);
    expect(next!.disabled).toBe(true);
    previous!.click();
    await flush();
    expect(buttons(".course-row")).toHaveLength(10);
    const input = host.querySelector<HTMLInputElement>("#catalog-course-search")!;
    input.value = "jose";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(buttons(".course-row")).toHaveLength(1);
    expect(buttons(".course-row")[0]?.textContent).toContain("curso 23");
    expect(host.querySelector(".catalog-pagination")).toBeNull();
    await selectRoute("Python");
    host.querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!.click();
    await flush();
    expect(host.querySelector("#ruta-detalle")).toBeNull();
    expect(input.value).toBe("jose");
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(buttons(".course-row")).toHaveLength(10);
    expect(host.querySelector(".catalog-pagination")?.textContent).toContain("Página 1 de 3");
    expect(buttons(".course-row")[1]?.textContent).toContain("React y Next.js");
  });

  it("muestra cursos reales, niveles, rutas disponibles y búsqueda por autor", async () => {
    await mountPage();
    expect(mocks.getCategory).toHaveBeenCalledWith(200);
    expect(mocks.get.mock.calls[0]?.[0]).toContain(
      "/200/courses?limit=100&offset=0",
    );
    expect(host.querySelector(".count-pill")?.textContent).toContain(
      "6 cursos",
    );
    expect(
      buttons(".route-card").map(
        (button) => button.querySelector("h3")?.textContent?.replace(/^Ruta /, ""),
      ),
    ).toEqual([
      "Python",
      "React y Next.js",
      "AutoCAD",
    ]);
    expect(host.querySelector("#ruta-detalle")).toBeNull();
    expect(buttons(".course-row")).toHaveLength(6);
    await selectRoute("Python");
    expect(
      Array.from(host.querySelectorAll(".level-heading h3")).map(
        (heading) => heading.textContent,
      ),
    ).toEqual([
      "Inicial 1",
      "Intermedio 2",
      "Cursos completos 1",
    ]);
    const input = host.querySelector<HTMLInputElement>("#route-course-search")!;
    input.value = "jose";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(buttons(".course-row")).toHaveLength(1);
    expect(buttons(".course-row")[0]?.textContent).toContain("Python básico");
    input.value = "inexistente";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(host.querySelector(".empty-panel")?.textContent).toContain(
      "No encontramos cursos",
    );
    await selectRoute("React y Next.js");
    expect(input.value).toBe("");
    expect(host.querySelector("#ruta-titulo")?.textContent?.trim()).toBe(
      "Ruta React y Next.js",
    );
    expect(document.activeElement).toBe(host.querySelector("#ruta-titulo"));
    expect(buttons(".course-row")[0]?.textContent).toContain(
      "React y Next.js avanzado",
    );
  });

  it("muestra las rutas solo dentro del modal y restaura el catálogo al cerrar", async () => {
    await mountPage();
    const dialog = host.querySelector<HTMLDialogElement>(".route-dialog")!;
    expect(dialog.open).toBe(false);
    expect(host.querySelector("#ruta-titulo")).toBeNull();
    expect(dialog.querySelector("#ruta-detalle")).toBeNull();
    const trigger = buttons(".route-card").find(
      (button) => button.querySelector("h3")?.textContent === "Ruta React y Next.js",
    )!;
    await selectRoute("React y Next.js");
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector("#ruta-titulo")?.textContent).toContain(
      "React y Next.js",
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
    expect(host.querySelector("#ruta-titulo")).toBeNull();
    expect(buttons(".course-row")).toHaveLength(6);
    expect(input.value).toBe("avanzado");
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    await selectRoute("Python");
    expect(dialog.querySelector("#ruta-titulo")?.textContent).toContain(
      "Python",
    );
    dialog.querySelector<HTMLButtonElement>(".dialog-close")!.click();
    await flush();
    expect(dialog.open).toBe(false);
    expect(host.querySelector("#ruta-titulo")).toBeNull();
  });

  it("conserva el bloqueo de scroll al cerrar una descripción sobre el modal de ruta", async () => {
    await mountPage();
    await selectRoute("React y Next.js");
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

  it("cierra el modal de ruta antes de abrir la compra del pilar", async () => {
    await mountPage();
    await selectRoute("Python");
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
      expect.objectContaining({ id: 200 }),
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
    expect(message(pageLink)).toContain("pilar 200 completo");
    expect(message(pageLink)).not.toContain("ruta de Python");
    expect(host.querySelector(".whatsapp-float-route")).toBeNull();
    await selectRoute("React y Next.js");
    expect(host.querySelector(".whatsapp-float-page")).toBeNull();
    const routeLink = host.querySelector<HTMLAnchorElement>(
      ".route-dialog .whatsapp-float-route",
    )!;
    expect(routeLink.querySelector("svg")).not.toBeNull();
    expect(message(routeLink)).toContain("me gustó la ruta de Ruta React y Next.js");
    expect(message(routeLink)).toContain("pilar 200 completo");
    expect(routeLink.target).toBe("_blank");
    expect(routeLink.rel).toBe("noopener noreferrer");
    host
      .querySelector<HTMLButtonElement>(".route-dialog .dialog-close")!
      .click();
    await flush();
    expect(
      message(host.querySelector<HTMLAnchorElement>(".whatsapp-float-page")!),
    ).toBe(message(pageLink));
    await selectRoute("Python");
    expect(
      message(host.querySelector<HTMLAnchorElement>(".whatsapp-float-route")!),
    ).toContain("me gustó la ruta de Ruta Python");
    expect(host.querySelector(".mobile-purchase button")).not.toBeNull();
  });

  it("compra el pilar 200 y normaliza el precio para el checkout", async () => {
    await mountPage();
    host
      .querySelector<HTMLButtonElement>('[data-track="campaign-pack-web"]')!
      .click();
    expect(mocks.setCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 200, precio: 40000, precio_desc: 40000 }),
    );
    expect(mocks.beginCheckout).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 200 })],
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
      expect.objectContaining({ id: 200 }),
    );
    expect(host.querySelector(".course-dialog")?.hasAttribute("open")).toBe(
      false,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("permite estudiar aquí sin mostrar precio, venta ni redirigir a mis cursos", async () => {
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
    expect(router.currentRoute.value.fullPath).toBe("/courses/200?utm_source=test");
    expect(host.querySelector(".pack-strip")?.textContent).toContain("TU ACCESO ESTÁ ACTIVO");
    expect(host.querySelector(".pack-strip")?.textContent).toContain("Explorar mis rutas");
    expect(host.querySelector(".price")).toBeNull();
    expect(host.querySelector(".final-section")).toBeNull();
    expect(host.querySelector('a[href*="wa.me"]')).toBeNull();
    expect(host.textContent).not.toContain("COP");
    expect(host.textContent).not.toContain("Ver mis cursos");
    expect(host.textContent).not.toContain("¿Qué incluye mi compra?");
    expect(host.textContent).not.toContain("¿El pago es una suscripción?");
    expect(host.querySelector(".mobile-purchase button")?.textContent).toContain("Explorar mis rutas");
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    expect(mocks.setCategory).not.toHaveBeenCalled();
    expect(mocks.toggleBuy).not.toHaveBeenCalled();
    expect(mocks.custom.mock.calls.filter(([name]) => name === "CampaignCtaClick")).toHaveLength(0);
    await selectRoute("Python");
    expect(host.querySelector(".whatsapp-float-route")).toBeNull();
    expect(mocks.beginCheckout).not.toHaveBeenCalled();
  });

  it("mantiene el correo requerido para un curso gratuito sin sesión", async () => {
    await mountPage();
    await selectRoute("React y Next.js");
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
      name_del_curso: `Python básico ${index}`,
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
        id: "tecnologia_200",
        categoryId: 200,
        path: "/courses/200?utm_source=test",
      }),
    );
    expect(mocks.completePageView).not.toHaveBeenCalled();
    expect(document.title).toContain("Rutas de programación");
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
    ).toContain("tecnologia/hero.webp");
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
