import type { StudyCampaignConfig } from "./studyCampaignConfig";
import type { StudyRouteDefinition } from "../routes/studyRoutes";
import { normalizeStudyText, STUDY_ROUTES } from "../routes/studyRoutes";
import { TECHNOLOGY_ROUTES } from "../routes/technologyRoutes";
import { STUDY_ROUTE_QUERIES } from "../routes/studyRouteQueries";
import { personalizedCampaigns } from "./personalizedCampaigns";

type RouteImage = { image: string; imageAlt: string; imageKind?: string };
type BlockRouteSpec = ({ ref: string; queryTerms?: string[] } & Partial<RouteImage>) | ({ id: string; title: string; summary: string; queries: string[] } & RouteImage);
export interface BlockCampaignDefinition {
  categoryId: number;
  title: string;
  shortTitle: string;
  headline: string;
  highlight: string;
  description: string;
  topics: string;
  hero: { image: string; imageAlt: string };
  routes: BlockRouteSpec[];
  snapshot: { updatedAt: string; catalogTotal: number; counts: Record<string, number> };
}
const references = new Map<string, StudyRouteDefinition>([
  ...TECHNOLOGY_ROUTES.map((route) => [`technology:${route.id}`, route] as const),
  ...STUDY_ROUTES.map((route) => [`office:${route.id}`, route] as const),
  ...personalizedCampaigns["100"].routes.map((route) => [`business:${route.id}`, route] as const),
  ...personalizedCampaigns["300"].routes.map((route) => [`creative:${route.id}`, route] as const),
]);
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Used by the snapshot refresh script as well as the page builder.
export function blockRouteDefinitions(definition: BlockCampaignDefinition): StudyRouteDefinition[] {
  return definition.routes.map((spec, index) => {
    if (spec.imageKind !== undefined && spec.imageKind !== "logo" && spec.imageKind !== "report")
      throw new Error(`Tipo de imagen inválido en el bloque ${definition.categoryId}`);
    let route: StudyRouteDefinition;
    if ("ref" in spec) {
      const original = references.get(spec.ref);
      if (!original) throw new Error(`Ruta de bloque desconocida: ${spec.ref}`);
      route = {
        ...original,
        queryTerms: original.queryTerms ?? STUDY_ROUTE_QUERIES[original.id],
        ...Object.fromEntries(Object.entries(spec).filter(([key]) => key !== "ref")),
      };
    } else {
      route = {
        ...spec, title: `Ruta ${spec.title}`, goal: spec.summary,
        terms: new RegExp([...new Set(spec.queries.map(normalizeStudyText))].map((term) => `\\b${escapeRegex(term)}`).join("|")),
        queryTerms: spec.queries, imageKind: spec.imageKind === "logo" ? "logo" : "report", accent: "#1d4ed8",
        steps: [
          `Empieza por los fundamentos de ${spec.title}.`,
          spec.summary,
          "Practica a tu ritmo y explora los cursos de mayor nivel cuando tengas las bases.",
        ],
      };
    }
    return { ...route, id: `${definition.categoryId}-${route.id}`, sourceCategoryId: definition.categoryId, featured: index < 3 };
  });
}

export function createBlockCampaign(definition: BlockCampaignDefinition): StudyCampaignConfig {
  const theme = definition.categoryId < 200
    ? { accent: "#1d4ed8", hover: "#1e40af", tint: "#dbeafe", background: "#eff6ff" }
    : definition.categoryId < 300
      ? { accent: "#047857", hover: "#065f46", tint: "#d1fae5", background: "#f0fdf4" }
      : { accent: "#a21caf", hover: "#86198f", tint: "#fae8ff", background: "#fdf4ff" };
  return {
    ...theme, categoryId: definition.categoryId, campaignId: `bloque_${definition.categoryId}`,
    title: definition.title, shortTitle: definition.shortTitle, productKind: "bloque",
    metadataTitle: `${definition.title} | Cursos Estudia y Trabaja`,
    eyebrow: definition.topics, headline: definition.headline, highlight: definition.highlight,
    description: definition.description,
    paidHeadline: `Tus rutas de ${definition.shortTitle} están disponibles`,
    paidHighlight: "elige qué quieres aprender hoy",
    paidDescription: `Tu acceso a ${definition.title} está activo. Elige una ruta, consulta sus niveles y abre el material de tus cursos directamente desde aquí.`,
    fact: definition.topics, imageLabel: definition.shortTitle, imageTopics: "Un objetivo · Tu propia ruta · A tu ritmo",
    heroImage: definition.hero.image, heroAlt: definition.hero.imageAlt,
    creditsUrl: "/images/campaigns/bloques/credits.html",
    routes: blockRouteDefinitions(definition).map((route) => ({ ...route, accent: theme.accent })).filter((route) => (definition.snapshot.counts[route.id] ?? 0) > 0),
    counts: definition.snapshot.counts, catalogTotal: definition.snapshot.catalogTotal,
  };
}
