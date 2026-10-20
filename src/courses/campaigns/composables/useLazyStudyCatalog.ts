import { computed, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "../../../services/ApiService";
import type { IPaginatedCourses, IFacetsResult, IFacetSubcategoriaItem, IFacetAutorItem } from "../../../services/CategorieService";
import type { ICategoryCourseDetail } from "../../../types/Categorie";
import { coursesForStudyRoute, loadStudyCatalog, normalizeStudyText, uniqueStudyCourses } from "../routes/studyRoutes";
import type { StudyRouteDefinition } from "../routes/studyRoutes";
import { STUDY_ROUTE_QUERIES } from "../routes/studyRouteQueries";

interface RouteState {
  items: ICategoryCourseDetail[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
}

export function useLazyStudyCatalog(categoryId: number) {
  const routeStates = ref<Record<string, RouteState>>({});
  const catalogItems = ref<ICategoryCourseDetail[]>([]);
  const catalogTotal = ref(0);
  const catalogPage = ref(1);
  const catalogPageSize = 10;
  const catalogSearch = ref("");
  const catalogAuthor = ref("");
  const catalogEnabled = ref(false);
  const catalogLoading = ref(false);
  const catalogError = ref(false);
  const authors = ref<string[]>([]);
  const authorsLoading = ref(false);
  const authorsError = ref(false);
  const catalogPages = computed(() => Math.max(1, Math.ceil(catalogTotal.value / catalogPageSize)));
  const catalogCache = new Map<string, IPaginatedCourses>();
  const pendingRoutes = new Map<string, Promise<void>>();
  const subcategories = new Map<number, Promise<IFacetSubcategoriaItem[]>>();
  let authorsLoaded = false;
  let active = true;
  let catalogSequence = 0;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let running = 0;
  const queue: (() => void)[] = [];

  // Limit requests across routes, facets and catalog, including rapid route changes.
  async function limited<T>(job: () => Promise<T>): Promise<T> {
    if (running >= 3) await new Promise<void>((resolve) => queue.push(resolve));
    else running++;
    try {
      if (!active) throw new Error("Vista cerrada");
      return await job();
    } finally {
      const next = queue.shift();
      if (next) next();
      else running--;
    }
  }
  async function getPage(params: URLSearchParams, isCurrent: () => boolean = () => active, sourceCategoryId = categoryId) {
    return limited(async () => {
      if (!isCurrent()) throw new Error("Consulta cancelada");
      const response = await ApiService.get<IPaginatedCourses>(`api/category/${sourceCategoryId}/courses?${params}`);
      return response.data;
    });
  }
  async function getFacets<T>(by: "subcategoria" | "autor", sourceCategoryId = categoryId): Promise<T[]> {
    const items: T[] = [];
    let offset = 0;
    let total: number;
    do {
      const page = await limited(async () => (await ApiService.get<IFacetsResult<T>>(
        `api/category/${sourceCategoryId}/facets?by=${by}&offset=${offset}&limit=200`,
      )).data);
      if (!Array.isArray(page.items) || !Number.isInteger(page.total) || page.total < 0 || (offset < page.total && !page.items.length))
        throw new Error("No se pudieron cargar los filtros");
      total = page.total;
      items.push(...page.items);
      offset += page.items.length;
    } while (active && offset < total);
    return items;
  }
  function stateFor(id: string): RouteState {
    return routeStates.value[id] ?? { items: [], loaded: false, loading: false, error: false };
  }
  function loadRoute(definition: StudyRouteDefinition, retry = false): Promise<void> {
    if (!retry && stateFor(definition.id).loaded) return Promise.resolve();
    const pending = pendingRoutes.get(definition.id);
    if (pending) return pending;
    routeStates.value[definition.id] = { items: [], loaded: false, loading: true, error: false };
    const task = (async () => {
      let failed = false;
      try {
        const sourceCategoryId = definition.sourceCategoryId ?? categoryId;
        const fragments = definition.queryTerms ?? STUDY_ROUTE_QUERIES[definition.id];
        if (!fragments?.length) throw new Error("Ruta sin consultas definidas");
        // Drop redundant fragments; e.g. 'macro' already includes 'macros'.
        const queries = [...new Set(fragments)].filter((q, index, all) => !all.some((other, i) => i !== index && q.includes(other)));
        const selectors: Record<string, string>[] = queries.map((q) => ({ q }));
        if (definition.subcategoryTerms) {
          if (!subcategories.has(sourceCategoryId)) {
            subcategories.set(sourceCategoryId, getFacets<IFacetSubcategoriaItem>("subcategoria", sourceCategoryId).catch((error) => {
              subcategories.delete(sourceCategoryId);
              throw error;
            }));
          }
          for (const item of await subcategories.get(sourceCategoryId)!) {
            if (definition.subcategoryTerms.test(normalizeStudyText(item.subcategoria))) selectors.push({ subcategoria: item.subcategoria });
          }
        }
        const isCurrent = () => active && !failed;
        const results = await Promise.all(selectors.map(async (selector) => {
          try {
            return await loadStudyCatalog(
              (offset, limit) => getPage(new URLSearchParams({ limit: String(limit), offset: String(offset), ...selector }), isCurrent, sourceCategoryId),
              isCurrent,
            );
          } catch (error) {
            failed = true;
            throw error;
          }
        }));
        if (!active) return;
        const items = coursesForStudyRoute(uniqueStudyCourses(results.flatMap((items) => items ?? [])), definition);
        routeStates.value[definition.id] = { items, loaded: true, loading: false, error: false };
      } catch {
        if (active) routeStates.value[definition.id] = { items: [], loaded: false, loading: false, error: true };
      }
    })().finally(() => pendingRoutes.delete(definition.id));
    pendingRoutes.set(definition.id, task);
    return task;
  }
  async function loadCatalog(retry = false) {
    if (!active) return;
    catalogEnabled.value = true;
    clearTimeout(debounce);
    const sequence = ++catalogSequence;
    const params = new URLSearchParams({ limit: String(catalogPageSize), offset: String((catalogPage.value - 1) * catalogPageSize) });
    if (catalogSearch.value.trim()) params.set("q", catalogSearch.value.trim());
    if (catalogAuthor.value) params.set("autor", catalogAuthor.value);
    const key = params.toString();
    catalogLoading.value = true;
    catalogError.value = false;
    catalogItems.value = [];
    try {
      const page = (!retry && catalogCache.get(key)) || await getPage(params, () => active && sequence === catalogSequence);
      if (!active || sequence !== catalogSequence) return;
      if (!Array.isArray(page.items) || !Number.isInteger(page.total) || page.total < 0 || page.offset !== Number(params.get("offset")) || page.items.length > catalogPageSize || (page.offset < page.total && !page.items.length))
        throw new Error("Página no disponible");
      catalogCache.set(key, page);
      catalogItems.value = page.items;
      catalogTotal.value = page.total;
    } catch {
      if (active && sequence === catalogSequence) catalogError.value = true;
    } finally {
      if (active && sequence === catalogSequence) catalogLoading.value = false;
    }
  }
  async function loadAuthors() {
    if (authorsLoaded || authorsLoading.value) return;
    authorsLoading.value = true;
    authorsError.value = false;
    try {
      const items = await getFacets<IFacetAutorItem>("autor");
      if (!active) return;
      authors.value = items.map((item) => item.autor).filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
      authorsLoaded = true;
    } catch {
      if (active) authorsError.value = true;
    } finally {
      if (active) authorsLoading.value = false;
    }
  }
  function changeCatalogPage(page: number) {
    if (page < 1 || page > catalogPages.value || catalogLoading.value) return;
    catalogPage.value = page;
    void loadCatalog();
  }
  watch([catalogSearch, catalogAuthor], () => {
    catalogPage.value = 1;
    // Invalidate in-flight responses immediately, before the debounce expires.
    catalogSequence++;
    catalogItems.value = [];
    catalogEnabled.value = true;
    catalogLoading.value = true;
    catalogError.value = false;
    clearTimeout(debounce);
    debounce = setTimeout(() => { void loadCatalog(); }, 300);
  });
  onBeforeUnmount(() => {
    active = false;
    catalogSequence++;
    clearTimeout(debounce);
  });
  function searchCourses(sourceCategoryId: number, query: string, offset: number, isCurrent: () => boolean) {
    return getPage(new URLSearchParams({ q: query, limit: "10", offset: String(offset) }), isCurrent, sourceCategoryId);
  }
  return {
    searchCourses,
    routeStates, stateFor, loadRoute,
    catalogItems, catalogTotal, catalogPage, catalogPages, catalogSearch, catalogAuthor,
    catalogEnabled, catalogLoading, catalogError, loadCatalog, changeCatalogPage,
    authors, authorsLoading, authorsError, loadAuthors,
  };
}
