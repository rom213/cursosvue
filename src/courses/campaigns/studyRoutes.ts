import type { ICategoryCourseDetail } from "../../types/Categorie";
import type { IPaginatedCourses } from "../../services/CategorieService";

export const STUDY_CATEGORY_ID = 103;
export const STUDY_CAMPAIGN_ID = "datos_oficina_103";

export type StudyLevel =
  | "initial"
  | "intermediate"
  | "advanced"
  | "complete"
  | "unspecified";
export interface StudyRouteDefinition {
  id: string;
  title: string;
  summary: string;
  goal: string;
  image: string;
  imageAlt: string;
  imageKind: "logo" | "report";
  accent: string;
  featured?: boolean;
  terms: RegExp;
  subcategoryTerms?: RegExp;
  steps: [string, string, string];
}

const images = {
  excel: {
    image: "/images/campaigns/datos-oficina/excel.svg",
    imageAlt: "Logotipo de Microsoft Excel",
    imageKind: "logo",
  },
  "power-bi": {
    image: "/images/campaigns/datos-oficina/power-bi.svg",
    imageAlt: "Logotipo de Microsoft Power BI",
    imageKind: "logo",
  },
  "analisis-datos": {
    image: "/images/campaigns/datos-oficina/analisis-datos.webp",
    imageAlt:
      "Panel de análisis de ventas con métricas, gráficos y filtros de Power BI",
    imageKind: "report",
  },
  office: {
    image: "/images/campaigns/datos-oficina/office-tools.webp",
    imageAlt:
      "Logotipos de las aplicaciones de Microsoft Office, incluidos Word, Excel y PowerPoint",
    imageKind: "logo",
  },
  "business-intelligence": {
    image: "/images/campaigns/datos-oficina/business-intelligence.webp",
    imageAlt:
      "Panel de inteligencia de negocios con indicadores de rentabilidad, ventas y clientes",
    imageKind: "report",
  },
  sap: {
    image: "/images/campaigns/datos-oficina/sap.svg",
    imageAlt: "Logotipo de SAP",
    imageKind: "logo",
  },
  tableau: {
    image: "/images/campaigns/datos-oficina/tableau.webp",
    imageAlt: "Logotipo de Tableau",
    imageKind: "logo",
  },
  "looker-studio": {
    image: "/images/campaigns/datos-oficina/looker-studio.svg",
    imageAlt:
      "Logotipo de Google Data Studio, la herramienta conocida como Looker Studio",
    imageKind: "logo",
  },
  "google-workspace": {
    image: "/images/campaigns/datos-oficina/google-workspace.svg",
    imageAlt:
      "Logotipos de Gmail, Calendar, Drive, Docs y Meet de Google Workspace",
    imageKind: "logo",
  },
  access: {
    image: "/images/campaigns/datos-oficina/access.svg",
    imageAlt: "Logotipo de Microsoft Access para bases de datos",
    imageKind: "logo",
  },
  productividad: {
    image: "/images/campaigns/datos-oficina/productividad.webp",
    imageAlt: "Logotipo de Notion, herramienta de organización y productividad",
    imageKind: "logo",
  },
  "gestion-proyectos": {
    image: "/images/campaigns/datos-oficina/gestion-proyectos.svg",
    imageAlt: "Logotipo de Microsoft Project para gestión de proyectos",
    imageKind: "logo",
  },
  automatizacion: {
    image: "/images/campaigns/datos-oficina/excel.svg",
    imageAlt:
      "Logotipo de Microsoft Excel, herramienta para las rutas de macros y VBA",
    imageKind: "logo",
  },
  "finanzas-contabilidad": {
    image: "/images/campaigns/datos-oficina/finanzas-contabilidad.webp",
    imageAlt:
      "Panel de gastos corporativos con presupuestos, costes y variaciones financieras",
    imageKind: "report",
  },
} satisfies Record<
  string,
  Pick<StudyRouteDefinition, "image" | "imageAlt" | "imageKind">
>;

