import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, h, KeepAlive, nextTick } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";

const lifecycle = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }));
vi.mock("../campaigns/TechnologyCampaignPage.vue", () => ({ default: {
  mounted: lifecycle.mount,
  unmounted: lifecycle.unmount,
  template: '<main data-page="technology">Tecnología</main>',
} }));
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
  it("muestra Tecnología solo en /courses/200 y conserva los slugs y otras categorías", async () => {
    const router = await mount("/courses/200?utm_source=prueba");
    expect(host.querySelector('[data-page="technology"]')).not.toBeNull();
    expect(host.querySelector('[data-page="detail"]')).toBeNull();
    await router.push("/courses/200/python-basico"); await flush();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
    await router.push("/courses/103"); await flush();
    expect(host.querySelector('[data-page="technology"]')).toBeNull();
    expect(host.querySelector('[data-page="detail"]')).not.toBeNull();
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
