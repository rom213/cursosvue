import type { ICategoryCourseDetail } from "../types/Categorie";

export const COURSE_SLUG_MAX_LENGTH = 120;

type CourseLike = Pick<ICategoryCourseDetail, "name_del_curso">;

function trimSlug(value: string): string {
  return value.replace(/^-+|-+$/g, "");
}

function limitSlug(value: string, maxLength = COURSE_SLUG_MAX_LENGTH): string {
  return trimSlug(value.slice(0, maxLength));
}

export function slugifyCourseName(value: string | null | undefined): string {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return limitSlug(normalized) || "curso";
}

export function makeUniqueCourseSlug(
  value: string | null | undefined,
  seen: Map<string, number>,
): string {
  const base = slugifyCourseName(value);
  const nextCount = (seen.get(base) ?? 0) + 1;
  seen.set(base, nextCount);

  if (nextCount === 1) return base;

  const suffix = `-${nextCount}`;
  const prefix = limitSlug(base, COURSE_SLUG_MAX_LENGTH - suffix.length) || "curso";
  return `${prefix}${suffix}`;
}

export function buildCourseSlugLookup<T extends CourseLike>(courses: T[]): Map<string, T> {
  const seen = new Map<string, number>();
  const lookup = new Map<string, T>();

  for (const course of courses) {
    const slug = makeUniqueCourseSlug(course.name_del_curso, seen);
    lookup.set(slug, course);
  }

  return lookup;
}