export const STUDY_ROUTES: StudyRouteDefinition[] = [
  {
    id: "excel",
    title: "Ruta Excel",
    featured: true,
    accent: "#15803d",
    ...images["excel"],
    summary: "De las primeras fórmulas al análisis y la automatización.",
    goal: "Organiza información, resuelve cálculos y construye reportes útiles para tu trabajo.",
    terms: /\bexcel\b|\bvba\b/,
    subcategoryTerms: /excel.*microsoft|microsoft.*excel/,
    steps: [
      "Comprende hojas, formatos y fórmulas.",
      "Trabaja con funciones, tablas y gráficos.",
      "Explora análisis avanzado, macros y VBA.",
    ],
  },
  {
    id: "power-bi",
    title: "Ruta Power BI",
    featured: true,
    accent: "#a16207",
    ...images["power-bi"],
    summary: "Transforma datos en reportes visuales y decisiones.",
    goal: "Prepara y modela datos para construir informes con Power BI y profundizar en DAX.",
    terms: /power\s*bi\b|\bdax\b/,
    steps: [
      "Conoce Power BI e importa tus datos.",
      "Prepara información y construye modelos y reportes.",
      "Profundiza en DAX y optimización.",
    ],
  },
  {
    id: "analisis-datos",
    title: "Ruta Análisis de datos",
    featured: true,
    accent: "#2563eb",
    ...images["analisis-datos"],
    summary: "Aprende a preparar, explorar e interpretar información.",
    goal: "Convierte datos en conclusiones usando herramientas de preparación, modelado y visualización.",
    terms:
      /analis[ia]s.*(datos|data|negocio)|analista|analitica|analytics|power\s*(query|pivot)|tablas? dinamicas?|modela(?:do|r)?\s+(?:de\s+)?datos|bigquery|data warehouse|estadistica/,
    subcategoryTerms: /data.*analitica|big.*data/,
    steps: [
      "Comprende los datos y las preguntas que quieres resolver.",
      "Limpia, organiza y explora la información.",
      "Modela datos y comunica tus conclusiones.",
    ],
  },
  {
    id: "office",
    title: "Ruta Office",
    featured: true,
    accent: "#c2410c",
    ...images["office"],
    summary: "Documentos, presentaciones y colaboración en el trabajo.",
    goal: "Desarrolla habilidades con las herramientas de Microsoft para tus tareas de oficina.",
    terms:
      /\boffice\b|\bmicrosoft\b|\bexcel\b|\bword\b|power\s*point|\boutlook\b|\bonenote\b|\bonedrive\b|\bsharepoint\b|\bteams\b|\byammer\b|\baccess\b|\bplanner\b/,
    steps: [
      "Familiarízate con las herramientas de oficina.",
      "Crea documentos, hojas de cálculo y presentaciones.",
      "Mejora tu flujo de trabajo y la colaboración.",
    ],
  },
  {
    id: "business-intelligence",
    title: "Ruta Business Intelligence",
    featured: true,
    accent: "#7c3aed",
    ...images["business-intelligence"],
    summary: "Conecta indicadores, visualización y estrategia de negocio.",
    goal: "Comprende cómo usar reportes e indicadores para apoyar decisiones empresariales.",
    terms:
      /business intelligence|inteligencia (?:de negocios|empresarial)|\bbi\b|dashboard|cuadros? de mando|\bkpis?\b|instrumentacion de datos|metricas|north star|data warehouse/,
    subcategoryTerms: /intelligence.*business|business.*intelligence/,
    steps: [
      "Comprende los fundamentos de inteligencia de negocios.",
      "Diseña indicadores y visualizaciones.",
      "Aplica la información a decisiones y oportunidades.",
    ],
  },
  {
    id: "sap",
    title: "Ruta SAP",
    accent: "#0369a1",
    ...images["sap"],
    summary: "Explora procesos empresariales y módulos de SAP.",
    goal: "Conoce las herramientas de SAP para finanzas, materiales y operaciones.",
    terms: /\bsap\b/,
    steps: [
      "Conoce SAP y sus procesos principales.",
      "Explora los módulos según tu área de trabajo.",
      "Profundiza en reportes y aplicaciones especializadas.",
    ],
  },
  {
    id: "tableau",
    title: "Ruta Tableau",
    accent: "#0891b2",
    ...images["tableau"],
    summary: "Visualización y comunicación de datos.",
    goal: "Aprende a presentar información con Tableau y a contar historias con tus datos.",
    terms: /\btableau\b/,
    steps: [
      "Conoce la herramienta y conecta datos.",
      "Construye visualizaciones para explorar información.",
      "Comunica hallazgos mediante reportes y storytelling.",
    ],
  },
  {
    id: "looker-studio",
    title: "Ruta Looker Studio",
    accent: "#4338ca",
    ...images["looker-studio"],
    summary: "Reportes y dashboards con las herramientas de Google.",
    goal: "Explora Looker Studio y los cursos de Google Data Studio para crear reportes.",
    terms: /looker|google data studio/,
    steps: [
      "Conoce la herramienta y sus fuentes de información.",
      "Organiza métricas y construye visualizaciones.",
      "Diseña reportes para compartir tus resultados.",
    ],
  },
  {
    id: "google-workspace",
    title: "Ruta Google Workspace",
    accent: "#b45309",
    ...images["google-workspace"],
    summary: "Colabora con documentos, hojas y herramientas de Google.",
    goal: "Mejora tu trabajo diario con Gmail, Drive, Sheets y las herramientas de Google Suite.",
    terms:
      /g[ -]?suite|google (?:workspace|suite|sheets|spreadsheets|forms|drive)|\bgmail\b|\bdocs\b/,
    steps: [
      "Conoce las herramientas y organiza tu espacio de trabajo.",
      "Crea, comparte y colabora con información.",
      "Explora administración y funciones especializadas.",
    ],
  },
  {
    id: "access",
    title: "Ruta Access",
    accent: "#be123c",
    ...images["access"],
    summary: "Organiza y consulta información en bases de datos.",
    goal: "Explora Microsoft Access para estructurar información y trabajar con bases de datos.",
    terms: /\baccess\b/,
    steps: [
      "Conoce las bases de datos y la herramienta.",
      "Organiza información y realiza consultas.",
      "Profundiza en las funciones avanzadas de Access.",
    ],
  },
  {
    id: "productividad",
    title: "Ruta Productividad y colaboración",
    accent: "#0f766e",
    ...images["productividad"],
    summary: "Organiza tareas y mejora el trabajo en equipo.",
    goal: "Encuentra herramientas para gestionar tu día y colaborar con otras personas.",
    terms:
      /productividad|\bnotion\b|\btrello\b|\bplanner\b|\bteams\b|\bslack\b|\bzoom\b|\bonenote\b|\boutlook\b|\bgmail\b|\byammer\b|\bsharepoint\b|trabajo en equipo|asistencia virtual/,
    steps: [
      "Organiza tareas, notas y comunicaciones.",
      "Coordina el trabajo y comparte información.",
      "Optimiza tus rutinas con herramientas especializadas.",
    ],
  },
  {
    id: "gestion-proyectos",
    title: "Ruta Gestión de proyectos",
    accent: "#4f46e5",
    ...images["gestion-proyectos"],
    summary: "Planificación, seguimiento y organización de proyectos.",
    goal: "Explora herramientas para planificar actividades, coordinar tareas y evaluar proyectos.",
    terms:
      /\bproject\b|\bprimavera\b|\bplanner\b|\btrello\b|proyectos de inversion/,
    steps: [
      "Define actividades y objetivos del proyecto.",
      "Planifica tareas y recursos con herramientas de gestión.",
      "Explora seguimiento y evaluación de proyectos.",
    ],
  },
  {
    id: "automatizacion",
    title: "Ruta Automatización",
    accent: "#9333ea",
    ...images["automatizacion"],
    summary: "Macros, VBA y herramientas para agilizar tareas.",
    goal: "Explora la automatización de hojas de cálculo y el procesamiento de información.",
    terms: /automatiza|\bmacros?\b|\bvba\b|power\s*query/,
    steps: [
      "Comprende las tareas que puedes automatizar.",
      "Explora macros y preparación de datos.",
      "Profundiza en VBA y soluciones avanzadas.",
    ],
  },
  {
    id: "finanzas-contabilidad",
    title: "Ruta Análisis financiero y contabilidad",
    accent: "#166534",
    ...images["finanzas-contabilidad"],
    summary:
      "Herramientas para analizar cifras y gestionar información financiera.",
    goal: "Explora hojas de cálculo y contenidos contables aplicados a la información de un negocio.",
    terms:
      /financ|finanz|contab|\bcontadores\b|\bconcar\b|tributari|conciliaciones bancarias|costos|presupuestos|planillas|factura electronica/,
    steps: [
      "Comprende la información y los fundamentos contables.",
      "Organiza cálculos, registros y reportes.",
      "Explora análisis financiero y aplicaciones especializadas.",
    ],
  },
];

