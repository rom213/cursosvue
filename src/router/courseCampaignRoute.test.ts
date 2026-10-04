import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import courseRoutes from "./course.routes";

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: courseRoutes,
  });
}

describe("ruta de campaña de bisutería", () => {
  it("resuelve /courses/306/tematica como landing y conserva noindex", () => {
    const resolved = makeRouter().resolve("/courses/306/tematica");

    expect(resolved.name).toBe("bisuteria-campaign");
    expect(resolved.meta.showHeader).toBe(true);
    expect(resolved.meta.noindex).toBe(true);
    expect(resolved.meta.deferPageView).toBe(true);
  });

  it("mantiene otros slugs como cursos individuales", () => {
    const resolved = makeRouter().resolve("/courses/306/curso-de-alambrismo");

    expect(resolved.name).toBe("courses-description");
    expect(resolved.params.id).toBe("306");
    expect(resolved.params.courseSlug).toBe("curso-de-alambrismo");
  });
});

describe("ruta de estudio de datos y oficina", () => {
  it("resuelve el bloque 103 como campaña y carga su componente", async () => {
    const resolved = makeRouter().resolve(
      "/courses/103/tematica/ex?utm_source=campana",
    );
    expect(resolved.name).toBe("excel-campaign");
    expect(resolved.meta).toMatchObject({
      showHeader: true,
      noindex: true,
      deferPageView: true,
    });
    const campaign = courseRoutes.find(
      (item) => item.name === "excel-campaign",
    )!;
    const component = await campaign.component();
    expect(component.default.name).toBe("ExcelSapCampaignPage");
  });

  it("mantiene el catálogo y los cursos individuales del bloque", () => {
    const router = makeRouter();
    expect(router.resolve("/courses/103").name).toBe("courses-description");
    expect(router.resolve("/courses/103/excel-basico").name).toBe(
      "courses-description",
    );
  });
});
