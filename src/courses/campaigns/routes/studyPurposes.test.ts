import { describe, expect, it } from "vitest";
import type { ICategoryCourseDetail } from "../../../types/Categorie";
import { EXCEL_PURPOSES } from "./studyPurposes";
import { STUDY_ROUTES, coursesForStudyPurpose } from "./studyRoutes";

const course = (id: number, name: string): ICategoryCourseDetail => ({ id, name_del_curso: name, author: "Autor" });
const courses = [
  course(1, "CURSO de EXCEL para la EMPRESA"),
  course(2, "Certificación en Excel"),
  course(3, "7.Curso de Inventarios con Excel - Fundamentos para Vender por Internet"),
  course(4, "28.-Curso de Excel para principiantes"),
  course(5, "Curso Completo EXCEL"),
];
const ids = (purposeId: string) => coursesForStudyPurpose(courses, EXCEL_PURPOSES, purposeId).map((item) => item.id);

describe("objetivos de la Ruta Excel", () => {
  it("se presentan en el orden acordado y solo en la ruta de Excel", () => {
    expect(EXCEL_PURPOSES.map((purpose) => purpose.title)).toEqual([
      "Para mi trabajo actual",
      "Para conseguir empleo",
      "Para mi negocio o emprendimiento",
      "Para estudiar o uso personal",
    ]);
    expect(STUDY_ROUTES.filter((route) => route.purposes).map((route) => route.id)).toEqual(["excel"]);
  });

  it("clasifica por título y muestra los cursos generales en todos los objetivos", () => {
    expect(ids("trabajo")).toEqual([1, 5]);
    expect(ids("empleo")).toEqual([2, 5]);
    expect(ids("negocio")).toEqual([3, 5]);
    expect(ids("personal")).toEqual([3, 4, 5]);
    expect(ids("inexistente")).toEqual([]);
  });
});
