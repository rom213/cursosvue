export interface StudyPurpose {
  id: string;
  title: string;
  description: string;
  /** Se evalúa sobre el título normalizado (`normalizeStudyText`). */
  terms: RegExp;
}

// El orden es el que se muestra al abrir la ruta.
export const EXCEL_PURPOSES: readonly StudyPurpose[] = [
  {
    id: "trabajo",
    title: "Para mi trabajo actual",
    description: "Agiliza reportes, cálculos y tareas repetitivas de tu día a día.",
    terms:
      /empresa|oficina|contab|financ|ingenier|\bmacros?\b|\bvba\b|automatiza|\breportes?\b|dashboard|power (?:query|pivot)|productividad|administrativ/,
  },
  {
    id: "empleo",
    title: "Para conseguir empleo",
    description: "Prepárate con las habilidades de Excel que piden las empresas.",
    terms:
      /certificaci|entrevista|empleo|analista|especialista|carrera|profesional|de 0 a 100|grandmaster|expert[oa]/,
  },
  {
    id: "negocio",
    title: "Para mi negocio o emprendimiento",
    description: "Controla inventarios, ventas, costos y finanzas de tu negocio.",
    terms:
      /negocio|emprend|inventario|\bventas?\b|vender|\bpymes?\b|costos|presupuesto|factura/,
  },
  {
    id: "personal",
    title: "Para estudiar o uso personal",
    description: "Aprende desde cero a tu ritmo, para tus estudios o tu día a día.",
    terms:
      /basic[oa]s?|principiant|introduccion|fundamentos|desde (?:cero|0)|plantillas|personal|estudiante|ejercicios|trucos|atajos/,
  },
];
