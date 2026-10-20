import { describe, expect, it } from "vitest";
import { PILARES } from "../../courseFilterData";
import { createBlockCampaign, blockRouteDefinitions } from "./blockCampaigns";
import type { BlockCampaignDefinition } from "./blockCampaigns";

const definitions = Object.values(import.meta.glob<BlockCampaignDefinition>("./bloques/*.json", { eager: true, import: "default" }));
const assets = import.meta.glob("/public/images/campaigns/**/*", { eager: true, query: "?url", import: "default" });
const pages = import.meta.glob("../pages/bloques/BlockCampaignPage*.vue");

describe("configuración de las páginas de bloques", () => {
  it("tiene una página y una configuración propias para cada uno de los 23 bloques", () => {
    const expectedIds = PILARES.flatMap((pillar) => pillar.themes.map((theme) => theme.id)).sort();
    expect(definitions.map((d) => d.categoryId).sort()).toEqual(expectedIds);
    expect(Object.keys(pages)).toHaveLength(23);
    for (const id of expectedIds) expect(pages[`../pages/bloques/BlockCampaignPage${id}.vue`]).toBeTypeOf("function");
  });
  it.each(definitions)("limita las rutas y la compra al bloque $categoryId, con cantidades e imágenes válidas", (definition) => {
    const config = createBlockCampaign(definition);
    expect(config.categoryId).toBe(definition.categoryId);
    expect(config.productKind).toBe("bloque");
    expect(config.title).toBe(definition.title);
    expect(config.headline).toBe(definition.headline);
    expect(config.catalogTotal).toBeGreaterThan(0);
    expect(config.routes.length).toBeGreaterThan(0);
    expect(Object.keys(config.counts).sort()).toEqual(config.routes.map((r) => r.id).sort());
    const paths = [config.heroImage, ...config.routes.map((r) => r.image)];
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) expect(assets[`/public${path}`], path).toBeDefined();
    for (const route of config.routes) {
      expect(route.sourceCategoryId).toBe(definition.categoryId);
      expect(route.id).toMatch(new RegExp(`^${definition.categoryId}-`));
      expect(route.queryTerms?.length).toBeGreaterThan(0);
      expect(config.counts[route.id]).toBeGreaterThan(0);
      expect(config.counts[route.id]).toBeLessThanOrEqual(config.catalogTotal);
      expect(route.imageAlt.trim().length).toBeGreaterThan(0);
    }
  });
  it("no modifica las rutas de origen al crear configuraciones de distintos bloques", () => {
    const before = definitions.map(blockRouteDefinitions);
    for (const definition of definitions) createBlockCampaign(definition);
    expect(definitions.map(blockRouteDefinitions)).toEqual(before);
  });
});