export const STUDY_LEVELS: {
  id: StudyLevel;
  title: string;
  description: string;
}[] = [
  {
    id: "initial",
    title: "Inicial",
    description:
      "Comienza con los fundamentos y familiarízate con las herramientas.",
  },
  {
    id: "intermediate",
    title: "Intermedio",
    description:
      "Amplía tus habilidades y aplica lo aprendido a nuevas tareas.",
  },
  {
    id: "advanced",
    title: "Avanzado",
    description: "Profundiza en contenidos que indican un enfoque avanzado.",
  },
  {
    id: "complete",
    title: "Cursos completos",
    description:
      "Cursos que anuncian una formación completa o abarcan varios niveles.",
  },
  {
    id: "unspecified",
    title: "Cursos complementarios",
    description: "Cursos complementarios",
  },
];

export function normalizeStudyText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function studyCourseKey(course: ICategoryCourseDetail) {
  return course.id != null
    ? `id:${course.id}`
    : `name:${normalizeStudyText(course.name_del_curso ?? "")}:${normalizeStudyText(course.author ?? "")}`;
}

export function uniqueStudyCourses(courses: ICategoryCourseDetail[]) {
  const seen = new Set<string>();
  return courses.filter((course) => {
    const key = studyCourseKey(course);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function studyCourseLevel(course: ICategoryCourseDetail): StudyLevel {
  const title = normalizeStudyText(course.name_del_curso ?? "");
  const initial =
    /\bbasic[oa]s?\b|\binicial\b|principiant|prncipiant|introduccion|fundamentos|desde (?:cero|0)|\bde (?:cero|0)\b|\b(?:basics?|beginners?|introductory|fundamentals)\b|from (?:zero|scratch)/;
  const intermediate = /\bintermedi[oa]s?\b|\bintermediate\b/;
  const advanced =
    /\bavanzad[oa]s?\b|\bexpert[oa]s?\b|\badvanced\b|\bexperts?\b/;
  // Una formación completa o multinivel se resuelve antes de la dificultad.
  if (
    /\bcomplet[oa]s?\b|\bcomplete\b|\btotal\b|\bde (?:cero|0) a (?:100|profesional|analista)\b|desde (?:cero|0) (?:hasta|a) (?:profesional|analista)/.test(
      title,
    ) ||
    (initial.test(title) &&
      (intermediate.test(title) || advanced.test(title))) ||
    (intermediate.test(title) && advanced.test(title))
  )
    return "complete";
  if (advanced.test(title)) return "advanced";
  if (intermediate.test(title)) return "intermediate";
  if (initial.test(title)) return "initial";
  return "unspecified";
}

export function coursesForStudyRoute(
  courses: ICategoryCourseDetail[],
  route: StudyRouteDefinition,
) {
  return uniqueStudyCourses(
    courses.filter((course) => {
      const title = normalizeStudyText(course.name_del_curso ?? "");
      if (route.terms.test(title)) return true;
      // Las subcategorías son amplias: solo sustituyen un título ausente.
      return (
        !title &&
        Boolean(
          route.subcategoryTerms?.test(
            normalizeStudyText(course.subcategoria ?? ""),
          ),
        )
      );
    }),
  );
}

export function groupStudyCourses(
  courses: ICategoryCourseDetail[],
  search = "",
) {
  const query = normalizeStudyText(search);
  const filtered = uniqueStudyCourses(courses).filter((course) =>
    normalizeStudyText(
      `${course.name_del_curso ?? ""} ${course.author ?? ""}`,
    ).includes(query),
  );
  return STUDY_LEVELS.map((level) => ({
    ...level,
    courses: filtered.filter((course) => studyCourseLevel(course) === level.id),
  })).filter((level) => level.courses.length > 0);
}

/** Solo entrega un catálogo completo. Un fallo de cualquier página conserva el error. */
export async function loadStudyCatalog(
  fetchPage: (offset: number, limit: number) => Promise<IPaginatedCourses>,
  isCurrent: () => boolean = () => true,
): Promise<ICategoryCourseDetail[] | null> {
  const items: ICategoryCourseDetail[] = [];
  let total: number | undefined;
  let offset = 0;
  do {
    if (!isCurrent()) return null;
    const page = await fetchPage(offset, 100);
    if (!isCurrent()) return null;
    if (
      !Array.isArray(page.items) ||
      !Number.isInteger(page.total) ||
      page.total < 0 ||
      page.offset !== offset ||
      (total !== undefined && total !== page.total) ||
      (offset < page.total && page.items.length === 0) ||
      offset + page.items.length > page.total
    ) {
      throw new Error("No se pudo obtener un catálogo completo y consistente.");
    }
    total = page.total;
    items.push(...page.items);
    offset += page.items.length;
  } while (offset < total);
  const unique = uniqueStudyCourses(items);
  if (unique.length !== total)
    throw new Error(
      "El catálogo contiene páginas repetidas o cursos duplicados.",
    );
  return unique;
}
