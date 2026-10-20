import type { StudyRouteDefinition } from "../routes/studyRoutes";

export interface StudyCampaignConfig {
  categoryId: number;
  campaignId: string;
  title: string;
  shortTitle: string;
  productKind: "pilar" | "paquete" | "bloque";
  metadataTitle: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  paidHeadline: string;
  paidHighlight: string;
  paidDescription: string;
  fact: string;
  imageLabel: string;
  imageTopics: string;
  heroImage: string;
  heroAlt: string;
  creditsUrl: string;
  accent: string;
  hover: string;
  tint: string;
  background: string;
  routes: StudyRouteDefinition[];
  counts: Record<string, number>;
  catalogTotal: number;
}
