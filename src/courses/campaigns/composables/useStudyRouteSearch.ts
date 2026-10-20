import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { IPaginatedCourses } from "../../../services/CategorieService";
import type { ICategoryCourseDetail } from "../../../types/Categorie";
import type { StudyCampaignConfig } from "../config/studyCampaignConfig";
import { coursesForStudyRoute, normalizeStudyText, studyCourseKey, uniqueStudyCourses } from "../routes/studyRoutes";
import type { StudyRouteDefinition } from "../routes/studyRoutes";
import { STUDY_ROUTE_QUERIES } from "../routes/studyRouteQueries";

export type StudyCourseSearchRequest = (
  sourceCategoryId: number, query: string, offset: number, isCurrent: () => boolean,
) => Promise<IPaginatedCourses>;
interface SearchGroup {
  categoryId: number;
  title: string;
  items: ICategoryCourseDetail[];
  total: number;
  page: number;
  loading: boolean;
  error: boolean;
  selectedItem: ICategoryCourseDetail | null;
  selectionError: boolean;
}
const sourceTitles: Record<number, string> = {
  100: "Negocios y Éxito Profesional", 200: "Tecnología, Código e Ingeniería", 300: "Creatividad y Bienestar",
};
const pageSize = 10;

export interface SelectedStudyCourse { title: string; author: string }
export function matchesSelectedStudyCourse(course: ICategoryCourseDetail, selected: SelectedStudyCourse | null,
  candidates: ICategoryCourseDetail[] = [course]) {
  if (!selected) return false;
  const title = normalizeStudyText(selected.title);
  const sameTitle = (item: ICategoryCourseDetail) => normalizeStudyText(item.name_del_curso ?? "") === title;
  const sameAuthor = (item: ICategoryCourseDetail) => normalizeStudyText(item.author ?? "") === normalizeStudyText(selected.author);
  if (!sameTitle(course)) return false;
  // The legacy search index can have a different author than the current catalog.
  return !selected.author || !candidates.some((item) => sameTitle(item) && sameAuthor(item)) || sameAuthor(course);
}

