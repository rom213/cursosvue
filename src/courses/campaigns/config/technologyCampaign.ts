import { TECHNOLOGY_CATEGORY_ID, TECHNOLOGY_CAMPAIGN_ID, TECHNOLOGY_ROUTES } from "../routes/technologyRoutes";
import countSnapshot from "./technologyRouteCounts.json";
import type { StudyCampaignConfig } from "./studyCampaignConfig";

export const technologyCampaign: StudyCampaignConfig = {
  categoryId: TECHNOLOGY_CATEGORY_ID, campaignId: TECHNOLOGY_CAMPAIGN_ID,
  title: "Tecnología, Código e Ingeniería", shortTitle: "Tecnología", productKind: "pilar",
  metadataTitle: "Rutas de programación, cloud e IA | Cursos Estudia y Trabaja",
  eyebrow: "PROGRAMACIÓN · CLOUD · INTELIGENCIA ARTIFICIAL",
  headline: "Construye tu futuro en tecnología", highlight: "del primer código a tus propios proyectos",
  description: "Empieza por Python, desarrollo web, cloud o inteligencia artificial. Después explora seguridad, redes, robótica e ingeniería. Encuentra tu ruta, aprende las bases y avanza a tu ritmo.",
  paidHeadline: "Tus rutas de tecnología están disponibles", paidHighlight: "elige tu próximo proyecto",
  paidDescription: "Tu acceso está activo. Elige una ruta, explora sus cursos y abre el material directamente desde aquí.",
  fact: "Código, proyectos y nuevas habilidades",
  imageLabel: "De tu primera línea de código a crear soluciones", imageTopics: "Programación · Cloud · IA · Ingeniería",
  heroImage: "/images/campaigns/tecnologia/hero.webp", heroAlt: "Portátil con código de programación abierto en pantalla",
  creditsUrl: "/images/campaigns/tecnologia/credits.html",
  accent: "#047857", hover: "#065f46", tint: "#d1fae5", background: "#f0fdf4",
  routes: TECHNOLOGY_ROUTES, counts: countSnapshot.counts, catalogTotal: countSnapshot.catalogTotal,
};
