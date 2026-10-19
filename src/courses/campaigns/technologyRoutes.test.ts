import { describe, expect, it } from "vitest";
import { TECHNOLOGY_ROUTES } from "./technologyRoutes";
import { STUDY_ROUTES, coursesForStudyRoute, groupStudyCourses } from "./studyRoutes";

const assets = import.meta.glob("/public/images/campaigns/tecnologia/*", { query: "?url", import: "default", eager: true });

const matches = (id: string, titles: string[]) => coursesForStudyRoute(
  titles.map((name_del_curso, id) => ({ id, name_del_curso })),
  TECHNOLOGY_ROUTES.find((route) => route.id === id)!,
).map((course) => course.name_del_curso);

describe("rutas del pilar de tecnología", () => {
  it("cada ruta tiene una imagen distinta tanto en Tecnología como en Excel", () => {
    for (const routes of [TECHNOLOGY_ROUTES, STUDY_ROUTES]) {
      expect(new Set(routes.map((route) => route.image)).size).toBe(routes.length);
    }
  });
  it("prioriza programación, cloud e IA y conserva el resto del pilar al final", () => {
    const firstSecondary = TECHNOLOGY_ROUTES.findIndex((route) => !route.featured);
    expect(TECHNOLOGY_ROUTES.slice(0, firstSecondary).every((route) => route.featured)).toBe(true);
    expect(TECHNOLOGY_ROUTES.slice(firstSecondary).every((route) => !route.featured)).toBe(true);
    expect(TECHNOLOGY_ROUTES.findIndex((route) => route.id === "machine-learning")).toBeLessThan(firstSecondary);
    expect(TECHNOLOGY_ROUTES[TECHNOLOGY_ROUTES.length - 1]?.id).toBe("construccion");
  });
  it("separa Java de JavaScript y reconoce C# y C++ sin confundirlos", () => {
    const names = ["Java desde cero", "JavaScript avanzado", "C# con .NET", "C++ completo", "Programación en C"];
    expect(matches("java", names)).toEqual([names[0]]);
    expect(matches("javascript", names)).toEqual([names[1]]);
    expect(matches("dotnet", names)).toEqual([names[2]]);
    expect(matches("cpp", names)).toEqual([names[3], names[4]]);
  });
  it("reconoce aliases y permite pertenecer a varias rutas", () => {
    const names = ["Django desde cero", "React Native completo", "Docker en AWS", "Introducción a Machine Learning", "Curso de Revit BIM"];
    expect(matches("python", names)).toEqual([names[0]]);
    expect(matches("react", names)).toEqual([names[1]]);
    expect(matches("movil", names)).toEqual([names[1]]);
    expect(matches("aws", names)).toEqual([names[2]]);
    expect(matches("contenedores", names)).toEqual([names[2]]);
    expect(matches("machine-learning", names)).toEqual([names[3]]);
    expect(matches("revit", names)).toEqual([names[4]]);
  });
  it("no clasifica por autor ni por una subcategoría amplia", () => {
    const definition = TECHNOLOGY_ROUTES.find((route) => route.id === "python")!;
    expect(coursesForStudyRoute([{ id: 1, name_del_curso: "Organiza tu tiempo", author: "Python Academy", subcategoria: "Python" }], definition)).toEqual([]);
    expect(matches("java", ["Arquitectura y construcción"])).toEqual([]);
  });
  it("comparte los niveles orientativos y la búsqueda sin acentos", () => {
    const groups = groupStudyCourses([
      { id: 1, name_del_curso: "Python básico", author: "José" },
      { id: 2, name_del_curso: "Python avanzado", author: "Otra" },
    ], "jose");
    expect(groups.map((group) => group.id)).toEqual(["initial"]);
  });
  it("todas las rutas tienen un recurso local descargado y un identificador único", () => {
    expect(new Set(TECHNOLOGY_ROUTES.map((route) => route.id)).size).toBe(TECHNOLOGY_ROUTES.length);
    for (const route of TECHNOLOGY_ROUTES) {
      expect(assets, route.image).toHaveProperty(`/public${route.image}`);
      expect(route.terms.global).toBe(false);
    }
  });
});