export function useStudyRouteSearch(config: StudyCampaignConfig, request: StudyCourseSearchRequest,
  selectedCourse: () => SelectedStudyCourse | null = () => null) {
  const query = ref("");
  const normalizedQuery = computed(() => normalizeStudyText(query.value));
  const canSearchCourses = computed(() => query.value.trim().length >= 2);
  const sources = [...new Set(config.routes.map((route) => route.sourceCategoryId ?? config.categoryId))];
  const groups = ref<SearchGroup[]>(sources.map((categoryId) => ({
    categoryId, title: sources.length === 1 ? config.title : sourceTitles[categoryId] ?? `Pilar ${categoryId}`,
    items: [], total: 0, page: 1, loading: false, error: false, selectedItem: null, selectionError: false,
  })));
  const cache = new Map<string, IPaginatedCourses>();
  const versions = new Map<number, number>();
  let active = true;
  let generation = 0;
  let debounce: ReturnType<typeof setTimeout> | undefined;

  function routesForCourse(course: ICategoryCourseDetail, categoryId: number) {
    return config.routes.filter((route) => (route.sourceCategoryId ?? config.categoryId) === categoryId
      && coursesForStudyRoute([course], route).length > 0);
  }
  const resultGroups = computed(() => groups.value.map((group) => {
    const courses = uniqueStudyCourses([...(group.selectedItem ? [group.selectedItem] : []), ...group.items]);
    return {
      ...group, pages: Math.max(1, Math.ceil(group.total / pageSize)),
      results: courses.map((course) => ({ course, routes: routesForCourse(course, group.categoryId),
        selected: matchesSelectedStudyCourse(course, selectedCourse(), courses),
      })).sort((a, b) => Number(b.selected) - Number(a.selected)),
    };
  }));
  const recommendations = computed(() => {
    const counts = new Map<string, number>();
    for (const group of resultGroups.value) for (const result of group.results) for (const route of result.routes)
      counts.set(route.id, (counts.get(route.id) ?? 0) + 1);
    return counts;
  });
  const selectedRouteIds = computed(() => new Set(resultGroups.value.flatMap((group) => group.results
    .filter((result) => result.selected)
    .flatMap((result) => result.routes.map((route) => route.id)))));
  function directMatchRank(route: StudyRouteDefinition) {
    const q = normalizedQuery.value;
    if (!q) return 0;
    const words = q.split(" ");
    const title = normalizeStudyText(route.title);
    if (words.every((word) => title.includes(word))) return 2;
    const aliases = route.queryTerms ?? STUDY_ROUTE_QUERIES[route.id] ?? [];
    const text = normalizeStudyText([route.title, route.summary, ...aliases].join(" "));
    return words.every((word) => text.includes(word)) || route.terms.test(q) ? 1 : 0;
  }
  const matchedRoutes = computed(() => config.routes.map((route, order) => ({
    id: route.id, order, rank: directMatchRank(route), matchingCourses: recommendations.value.get(route.id) ?? 0,
    selectedCourseMatch: selectedRouteIds.value.has(route.id),
  })).filter((route) => selectedCourse() || !normalizedQuery.value || route.rank > 0 || route.matchingCourses > 0)
    .sort((a, b) => normalizedQuery.value
      ? Number(b.selectedCourseMatch) - Number(a.selectedCourseMatch)
        || (selectedCourse() ? a.order - b.order : b.rank - a.rank || b.matchingCourses - a.matchingCourses || a.order - b.order)
      : a.order - b.order));

  async function loadGroup(categoryId: number, page = 1, retry = false) {
    const group = groups.value.find((item) => item.categoryId === categoryId);
    if (!active || !canSearchCourses.value || !group || page < 1 || page > Math.max(1, Math.ceil(group.total / pageSize))) return;
    const currentGeneration = generation;
    const version = (versions.get(categoryId) ?? 0) + 1;
    versions.set(categoryId, version);
    const isCurrent = () => active && currentGeneration === generation && versions.get(categoryId) === version;
    const search = query.value.trim();
    const offset = (page - 1) * pageSize;
    const key = JSON.stringify([categoryId, search, offset]);
    group.page = page;
    group.items = [];
    group.loading = true;
    group.error = false;
    group.selectedItem = null;
    group.selectionError = false;
    try {
      const response = (!retry && cache.get(key)) || await request(categoryId, search, offset, isCurrent);
      if (!isCurrent()) return;
      if (!Array.isArray(response.items) || !Number.isInteger(response.total) || response.total < 0
        || response.offset !== offset || response.items.length > pageSize || (offset < response.total && !response.items.length))
        throw new Error("Resultados no disponibles");
      cache.set(key, response);
      group.items = uniqueStudyCourses(response.items);
      group.total = response.total;
      const selected = selectedCourse();
      if (selected && !group.items.some((course) => matchesSelectedStudyCourse(course, selected, group.items))
        && normalizeStudyText(search) !== normalizeStudyText(selected.title)) {
        try {
          const selectedKey = JSON.stringify([categoryId, selected.title, 0]);
          const selectedPage = (!retry && cache.get(selectedKey)) || await request(categoryId, selected.title, 0, isCurrent);
          if (!isCurrent()) return;
          if (!Array.isArray(selectedPage.items) || !Number.isInteger(selectedPage.total) || selectedPage.total < 0
            || selectedPage.offset !== 0 || selectedPage.items.length > pageSize || (selectedPage.total > 0 && !selectedPage.items.length))
            throw new Error("Curso seleccionado no disponible");
          cache.set(selectedKey, selectedPage);
          const match = selectedPage.items.find((course) => matchesSelectedStudyCourse(course, selected, selectedPage.items));
          if (match && !group.items.some((course) => studyCourseKey(course) === studyCourseKey(match))) group.selectedItem = match;
        } catch {
          if (isCurrent()) group.selectionError = true;
        }
      }
    } catch {
      if (isCurrent()) group.error = true;
    } finally {
      if (isCurrent()) group.loading = false;
    }
  }
  watch([query, selectedCourse], () => {
    generation++;
    clearTimeout(debounce);
    for (const group of groups.value) {
      group.items = []; group.total = 0; group.page = 1; group.error = false; group.loading = canSearchCourses.value;
      group.selectedItem = null; group.selectionError = false;
    }
    if (canSearchCourses.value) debounce = setTimeout(() => {
      for (const categoryId of sources) void loadGroup(categoryId);
    }, 300);
  }, { flush: "sync" });
  function clearSearch() { query.value = ""; }
  onBeforeUnmount(() => { active = false; generation++; clearTimeout(debounce); });
  return { query, normalizedQuery, canSearchCourses, matchedRoutes, resultGroups, loadGroup, clearSearch };
}
