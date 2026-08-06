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
