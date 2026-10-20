import { describe, expect, it } from "vitest";
import data from "./personalizedCampaignData.json";
import { personalizedCampaigns } from "./personalizedCampaigns";
import { coursesForStudyRoute } from "../routes/studyRoutes";
import { technologyCampaign } from "./technologyCampaign";
import { STUDY_ROUTE_QUERIES } from "../routes/studyRouteQueries";
import { STUDY_ROUTES } from "../routes/studyRoutes";

const assets = import.meta.glob("/public/images/campaigns/**/*", { query: "?url", import: "default", eager: true });
const exists = (path: string) => Object.prototype.hasOwnProperty.call(assets, `/public${path}`);

describe("rutas personalizadas de los pilares y del acceso total", () => {
  it("asigna rutas no vacías, cantidades, imágenes y consultas a cada producto", () => {
    for (const [id, config] of Object.entries(personalizedCampaigns)) {
      expect(config.categoryId).toBe(Number(id));
      expect(config.routes.length).toBeGreaterThanOrEqual(6);
      expect(config.catalogTotal).toBeGreaterThan(0);
      expect(new Set(config.routes.map((route) => route.id)).size).toBe(config.routes.length);
      for (const route of config.routes) {
        expect(config.counts[route.id]).toBeGreaterThan(0);
        expect(config.counts[route.id]).toBeLessThanOrEqual(config.catalogTotal);
        const queries = route.queryTerms ?? STUDY_ROUTE_QUERIES[route.id];
        expect(queries?.length).toBeGreaterThan(0);
        expect(queries!.length).toBeLessThan(30);
        expect(route.imageAlt.trim().length).toBeGreaterThan(0);
      }
    }
  });
  it("usa archivos existentes sin repetir fotos entre portadas, rutas y campañas anteriores", () => {
    for (const config of Object.values(personalizedCampaigns)) {
      const paths = [config.heroImage, ...config.routes.map((route) => route.image)];
      expect(new Set(paths).size).toBe(paths.length);
    }
    const paths = [...new Set(Object.values(personalizedCampaigns).flatMap((config) => [config.heroImage, ...config.routes.map((route) => route.image)]))];
    for (const path of paths) expect(exists(path), path).toBe(true);
    const photoIds = Object.values(data).flatMap((config) => [config.hero, ...config.routes.map((route) => route.photo)]);
    expect(new Set(photoIds).size).toBe(photoIds.length);
    for (const path of STUDY_ROUTES.map((route) => route.image)) expect(paths).not.toContain(path);
    for (const config of Object.values(personalizedCampaigns)) {
      expect(exists(config.creditsUrl)).toBe(true);
      expect(exists(config.creditsUrl.replace('credits.html', 'SOURCES.md'))).toBe(true);
    }
  });
  it("combina exactamente las rutas y conteos de los tres pilares y mantiene el producto Toda la Tienda", () => {
    const total = personalizedCampaigns["100200300"];
    const pillars = [personalizedCampaigns["100"], technologyCampaign, personalizedCampaigns["300"]];
    expect(total.routes).toHaveLength(60);
    expect(total.routes).toEqual(pillars.flatMap((pillar) => pillar.routes.map((route) => ({ ...route, sourceCategoryId: pillar.categoryId }))));
    expect(total.counts).toEqual(Object.assign({}, ...pillars.map((pillar) => pillar.counts)));
    expect(total.categoryId).toBe(100200300);
    expect(total.productKind).toBe("paquete");
  });
  it("no confunde UI con guitarra ni ventas con reinvéntate", () => {
    const design = personalizedCampaigns["300"].routes.find((r) => r.id === "300-diseno")!;
    expect(coursesForStudyRoute([{ id: 1, name_del_curso: "Curso de guitarra" }], design)).toEqual([]);
    expect(coursesForStudyRoute([{ id: 2, name_del_curso: "Diseño UX/UI con Figma" }], design)).toHaveLength(1);
    const sales = personalizedCampaigns["100"].routes.find((r) => r.id === "100-ventas")!;
    expect(coursesForStudyRoute([{ id: 1, name_del_curso: "Reinvéntate en tiempos de crisis" }], sales)).toEqual([]);
  });
});
