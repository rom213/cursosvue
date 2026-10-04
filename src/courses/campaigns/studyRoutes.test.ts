import { describe, expect, it, vi } from "vitest";
import type { ICategoryCourseDetail } from "../../types/Categorie";
import type { IPaginatedCourses } from "../../services/CategorieService";
import {
  STUDY_ROUTES,
  coursesForStudyRoute,
  groupStudyCourses,
  loadStudyCatalog,
  studyCourseLevel,
} from "./studyRoutes";

const course = (
  id: number,
  name: string,
  author = "Autor",
): ICategoryCourseDetail => ({ id, name_del_curso: name, author });
const route = (id: string) => STUDY_ROUTES.find((item) => item.id === id)!;
const page = (
  items: ICategoryCourseDetail[],
  total: number,
  offset = 0,
): IPaginatedCourses => ({ items, total, offset, limit: 100 });

describe("clasificación de las rutas", () => {
  it.each([
    ["Excel básico para principiantes", "initial"],
    ["Power BI Introducción", "initial"],
    ["Excel intermedio", "intermediate"],
    ["Microsoft Word avanzado", "advanced"],
    ["Excel para expertos", "advanced"],
    ["Excel completo", "complete"],
    ["PowerPoint TOTAL Avanzado", "complete"],
    ["Excel básico, intermedio y avanzado", "complete"],
    ["Excel de cero a experto", "complete"],
    ["Power BI Intermedio-Avanzado", "complete"],
    ["PowerPoint de prncipiante a avanzado", "complete"],
    ["Excel from beginner to advanced", "complete"],
    ["Excel advanced", "advanced"],
    ["Excel GrandMaster De 0 a 100", "complete"],
    ["Aprende MS Excel desde CERO a ANALISTA", "complete"],
    ["Tablas dinámicas en Excel", "unspecified"],
    ["Especialista en Power BI", "unspecified"],
  ])("clasifica %s como %s", (name, level) => {
    expect(studyCourseLevel(course(1, name))).toBe(level);
  });

  it("clasifica por título pese a una subcategoría amplia y permite rutas compartidas", () => {
    const courses = [
      {
        ...course(1, "Curso de Word avanzado"),
        subcategoria: "Excel Y Microsoft, Vba",
      },
      course(2, "Introducción a Business Intelligence con PowerBI"),
      course(3, "Análisis de datos con Excel y Power Query"),
      course(4, "Google Sheets avanzado"),
    ];
    expect(
      coursesForStudyRoute(courses, route("excel")).map((item) => item.id),
    ).toEqual([3]);
    expect(
      coursesForStudyRoute(courses, route("office")).map((item) => item.id),
    ).toEqual([1, 3]);
    expect(
      coursesForStudyRoute(courses, route("power-bi")).map((item) => item.id),
    ).toEqual([2]);
    expect(
      coursesForStudyRoute(courses, route("business-intelligence")).map(
        (item) => item.id,
      ),
    ).toEqual([2]);
    expect(
      coursesForStudyRoute(courses, route("analisis-datos")).map(
        (item) => item.id,
      ),
    ).toEqual([3]);
    expect(
      coursesForStudyRoute(courses, route("google-workspace")).map(
        (item) => item.id,
      ),
    ).toEqual([4]);
  });

  it.each([
    ["sap", "SAP MM desde cero"],
    ["tableau", "Visualización con Tableau"],
    ["looker-studio", "Google Data Studio"],
    ["access", "Microsoft Access Intermedio"],
    ["productividad", "Notion para empresas"],
    ["gestion-proyectos", "Curso Project 2023"],
    ["automatizacion", "Macros y VBA"],
    ["finanzas-contabilidad", "Excel para contadores"],
    ["finanzas-contabilidad", "Plantilla Finanzas Personales"],
  ])("reconoce la ruta relacionada %s", (id, name) => {
    expect(coursesForStudyRoute([course(1, name)], route(id))).toHaveLength(1);
  });

  it("elimina duplicados dentro de una ruta y conserva distintos autores", () => {
    const items = [
      course(1, "Excel básico"),
      course(1, "Excel básico"),
      { name_del_curso: "Excel intermedio", author: "A" },
      { name_del_curso: "Excel intermedio", author: "A" },
      { name_del_curso: "Excel intermedio", author: "B" },
    ];
    expect(coursesForStudyRoute(items, route("excel"))).toHaveLength(3);
  });

  it("agrupa todos los cursos sin inventar niveles y busca sin distinguir tildes", () => {
    const items = [
      course(1, "Excel completo"),
      course(2, "Excel básico"),
      course(3, "Tablas dinámicas", "José"),
      course(4, "Excel avanzado"),
    ];
    const groups = groupStudyCourses(items);
    expect(groups.map((group) => group.id)).toEqual([
      "initial",
      "advanced",
      "complete",
      "unspecified",
    ]);
    expect(groups.flatMap((group) => group.courses)).toHaveLength(4);
    expect(groupStudyCourses(items, " jose ")[0]?.courses[0]?.id).toBe(3);
    expect(groupStudyCourses(items, "tablas dinamicas")[0]?.id).toBe(
      "unspecified",
    );
    expect(groupStudyCourses(items, "inexistente")).toEqual([]);
  });
});

describe("catálogo completo del bloque", () => {
  const courses = Array.from({ length: 225 }, (_, index) =>
    course(index + 1, `Excel ${index}`),
  );

  it("recorre más de 100 cursos sin truncar el catálogo", async () => {
    const fetchPage = vi.fn(async (offset: number) =>
      page(courses.slice(offset, offset + 100), courses.length, offset),
    );
    expect(await loadStudyCatalog(fetchPage)).toEqual(courses);
    expect(fetchPage.mock.calls.map(([offset]) => offset)).toEqual([
      0, 100, 200,
    ]);
  });

  it("no entrega resultados parciales si falla una página", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page(courses.slice(0, 100), 225))
      .mockRejectedValueOnce(new Error("Red"));
    await expect(loadStudyCatalog(fetchPage)).rejects.toThrow("Red");
  });

  it("rechaza páginas vacías antes de completar el total", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page(courses.slice(0, 100), 225))
      .mockResolvedValueOnce(page([], 225, 100));
    await expect(loadStudyCatalog(fetchPage)).rejects.toThrow(
      "catálogo completo",
    );
  });

  it("rechaza totales cambiantes para permitir un reintento consistente", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page(courses.slice(0, 100), 225))
      .mockResolvedValueOnce(page(courses.slice(100, 200), 224, 100));
    await expect(loadStudyCatalog(fetchPage)).rejects.toThrow(
      "catálogo completo",
    );
  });

  it("rechaza páginas repetidas aunque indiquen offsets distintos", async () => {
    const firstHundred = courses.slice(0, 100);
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page(firstHundred, 200))
      .mockResolvedValueOnce(page(firstHundred, 200, 100));
    await expect(loadStudyCatalog(fetchPage)).rejects.toThrow("duplicados");
  });

  it("descarta una respuesta obsoleta y no solicita más páginas", async () => {
    let current = true;
    const fetchPage = vi.fn(async () => {
      current = false;
      return page(courses.slice(0, 100), 225);
    });
    expect(await loadStudyCatalog(fetchPage, () => current)).toBeNull();
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("acepta un catálogo realmente vacío", async () => {
    expect(await loadStudyCatalog(async () => page([], 0))).toEqual([]);
  });
});
