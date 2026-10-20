import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, h, KeepAlive, nextTick } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";

const lifecycle = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }));
vi.mock("../campaigns/pages/pilares/TechnologyCampaignPage200.vue", () => ({ default: {
  mounted: lifecycle.mount,
  unmounted: lifecycle.unmount,
  template: '<main data-page="technology">Tecnología</main>',
} }));
vi.mock("../campaigns/pages/pilares/BusinessCampaignPage100.vue", () => ({ default: { template: '<main data-page="business">Negocios</main>' } }));
vi.mock("../campaigns/pages/pilares/CreativeCampaignPage300.vue", () => ({ default: { template: '<main data-page="creative">Creatividad</main>' } }));
vi.mock("../campaigns/pages/pilares/AllAccessCampaignPage100200300.vue", () => ({ default: { template: '<main data-page="all-access">Acceso Total</main>' } }));
vi.mock("../campaigns/pages/bloques", () => ({ BLOCK_CAMPAIGN_PAGES: Object.fromEntries(
  [...Array.from({ length: 7 }, (_, i) => 101 + i), ...Array.from({ length: 7 }, (_, i) => 201 + i), ...Array.from({ length: 9 }, (_, i) => 301 + i)]
    .map((id) => [String(id), { template: `<main data-page="block-${id}">Bloque ${id}</main>` }]),
) }));
vi.mock("./CourseInfoDetailPage.vue", () => ({ default: {
  template: '<main data-page="detail">Catálogo habitual</main>',
} }));
import Page from "./course.info.page.vue";
let app: ReturnType<typeof createApp> | undefined;
let host: HTMLElement;
const flush = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await nextTick(); };
afterEach(() => { app?.unmount(); host?.remove(); vi.clearAllMocks(); });

async function mount(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: "/courses/:id/:courseSlug?", name: "courses-description", component: Page },
    { path: "/:googleid/affiliaty/:id", name: "affiliaty", component: Page },
    { path: "/other", component: { template: "<p>Otra página</p>" } },
  ] });
  await router.push(path); await router.isReady();
  host = document.createElement("div"); document.body.appendChild(host);
  app = createApp({ render: () => h(RouterView, {}, {
    default: ({ Component }: { Component: object }) => h(KeepAlive, { include: ["CourseInfoPage"] }, () => h(Component)),
  }) }).use(router);
  app.mount(host); await flush(); return router;
}

describe("selección de la página de categoría", () => {
  it.each([...Array.from({ length: 7 }, (_, i) => 101 + i), ...Array.from({ length: 7 }, (_, i) => 201 + i), ...Array.from({ length: 9 }, (_, i) => 301 + i)])("muestra la página propia del bloque %s y conserva cursos individuales y afiliados", async (id) => {
    const router = await mount(`/courses/${id}`);
    expect(host.querySelector(`[data-page="block-${id}"]`)).not.toBeNull();
    await router.push(`/courses/${id}/curso-individual`); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
    await router.push(`/referido/affiliaty/${id}`); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
  });
  it("desmonta el bloque anterior al pasar a otro bloque o pilar", async () => {
    const router = await mount("/courses/101");
    await router.push("/courses/309"); await flush();
    expect(host.querySelector('[data-page="block-101"]')).toBeNull();
    expect(host.querySelector('[data-page="block-309"]')).not.toBeNull();
    await router.push("/courses/200"); await flush();
    expect(host.querySelector('[data-page="block-309"]')).toBeNull();
    expect(host.querySelector('[data-page="technology"]')).not.toBeNull();
  });
  it.each([["100", "business"], ["300", "creative"], ["100200300", "all-access"]])("selecciona la campaña %s y conserva slugs y afiliados", async (id, page) => {
    const router = await mount(`/courses/${id}`);
    expect(host.querySelector(`[data-page="${page}"]`)).not.toBeNull();
    await router.push(`/courses/${id}/curso-individual`); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
    await router.push(`/referido/affiliaty/${id}`); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
  });
  it("cambia entre campañas sin conservar el producto anterior", async () => {
    const router = await mount("/courses/100");
    await router.push("/courses/300"); await flush();
    expect(host.querySelector('[data-page="creative"]')).not.toBeNull();
    expect(host.querySelector('[data-page="business"]')).toBeNull();
    await router.push("/courses/100200300"); await flush();
    expect(host.querySelector('[data-page="all-access"]')).not.toBeNull();
    expect(host.querySelector('[data-page="creative"]')).toBeNull();
  });
  it("muestra Tecnología solo en /courses/200 y conserva los slugs y otras categorías", async () => {
    const router = await mount("/courses/200?utm_source=prueba");
    expect(host.querySelector('[data-page="technology"]')).not.toBeNull();
    expect(host.querySelector('[data-page="detail"]')).toBeNull();
    await router.push("/courses/200/python-basico"); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
    await router.push("/courses/103"); await flush();
    expect(host.querySelector('[data-page="technology"]')).toBeNull();
    expect(host.querySelector('[data-page="block-103"]')).not.toBeNull();
    await router.push("/courses/200"); await flush();
    expect(host.querySelector('[data-page="technology"]')).not.toBeNull();
  });
  it("mantiene el flujo de afiliados de la categoría 200", async () => {
    await mount("/referido/affiliaty/200");
    expect(host.querySelector('[data-page="technology"]')).toBeNull();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
  });
  it("desmonta Tecnología al salir de KeepAlive y la monta al volver", async () => {
    const router = await mount("/courses/200");
    expect(lifecycle.mount).toHaveBeenCalledTimes(1);
    await router.push("/other"); await flush();
    expect(lifecycle.unmount).toHaveBeenCalledTimes(1);
    await router.push("/courses/200"); await flush();
    expect(lifecycle.mount).toHaveBeenCalledTimes(2);
  });
});
