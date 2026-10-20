import data from "./personalizedCampaignData.json";
import snapshots from "./personalizedRouteCounts.json";
import { normalizeStudyText } from "../routes/studyRoutes";
import type { StudyRouteDefinition } from "../routes/studyRoutes";
import type { StudyCampaignConfig } from "./studyCampaignConfig";
import { technologyCampaign } from "./technologyCampaign";

export type PersonalizedCategoryId = keyof typeof data;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function createPersonalizedCampaign(id: PersonalizedCategoryId): StudyCampaignConfig {
  const source = data[id];
  const snapshot = snapshots[id];
  if (id === "100200300") {
    const pillars = [createPersonalizedCampaign("100"), technologyCampaign, createPersonalizedCampaign("300")];
    return {
      ...source,
      productKind: "paquete",
      metadataTitle: `${source.title} | Cursos Estudia y Trabaja`,
      heroImage: `${source.assetDirectory}/hero.webp`,
      creditsUrl: `${source.assetDirectory}/credits.html`,
      catalogTotal: snapshot.catalogTotal,
      counts: Object.assign({}, ...pillars.map((pillar) => pillar.counts)),
      routes: pillars.flatMap((pillar) => pillar.routes.map((route) => ({ ...route, sourceCategoryId: pillar.categoryId }))),
    };
  }
  const routes: StudyRouteDefinition[] = source.routes.map<StudyRouteDefinition>((item, index) => ({
    id: item.id, title: item.title, summary: item.summary,
    goal: item.summary,
    terms: new RegExp([...new Set(item.queries.map(normalizeStudyText))].map((term) => `\\b${escapeRegex(term)}${["ui", "ux", "word"].includes(term) ? "\\b" : ""}`).join("|")),
    queryTerms: item.queries,
    image: `${source.assetDirectory}/${item.id}.webp`, imageAlt: item.imageAlt,
    imageKind: "report", accent: source.accent, featured: index < 3,
    steps: [
      `Empieza por los fundamentos de ${item.title.replace(/^Ruta /, "")}.`,
      item.summary,
      "Elige un proyecto para practicar y continúa con los cursos de mayor nivel.",
    ],
  })).filter((item) => (snapshot.counts as Record<string, number>)[item.id] > 0);
  return {
    ...source,
    productKind: "pilar",
    metadataTitle: `${source.title} | Cursos Estudia y Trabaja`,
    heroImage: `${source.assetDirectory}/hero.webp`,
    creditsUrl: `${source.assetDirectory}/credits.html`,
    counts: snapshot.counts, catalogTotal: snapshot.catalogTotal, routes,
  };
}

export const personalizedCampaigns: Record<PersonalizedCategoryId, StudyCampaignConfig> = {
  "100": createPersonalizedCampaign("100"),
  "300": createPersonalizedCampaign("300"),
  "100200300": createPersonalizedCampaign("100200300"),
};
