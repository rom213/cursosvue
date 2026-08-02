import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

const STORAGE_KEY = "ce_campaign_return_v1";
let mountedApp: ReturnType<typeof createApp> | null = null;

async function mountComposable(initialPath = "/courses/306/tematica?utm_campaign=joyeria") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/courses", component: { template: "<div />" } },
      { path: "/courses/306/tematica", component: { template: "<div />" } },
    ],
  });
  await router.push(initialPath);
  await router.isReady();

  const module = await import("../useCampaignReturn");
  let campaignReturn!: ReturnType<typeof module.useCampaignReturn>;
  const Root = defineComponent({
    setup() {
      campaignReturn = module.useCampaignReturn();
      return () => h("div");
    },
  });
  mountedApp = createApp(Root).use(router);
  mountedApp.mount(document.createElement("div"));
  await nextTick();
  return { router, campaignReturn };
}

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  mountedApp?.unmount();
  mountedApp = null;
});

describe("useCampaignReturn", () => {
  it("conserva la URL completa, vuelve a la campaña y permite descartarla", async () => {
    const { router, campaignReturn } = await mountComposable();
    const campaign = {
      id: "bisuteria_joyeria_306",
      title: "tu ruta de Bisutería y Joyería",
      path: router.currentRoute.value.fullPath,
      categoryId: 306,
    };

    campaignReturn.activateCampaign(campaign);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual(campaign);
    expect(campaignReturn.isCampaignRoute.value).toBe(true);

    await router.push("/courses");
    expect(campaignReturn.isCampaignRoute.value).toBe(false);

    await campaignReturn.returnToCampaign();
    expect(router.currentRoute.value.fullPath).toBe(
      "/courses/306/tematica?utm_campaign=joyeria",
    );

    campaignReturn.dismissCampaignReturn();
    expect(campaignReturn.activeCampaign.value).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("rehidrata una campaña persistida al cargar la aplicación", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        id: "bisuteria_joyeria_306",
        title: "tu ruta de Bisutería y Joyería",
        path: "/courses/306/tematica?utm_source=meta",
        categoryId: 306,
      }),
    );

    const { campaignReturn } = await mountComposable("/courses");
    expect(campaignReturn.activeCampaign.value?.path).toContain("utm_source=meta");
    expect(campaignReturn.isCampaignRoute.value).toBe(false);
  });
});

