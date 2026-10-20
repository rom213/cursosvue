<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import CategoryService from "../../../services/CategorieService";
import ApiService from "../../../services/ApiService";
import type { ICategory, ICategoryCourseDetail } from "../../../types/Categorie";
import { emergentBuyStore } from "../../../store/EmergentBuyStore";
import { authStore } from "../../../store/AuthStore";
import { useTracking } from "../../../composables/useTracking";
import { useCampaignReturn } from "../../../composables/useCampaignReturn";
import EmergentBuyComponent from "../../emergent.buy.component.vue";
import FooterComponent from "../../../components/footer/footer.component.vue";
import WhatsAppIcon from "./WhatsAppIcon.vue";
import {
  groupStudyCourses,
  studyCourseKey,
} from "../routes/studyRoutes";
import type { StudyLevel } from "../routes/studyRoutes";
import { useLazyStudyCatalog } from "../composables/useLazyStudyCatalog";
import type { StudyCampaignConfig } from "../config/studyCampaignConfig";
import { matchesSelectedStudyCourse, useStudyRouteSearch } from "../composables/useStudyRouteSearch";
import type { SelectedStudyCourse } from "../composables/useStudyRouteSearch";

const props = defineProps<{ config: StudyCampaignConfig }>();
const config = props.config;
const STUDY_CATEGORY_ID = config.categoryId;
const STUDY_CAMPAIGN_ID = config.campaignId;
const STUDY_ROUTES = config.routes;

defineOptions({ name: "StudyCampaignPage" });

const route = useRoute();
const router = useRouter();
const selectedHeaderCourse = ref<SelectedStudyCourse | null>(null);
const buyStore = emergentBuyStore();
const userAuth = authStore();
const { activateCampaign } = useCampaignReturn();
const {
  trackViewItem,
  trackBeginCheckout,
  trackCustom,
  trackWhatsAppIntent,
  trackViewContentCourse,
} = useTracking();
const category = ref<ICategory | null>(null);
const categoryLoading = ref(true);
const categoryError = ref(false);
const selectedRouteId = ref("");
const search = ref("");
const {
  stateFor, loadRoute, searchCourses, catalogItems, catalogTotal, catalogPage, catalogPages,
  catalogSearch, catalogAuthor, catalogEnabled, catalogLoading, catalogError,
  loadCatalog, changeCatalogPage: requestCatalogPage,
  authors, authorsLoading, authorsError, loadAuthors,
} = useLazyStudyCatalog(STUDY_CATEGORY_ID);
const catalogHeading = ref<HTMLElement | null>(null);
const selectedCourseRouteTitle = ref("");
type DisplayLevel = StudyLevel | "selected";
const expandedLevels = ref<DisplayLevel[]>([]);
const routeHeading = ref<HTMLElement | null>(null);
const routeDialog = ref<HTMLDialogElement | null>(null);
const routeDialogOpen = ref(false);
const routeDialogBody = ref<HTMLElement | null>(null);
const selectedCourse = ref<ICategoryCourseDetail | null>(null);
const courseDialog = ref<HTMLDialogElement | null>(null);
const freeDialog = ref<HTMLDialogElement | null>(null);
const content = ref("");
const contentLoading = ref(false);
const contentError = ref(false);
const freeCourseEmail = ref("");
const freeCourseEmailError = ref("");
const pendingFreeCourseUrl = ref("");
const freeCourseEmailRef = ref<HTMLInputElement | null>(null);
const openFaq = ref<number | null>(0);
const courseContentCache = new Map<number, string>();
const viewedCourseIds = new Set<number>();
let componentActive = true;
let landingSequence = 0;
let contentSequence = 0;
let viewTracked = false;
let courseTrigger: HTMLElement | null = null;
let routeTrigger: HTMLElement | null = null;
let previousOverflow = "";
let scrollLocked = false;

const initialRouteCounts: Record<string, number> = config.counts;
const routesWithCourses = computed(() => STUDY_ROUTES.map((definition) => {
  const state = stateFor(definition.id);
  return {
    ...definition,
    courses: state.items,
    loaded: state.loaded,
    courseCount: state.loaded ? state.items.length : (initialRouteCounts[definition.id] ?? 0),
  };
}));
const {
  query: routeSearch, normalizedQuery: routeSearchActive, canSearchCourses,
  matchedRoutes, resultGroups: routeSearchGroups, loadGroup: loadSearchGroup, clearSearch,
} = useStudyRouteSearch(config, searchCourses, () => selectedHeaderCourse.value);
watch(routeSearch, (value) => {
  const keyword = typeof route.query.q_search === "string" ? route.query.q_search.trim() : selectedHeaderCourse.value?.title;
  if (selectedHeaderCourse.value && value !== keyword) selectedHeaderCourse.value = null;
}, { flush: "sync" });
const routeSearchPlaceholder = config.productKind === "bloque"
  ? config.routes.slice(0, 2).map((route) => route.title.replace(/^Ruta /, "")).join(", ") + "…"
  : "Python, Excel, fotografía…";
const routeSearchInput = ref<HTMLInputElement | null>(null);
const routeSearchHeading = ref<HTMLElement | null>(null);
const routesHeading = ref<HTMLElement | null>(null);
const visibleRoutes = computed(() => matchedRoutes.value.map((match) => ({
  ...routesWithCourses.value.find((route) => route.id === match.id)!,
  matchRank: match.rank, matchingCourses: match.matchingCourses,
  selectedCourseMatch: match.selectedCourseMatch,
})));
function clearRouteSearch() {
  selectedHeaderCourse.value = null;
  clearSearch();
  if (route.query.q_course || route.query.q_search) {
    const { q_search, q_course, q_author, _t, ...query } = route.query;
    void router.replace({ query, hash: route.hash });
  }
  nextTick(() => routeSearchInput.value?.focus());
}
function focusSearchCourses() {
  nextTick(() => {
    routeSearchHeading.value?.focus({ preventScroll: true });
    routeSearchHeading.value?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  });
}
function changeSearchPage(categoryId: number, page: number) {
  void loadSearchGroup(categoryId, page);
  focusSearchCourses();
}
const routeLoading = computed(() => stateFor(selectedRouteId.value).loading);
const routeError = computed(() => stateFor(selectedRouteId.value).error);
const selectedStudyRoute = computed(
  () =>
    routesWithCourses.value.find((item) => item.id === selectedRouteId.value) ??
    routesWithCourses.value[0]!,
);
const courseGroups = computed(() => {
  const groups = groupStudyCourses(selectedStudyRoute.value.courses, search.value);
  const selected = groups.flatMap((group) => group.courses).filter(isSelectedHeaderCourse);
  if (!selected.length) return groups;
  return [{ id: "selected" as const, title: "Curso que buscaste", description: "El curso que seleccionaste en el buscador.", courses: selected },
    ...groups.map((group) => ({ ...group, courses: group.courses.filter((course) => !isSelectedHeaderCourse(course)) }))
      .filter((group) => group.courses.length > 0)];
});
function isSelectedHeaderCourse(course: ICategoryCourseDetail) {
  return matchesSelectedStudyCourse(course, selectedHeaderCourse.value, selectedStudyRoute.value.courses);
}
const searchTotal = computed(() =>
  courseGroups.value.reduce((sum, group) => sum + group.courses.length, 0),
);
function changeCatalogPage(page: number) {
  requestCatalogPage(page);
  nextTick(() => {
    catalogHeading.value?.focus({ preventScroll: true });
    catalogHeading.value?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  });
}
const finalPrice = computed(
  () => category.value?.precio ?? category.value?.precio_desc ?? 0,
);
const formattedPrice = computed(() =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
    finalPrice.value,
  ),
);
const alreadyBought = computed(() => Boolean(category.value?.user_bought));
const packTotal = computed(
  () => category.value?.cantidad_cursos ?? (catalogTotal.value || config.catalogTotal),
);
function whatsappLink(message: string) {
  const product =
    category.value?.titulo ?? config.title;
  const price = category.value ? ` por $${formattedPrice.value} COP` : "";
  return `https://wa.me/573209971514?text=${encodeURIComponent(`${message} Quiero consultar cómo obtener acceso al ${config.productKind} ${STUDY_CATEGORY_ID} completo: ${product}${price}. ¿Me ayudan?`)}`;
}
const whatsappUrl = computed(() =>
  whatsappLink(
    `Hola, me gustó el contenido de ${config.title}.`,
  ),
);
const routeWhatsappUrl = computed(() =>
  whatsappLink(
    `Hola, me gustó la ruta de ${selectedStudyRoute.value.title} y quiero estudiar sus cursos.`,
  ),
);

const purchaseFaqs = [
  {
    question: "¿Qué incluye mi compra?",
    answer:
      `La compra da acceso a ${config.title} (${STUDY_CATEGORY_ID}) completo. Las rutas organizan sus cursos para ayudarte a elegir qué estudiar; no se compran por separado.`,
  },
  {
    question: "¿En qué orden estudio los cursos?",
    answer:
      "Comienza por el nivel inicial, continúa con el intermedio y explora el avanzado cuando tengas las bases. Los cursos completos pueden abarcar varios niveles. Puedes escoger entre distintos cursos según tus objetivos; no es necesario cursarlos todos.",
  },
  {
    question: "¿Cómo se determina el nivel?",
    answer:
      "Los niveles son orientativos y se basan en lo que indica el título del curso. Si el título no permite confirmar la dificultad, el curso se incluye en el nivel intermedio. Revisa su descripción antes de elegirlo.",
  },
  {
    question: "¿Cómo accedo al material?",
    answer:
      "El acceso al material digital se entrega mediante Google Drive a la cuenta indicada durante la compra. Los cursos gratuitos y los accesos de quienes ya compraron conservan el flujo de acceso de la plataforma.",
  },
  {
    question: "¿El pago es una suscripción?",
    answer:
      "El precio mostrado corresponde a un pago único por el acceso completo. Puedes estudiar a tu ritmo, según tu disponibilidad.",
  },
];

const faqs = computed(() => alreadyBought.value
  ? purchaseFaqs.filter((_, index) => index !== 0 && index !== 4).map((faq) =>
      faq.question === "¿Cómo accedo al material?"
        ? { ...faq, answer: "Elige una ruta, abre el temario de un curso y pulsa «Abrir curso en Google Drive». Tu acceso completo ya está activo." }
        : faq)
  : purchaseFaqs);

async function loadLanding() {
  const sequence = ++landingSequence;
  const isCurrent = () => componentActive && sequence === landingSequence;
  categoryLoading.value = true;
  categoryError.value = false;
  try {
    const result = await CategoryService.getCategoryById(STUDY_CATEGORY_ID);
    if (!isCurrent()) return;
    if (!result || result.id !== STUDY_CATEGORY_ID) throw new Error("Categoría no disponible");
    const price = result.precio ?? result.precio_desc ?? 0;
    category.value = { ...result, precio: price, precio_desc: price };
    if (!viewTracked) {
      viewTracked = true;
      trackViewItem(category.value);
      trackCustom("CampaignView", {
        content_id: STUDY_CATEGORY_ID,
        content_name: config.title,
        content_category: "campaign",
        value: price || undefined,
        currency: price ? "COP" : undefined,
        custom_data: { campaign_id: STUDY_CAMPAIGN_ID },
      });
    }
  } catch {
    if (isCurrent()) categoryError.value = true;
  } finally {
    if (isCurrent()) categoryLoading.value = false;
  }
}
function loadSelectedStudyRoute(retry = false) {
  return loadRoute(selectedStudyRoute.value, retry);
}

async function selectStudyRoute(id: string, event: Event) {
  routeTrigger = event.currentTarget as HTMLElement;
  routeDialogOpen.value = true;
  selectedRouteId.value = id;
  search.value = "";
  expandedLevels.value = [];
  void loadSelectedStudyRoute();
  trackCustom("StudyRouteOpen", {
    content_id: STUDY_CATEGORY_ID,
    content_name: selectedStudyRoute.value.title,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      study_route: id,
      courses_total: selectedStudyRoute.value.loaded ? selectedStudyRoute.value.courses.length : undefined,
    },
  });
  await nextTick();
  if (!componentActive || !routeDialogOpen.value) return;
  routeDialog.value?.showModal();
  lockScroll();
  routeHeading.value?.focus({ preventScroll: true });
}

function closeStudyRoute(restoreFocus = true) {
  routeDialog.value?.close();
  routeDialogOpen.value = false;
  unlockScroll();
  if (restoreFocus) nextTick(() => routeTrigger?.focus());
}

function visibleGroupCourses(group: {
  id: DisplayLevel;
  courses: ICategoryCourseDetail[];
}) {
  return expandedLevels.value.includes(group.id)
    ? group.courses
    : group.courses.slice(0, 6);
}
function toggleLevel(level: DisplayLevel) {
  expandedLevels.value = expandedLevels.value.includes(level)
    ? expandedLevels.value.filter((item) => item !== level)
    : [...expandedLevels.value, level];
}
watch(search, () => {
  expandedLevels.value = [];
});

function lockScroll() {
  if (scrollLocked) return;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  scrollLocked = true;
}
function unlockScroll() {
  if (routeDialogOpen.value || !scrollLocked) return;
  document.body.style.overflow = previousOverflow;
  scrollLocked = false;
}
async function loadCourseContent() {
  const course = selectedCourse.value;
  const sequence = ++contentSequence;
  content.value = "";
  contentError.value = false;
  contentLoading.value = false;
  if (!course) return;
  if (course.id == null) {
    content.value = course.contenido ?? "";
    return;
  }
  if (courseContentCache.has(course.id)) {
    content.value = courseContentCache.get(course.id)!;
    return;
  }
  contentLoading.value = true;
  try {
    const response = await ApiService.get<{ contenido: string | null }>(
      `api/category/courses/${course.id}/contenido`,
    );
    if (!componentActive || sequence !== contentSequence) return;
    content.value = response.data.contenido ?? "";
    courseContentCache.set(course.id, content.value);
  } catch {
    if (componentActive && sequence === contentSequence)
      contentError.value = true;
  } finally {
    if (componentActive && sequence === contentSequence)
      contentLoading.value = false;
  }
}
async function openCourseDescription(
  course: ICategoryCourseDetail,
  event: Event,
) {
  courseTrigger = event.currentTarget as HTMLElement;
  selectedCourseRouteTitle.value = routeDialogOpen.value ? selectedStudyRoute.value.title : "";
  selectedCourse.value = course;
  void loadCourseContent();
  trackCustom("CourseDescriptionOpen", {
    content_id: course.id,
    content_name: course.name_del_curso,
    content_category: selectedCourseRouteTitle.value || category.value?.titulo,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      category_id: STUDY_CATEGORY_ID,
      study_route: routeDialogOpen.value ? selectedRouteId.value : undefined,
    },
  });
  if (course.id != null && !viewedCourseIds.has(course.id)) {
    viewedCourseIds.add(course.id);
    trackViewContentCourse(course, category.value ?? undefined);
  }
  await nextTick();
  if (!componentActive || selectedCourse.value !== course) return;
  courseDialog.value?.showModal();
  lockScroll();
}
function closeCourseDescription(restoreFocus = true) {
  contentSequence++;
  courseDialog.value?.close();
  selectedCourse.value = null;
  unlockScroll();
  if (restoreFocus) nextTick(() => courseTrigger?.focus());
}
function canAccessCourse(course: ICategoryCourseDetail) {
  return alreadyBought.value || Boolean(course.es_gratis);
}
async function handleDriveClick() {
  const course = selectedCourse.value;
  const url = course?.info_tecnica?.url;
  if (!course || !url) return;
  const allowed = canAccessCourse(course);
  trackCustom("DriveAccessClick", {
    content_id: course.id,
    content_name: course.name_del_curso,
    is_free: Boolean(course.es_gratis),
    custom_data: { campaign_id: STUDY_CAMPAIGN_ID, allowed },
  });
  if (!allowed) {
    trackCustom("DriveAccessDenied", {
      content_id: course.id,
      content_name: course.name_del_curso,
      custom_data: {
        campaign_id: STUDY_CAMPAIGN_ID,
        reason: "purchase_required",
      },
    });
    closeCourseDescription(false);
    handleWebBuy("course-drive");
    return;
  }
  if (course.es_gratis && !userAuth.getProfile()?.user?.email) {
    pendingFreeCourseUrl.value = url;
    freeCourseEmail.value = "";
    freeCourseEmailError.value = "";
    closeCourseDescription(false);
    await nextTick();
    if (!componentActive) return;
    freeDialog.value?.showModal();
    lockScroll();
    freeCourseEmailRef.value?.focus();
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
function confirmFreeCourseAccess() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freeCourseEmail.value.trim())) {
    freeCourseEmailError.value = "Ingresa un correo válido.";
    return;
  }
  const url = pendingFreeCourseUrl.value;
  closeFreeCourseGate();
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}
function closeFreeCourseGate() {
  freeDialog.value?.close();
  pendingFreeCourseUrl.value = "";
  unlockScroll();
  nextTick(() => courseTrigger?.focus());
}
function handleWebBuy(source: string) {
  if (!category.value) return;
  if (alreadyBought.value) {
    if (routeDialogOpen.value) closeStudyRoute(false);
    scrollToRoutes();
    return;
  }
  trackCustom("CampaignCtaClick", {
    content_id: STUDY_CATEGORY_ID,
    value: finalPrice.value || undefined,
    currency: finalPrice.value ? "COP" : undefined,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      channel: "web",
      source,
      study_route: selectedRouteId.value,
    },
  });
  if (routeDialogOpen.value) closeStudyRoute(false);
  buyStore.setCategoryEmergent(category.value);
  trackBeginCheckout([category.value], finalPrice.value);
  if (!buyStore.emergentBuy.emergent) buyStore.handleEmergentBuy();
}
function handleWhatsApp(source: string, scope: "page" | "route" = "page") {
  if (!category.value) return;
  trackWhatsAppIntent(category.value, {
    source,
    campaignId: STUDY_CAMPAIGN_ID,
    contentName:
      scope === "route"
        ? selectedStudyRoute.value.title
        : category.value.titulo,
    contentCategory: "campaign",
  });
  trackCustom("CampaignCtaClick", {
    content_id: STUDY_CATEGORY_ID,
    value: finalPrice.value || undefined,
    currency: finalPrice.value ? "COP" : undefined,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      channel: "whatsapp",
      source,
      study_route: scope === "route" ? selectedRouteId.value : undefined,
      interest_scope: scope,
    },
  });
}
function scrollToRoutes() {
  document
    .getElementById("rutas-estudio")
    ?.scrollIntoView({ behavior: scrollBehavior() });
}
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

let previousTitle = "";
const previousMeta = new Map<
  string,
  { element: HTMLMetaElement; content: string; created: boolean; applied: string }
>();
function setupMetadata() {
  previousTitle = document.title;
  const title = config.metadataTitle;
  const description =
    config.description;
  document.title = title;
  for (const [attribute, key, value] of [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    [
      "property",
      "og:image",
      `${window.location.origin}${config.heroImage}`,
    ],
  ] as const) {
    const selector = `meta[${attribute}="${key}"]`;
    const existing = document.head.querySelector<HTMLMetaElement>(selector);
    const element = existing ?? document.createElement("meta");
    previousMeta.set(selector, {
      element,
      content: element.content,
      created: !existing,
      applied: value,
    });
    element.setAttribute(attribute, key);
    element.content = value;
    if (!existing) document.head.appendChild(element);
  }
}
onMounted(() => {
  setupMetadata();
  activateCampaign({
    id: STUDY_CAMPAIGN_ID,
    title: `tus rutas de ${config.shortTitle}`,
    path: route.fullPath,
    categoryId: STUDY_CATEGORY_ID,
  });
  void loadLanding();
});
watch(
  () => [route.name, route.params.id, route.params.courseSlug, route.query.q_search, route.query.q_course, route.query.q_author, route.query._t],
  async () => {
    if (!componentActive || route.name !== "courses-description" || String(route.params.id) !== String(STUDY_CATEGORY_ID) || route.params.courseSlug) return;
    const title = typeof route.query.q_course === "string" ? route.query.q_course.trim() : "";
    const author = typeof route.query.q_author === "string" ? route.query.q_author.trim() : "";
    const keyword = typeof route.query.q_search === "string" ? route.query.q_search.trim() : title;
    closeCourseDescription(false);
    closeStudyRoute(false);
    routeSearch.value = keyword;
    selectedHeaderCourse.value = title ? { title, author } : null;
    if (!keyword) return;
    await nextTick();
    if (!componentActive || selectedHeaderCourse.value?.title !== title) return;
    routesHeading.value?.focus({ preventScroll: true });
    routesHeading.value?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  },
  { immediate: true, flush: "post" },
);
watch(
  () => route.fullPath,
  () => {
    if (!componentActive || route.name !== "courses-description" || String(route.params.id) !== String(STUDY_CATEGORY_ID) || route.params.courseSlug) return;
    activateCampaign({
      id: STUDY_CAMPAIGN_ID,
      title: `tus rutas de ${config.shortTitle}`,
      path: route.fullPath,
      categoryId: STUDY_CATEGORY_ID,
    });
  },
  { flush: "post" },
);
onBeforeUnmount(() => {
  componentActive = false;
  landingSequence++;
  contentSequence++;
  routeDialogOpen.value = false;
  unlockScroll();
  if (document.title === config.metadataTitle) document.title = previousTitle;
  for (const {
    element,
    content: previousContent,
    created,
    applied,
  } of previousMeta.values()) {
    if (element.content !== applied) continue;
    if (created) element.remove();
    else element.content = previousContent;
  }
});
</script>

<template>
  <main class="study-page" :class="{ 'personalized-page': STUDY_CATEGORY_ID !== 200 }" :data-campaign="STUDY_CATEGORY_ID" :style="{ '--blue': config.accent, '--accent-hover': config.hover, '--hero-tint': config.tint, '--hero-background': config.background }">
    <section class="study-hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="eyebrow"
            ><span aria-hidden="true">✦</span> {{ config.eyebrow }}</span
          >
          <h1>
            {{ alreadyBought ? config.paidHeadline : config.headline }}
            <span>{{ alreadyBought ? config.paidHighlight : config.highlight }}</span>
          </h1>
          <p class="hero-description">
            {{ alreadyBought ? config.paidDescription : config.description }}
          </p>
          <div class="hero-actions">
            <button
              class="button button-primary"
              type="button"
              @click="scrollToRoutes"
            >
              {{ alreadyBought ? "Explorar mis rutas" : "Elegir mi ruta de estudio" }} <span aria-hidden="true">↓</span>
            </button>
            <a
              v-if="!alreadyBought"
              class="button button-light"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleWhatsApp('hero')"
              ><WhatsAppIcon class="whatsapp-inline-icon" /> Consultar por
              WhatsApp ↗</a
            >
          </div>
          <div class="hero-facts">
            <span><b aria-hidden="true">✓</b> De nivel inicial a avanzado</span>
            <span
              ><b aria-hidden="true">✓</b> {{ config.fact }}</span
            >
          </div>
        </div>
        <div class="hero-visual">
          <img
            :src="config.heroImage"
            :alt="config.heroAlt"
            width="1400"
            height="933"
            fetchpriority="high"
          />
          <div class="hero-image-label">
            <span class="image-label-icon" aria-hidden="true">↗</span>
            <div>
              <strong>{{ config.imageLabel }}</strong
              ><span
                >{{ config.imageTopics }}</span
              >
            </div>
          </div>
          <div class="hero-photo-pill">{{ config.title }}</div>
        </div>
      </div>
    </section>

    <section class="pack-strip" :aria-label="`Acceso a ${config.title}`">
      <div>
        <span class="eyebrow">{{ alreadyBought ? "TU ACCESO ESTÁ ACTIVO" : "UN ACCESO, MUCHAS POSIBILIDADES" }}</span>
        <h2>{{ config.title }}</h2>
        <p v-if="alreadyBought">
          Ya tienes acceso a todo el contenido. Elige una ruta y abre tus cursos directamente desde aquí.
        </p>
        <p v-else>
          Todas las rutas forman parte de {{ config.title }}. Elige qué aprender; la compra incluye {{ config.productKind === "paquete" ? "los tres pilares completos" : `el ${config.productKind} completo` }}.
        </p>
      </div>
      <div class="pack-purchase" aria-live="polite">
        <div
          v-if="categoryLoading"
          class="price-skeleton skeleton"
          aria-label="Cargando precio"
        ></div>
        <template v-else-if="category"
          ><div v-if="!alreadyBought" class="price">
            <small>Pago único · Acceso completo</small
            ><strong>${{ formattedPrice }} <span>COP</span></strong>
          </div>
          <button
            class="button button-primary"
            type="button"
            data-track="campaign-pack-web"
            @click="handleWebBuy('pack')"
          >
            {{ alreadyBought ? "Explorar mis rutas" : "Obtener acceso" }}
            <span aria-hidden="true">→</span>
          </button></template
        >
        <div v-else-if="categoryError" class="inline-error" role="alert">
          <p>
            No pudimos cargar el precio. La compra está temporalmente
            deshabilitada.
          </p>
          <button class="text-button" type="button" @click="loadLanding">
            Volver a intentar
          </button>
        </div>
      </div>
    </section>

    <section id="rutas-estudio" class="section routes-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">EMPIEZA POR TU OBJETIVO</span>
          <h2 ref="routesHeading" tabindex="-1">Encuentra tu ruta</h2>
          <p>
            Elige una habilidad para explorar sus pasos y cursos disponibles.
          </p>
        </div>
        <span
          v-if="packTotal"
          class="count-pill"
          >{{ packTotal }} cursos en el catálogo</span
        >
      </div>
      <div class="route-finder">
        <div class="search-field">
          <label for="study-route-search">Buscar una ruta o un curso</label>
          <div>
            <input id="study-route-search" ref="routeSearchInput" v-model="routeSearch" type="search"
              :placeholder="routeSearchPlaceholder" autocomplete="off" aria-describedby="route-finder-help" />
            <span aria-hidden="true">⌕</span>
          </div>
        </div>
        <button v-if="routeSearchActive" class="button button-light" type="button" @click="clearRouteSearch">Limpiar búsqueda</button>
        <p id="route-finder-help">Encuentra rutas por habilidad o busca cursos por su título. Las recomendaciones se basan en los cursos mostrados.</p>
      </div>
      <div v-if="routeSearchActive" class="finder-summary">
        <p class="search-results" role="status">
          <template v-if="selectedHeaderCourse">Buscaste «{{ routeSearch }}». Las rutas del curso seleccionado aparecen primero; las demás siguen disponibles.</template>
          <template v-else>{{ visibleRoutes.length }} {{ visibleRoutes.length === 1 ? 'ruta relacionada' : 'rutas relacionadas' }}.</template>
          {{ canSearchCourses ? 'Consulta también los cursos encontrados debajo de las rutas.' : 'Escribe al menos dos caracteres para buscar cursos.' }}
        </p>
        <button v-if="canSearchCourses" class="text-button" type="button" @click="focusSearchCourses">Ver cursos encontrados ↓</button>
      </div>
      <div v-if="routeSearchActive && !visibleRoutes.length" class="empty-panel">
        <p>No encontramos rutas relacionadas por ahora. Puedes consultar los cursos encontrados o probar otra búsqueda.</p>
      </div>
        <div class="route-grid">
          <button
            v-for="studyRoute in visibleRoutes"
            :key="studyRoute.id"
            type="button"
            class="route-card"
            :class="{ selected: routeDialogOpen && selectedRouteId === studyRoute.id }"
            :style="{ '--route-accent': studyRoute.accent }"
            :aria-pressed="routeDialogOpen && selectedRouteId === studyRoute.id"
            aria-haspopup="dialog"
            aria-controls="study-route-dialog"
            @click="selectStudyRoute(studyRoute.id, $event)"
          >
            <div
              class="route-card-image"
              :class="`route-image-${studyRoute.imageKind}`"
            >
              <img
                :src="studyRoute.image"
                :alt="studyRoute.imageAlt"
                width="640"
                height="400"
                loading="lazy"
              /><span class="route-card-tag">{{
                studyRoute.featured ? "Ruta destacada" : "Más habilidades"
              }}</span>
            </div>
            <div class="route-card-copy">
              <div class="route-card-title">
                <h3>{{ studyRoute.title }}</h3>
                <span class="route-card-arrow" aria-hidden="true">↗</span>
              </div>
              <p>{{ studyRoute.summary }}</p>
              <span v-if="studyRoute.selectedCourseMatch" class="route-match-label">Contiene el curso que buscaste</span>
              <span v-else-if="routeSearchActive && !selectedHeaderCourse" class="route-match-label">{{ studyRoute.matchRank > 0
                ? 'Coincide con tu búsqueda'
                : `Relacionada con ${studyRoute.matchingCourses} ${studyRoute.matchingCourses === 1 ? 'curso mostrado' : 'cursos mostrados'}` }}</span>
              <span class="route-card-bottom"
                ><span
                  >{{ studyRoute.courseCount }}
                  {{ studyRoute.courseCount === 1 ? 'curso disponible' : 'cursos disponibles' }}</span
                ><strong>{{
                  routeDialogOpen && selectedRouteId === studyRoute.id
                    ? "Seleccionada"
                    : "Ver ruta"
                }}</strong></span
              >
            </div>
          </button>
        </div>
      <section v-if="canSearchCourses" class="finder-courses" aria-labelledby="finder-courses-title">
        <h3 id="finder-courses-title" ref="routeSearchHeading" tabindex="-1">Cursos encontrados</h3>
        <p>Hasta 10 cursos por {{ config.productKind === "bloque" ? "bloque" : "pilar" }} y página.<template v-if="selectedHeaderCourse"> El curso seleccionado se muestra primero, además de los resultados cuando no está en esta página.</template> Un curso puede estar relacionado con varias rutas.</p>
        <section v-for="group in routeSearchGroups" :key="group.categoryId" class="finder-group" :aria-labelledby="`finder-pillar-${group.categoryId}`">
          <h4 :id="`finder-pillar-${group.categoryId}`">{{ group.title }}</h4>
          <p v-if="group.loading" role="status" aria-busy="true">Buscando cursos…</p>
          <div v-else-if="group.error" class="error-panel" role="alert">
            <p>No pudimos buscar cursos en esta sección.</p>
            <button class="button button-light" type="button" @click="loadSearchGroup(group.categoryId, group.page, true)">Volver a intentar</button>
          </div>
          <template v-else>
            <div v-if="group.selectionError" class="error-panel" role="alert">
              <p>No pudimos localizar el curso seleccionado. Puedes explorar los resultados de tu búsqueda.</p>
              <button class="button button-light" type="button" @click="loadSearchGroup(group.categoryId, group.page, true)">Reintentar curso seleccionado</button>
            </div>
            <p class="search-results" role="status">{{ group.total }} {{ group.total === 1 ? 'curso encontrado' : 'cursos encontrados' }}</p>
            <p v-if="!group.results.length" class="empty-panel">No encontramos cursos con esa búsqueda en esta sección. Prueba con otra palabra.</p>
            <ul v-else class="course-list finder-course-list">
              <li v-for="result in group.results" :key="studyCourseKey(result.course)">
                <button class="course-row" :class="{ 'course-row-highlighted': result.selected }" type="button" @click="openCourseDescription(result.course, $event)">
                  <span class="course-icon" aria-hidden="true">▤</span>
                  <span class="course-row-copy"><strong>{{ result.course.name_del_curso || 'Curso sin título' }}</strong>
                    <span v-if="result.course.author && result.course.author !== 'DESCONOCIDO'">{{ result.course.author }}</span>
                  </span>
                  <span v-if="result.course.es_gratis" class="free-badge">Gratis</span>
                  <span class="course-open-label">Ver temario →</span>
                </button>
                <div class="finder-course-routes">
                  <button v-for="related in result.routes" :key="related.id" class="text-button" type="button" @click="selectStudyRoute(related.id, $event)">Ver {{ related.title }} →</button>
                  <span v-if="!result.routes.length">Sin ruta asociada. Puedes consultar el temario de este curso.</span>
                </div>
              </li>
            </ul>
            <nav v-if="group.pages > 1" class="catalog-pagination" :aria-label="`Resultados de ${group.title}`">
              <button class="button button-light" type="button" :disabled="group.page === 1" @click="changeSearchPage(group.categoryId, group.page - 1)">Anterior</button>
              <span>Página {{ group.page }} de {{ group.pages }}</span>
              <button class="button button-light" type="button" :disabled="group.page === group.pages" @click="changeSearchPage(group.categoryId, group.page + 1)">Siguiente</button>
            </nav>
          </template>
        </section>
      </section>
        <p class="catalog-note">
          Un curso puede formar parte de varias rutas. Los contenidos se
          muestran según el catálogo disponible.
        </p>
        <a
          class="image-credits"
          :href="config.creditsUrl"
          target="_blank"
          rel="noopener noreferrer"
          >Créditos de las imágenes ↗</a
        >
    </section>

    <dialog
      id="study-route-dialog"
      ref="routeDialog"
      class="route-dialog"
      aria-labelledby="ruta-titulo"
      @cancel.prevent="closeStudyRoute()"
      @click="$event.target === routeDialog && closeStudyRoute()"
    >
      <header class="route-dialog-header">
        <span class="eyebrow">EXPLORA TU RUTA DE ESTUDIO</span>
        <button
          type="button"
          class="dialog-close"
          aria-label="Cerrar ruta de estudio"
          @click="closeStudyRoute()"
        >
          ×
        </button>
      </header>
      <div ref="routeDialogBody" class="route-dialog-body"></div>
      <a
        v-if="routeDialogOpen && !alreadyBought"
        class="whatsapp-float whatsapp-float-route"
        :href="routeWhatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Consultar por WhatsApp sobre la ruta de ${selectedStudyRoute.title}`"
        @click="handleWhatsApp('route_floating_button', 'route')"
        ><WhatsAppIcon /><span>Me gusta esta ruta</span></a
      >
    </dialog>
    <Teleport
      v-if="routeDialogOpen && routeDialogBody"
      :to="routeDialogBody"
    >
      <section
        id="ruta-detalle"
        class="section route-detail"
        :style="{ '--route-accent': selectedStudyRoute.accent }"
        aria-labelledby="ruta-titulo"
      >
        <div class="detail-intro">
          <div>
            <span class="eyebrow">TU CAMINO DE APRENDIZAJE</span>
            <h2 id="ruta-titulo" ref="routeHeading" tabindex="-1">
              {{ selectedStudyRoute.title }}
            </h2>
            <p>{{ selectedStudyRoute.goal }}</p>
            <span class="count-pill"
              >{{ selectedStudyRoute.courseCount }} cursos en esta ruta</span
            >
          </div>
          <ol
            class="learning-steps"
            aria-label="Secuencia orientativa de aprendizaje"
          >
            <li v-for="(step, index) in selectedStudyRoute.steps" :key="step">
              <span class="step-number">{{
                String(index + 1).padStart(2, "0")
              }}</span
              ><span>{{ step }}</span>
            </li>
          </ol>
        </div>
        <div v-if="routeLoading" class="route-loading" role="status" aria-busy="true">
          <div class="content-skeleton skeleton"></div>
          <p>Cargando los cursos de esta ruta…</p>
        </div>
        <div v-else-if="routeError" class="error-panel route-error" role="alert">
          <h3>No pudimos cargar esta ruta</h3>
          <p>Vuelve a intentar para consultar sus cursos.</p>
          <button class="button button-primary" type="button" @click="loadSelectedStudyRoute(true)">Volver a intentar</button>
        </div>
        <div v-if="!routeLoading && !routeError" class="catalog-toolbar">
          <div>
            <h3>Explora los cursos por nivel</h3>
            <p>
              El nivel es orientativo y se basa en el título. Revisa la
              descripción para elegir el curso adecuado.
            </p>
          </div>
          <div class="search-field">
            <label for="route-course-search">Buscar en esta ruta</label>
            <div>
              <input
                id="route-course-search"
                v-model="search"
                type="search"
                placeholder="Nombre del curso o autor"
                autocomplete="off"
              /><span aria-hidden="true">⌕</span>
            </div>
          </div>
        </div>
        <p v-if="!routeLoading && !routeError && search.trim()" class="search-results" role="status">
          {{ searchTotal }}
          {{ searchTotal === 1 ? "resultado" : "resultados" }} para “{{
            search.trim()
          }}”
        </p>
        <div v-if="!routeLoading && !routeError && !courseGroups.length" class="empty-panel">
          <h3>
            {{
              search.trim()
                ? "No encontramos cursos con esa búsqueda"
                : "No hay cursos disponibles en esta ruta por ahora"
            }}
          </h3>
          <p>
            {{
              search.trim()
                ? "Prueba con otro nombre o busca por autor."
                : "Puedes explorar las demás rutas o consultar el catálogo completo de este acceso."
            }}
          </p>
          <button
            v-if="search.trim()"
            class="text-button"
            type="button"
            @click="search = ''"
          >
            Limpiar búsqueda
          </button>
        </div>
        <div v-else-if="!routeLoading && !routeError" class="level-groups">
          <section
            v-for="group in courseGroups"
            :key="group.id"
            class="level-group"
            :aria-labelledby="`level-${group.id}`"
          >
            <div class="level-heading">
              <div>
                <h3 :id="`level-${group.id}`">
                  {{ group.title }} <span>{{ group.courses.length }}</span>
                </h3>
                <p>{{ group.description }}</p>
              </div>
              <span class="level-marker" aria-hidden="true">{{
                group.id === "complete"
                  ? "↔"
                  : group.id === "unspecified"
                    ? "＋"
                    : "↗"
              }}</span>
            </div>
            <ul class="course-list">
              <li
                v-for="course in visibleGroupCourses(group)"
                :key="studyCourseKey(course)"
              >
                <button
                  type="button"
                  class="course-row"
                  :class="{ 'course-row-highlighted': isSelectedHeaderCourse(course) }"
                  @click="openCourseDescription(course, $event)"
                >
                  <span class="course-icon" aria-hidden="true">▤</span
                  ><span class="course-row-copy"
                    ><strong>{{
                      course.name_del_curso || "Curso sin título"
                    }}</strong
                    ><span
                      v-if="course.author && course.author !== 'DESCONOCIDO'"
                      >{{ course.author }}</span
                    ></span
                  ><span v-if="course.es_gratis" class="free-badge">Gratis</span
                  ><span class="course-open-label"
                    >Ver curso <span aria-hidden="true">→</span></span
                  >
                </button>
              </li>
            </ul>
            <button
              v-if="group.courses.length > 6"
              class="expand-button"
              type="button"
              :aria-expanded="expandedLevels.includes(group.id)"
              @click="toggleLevel(group.id)"
            >
              {{
                expandedLevels.includes(group.id)
                  ? "Mostrar menos cursos"
                  : `Ver los ${group.courses.length - 6} cursos restantes`
              }}
              <span aria-hidden="true">{{
                expandedLevels.includes(group.id) ? "−" : "+"
              }}</span>
            </button>
          </section>
        </div>
      </section>
    </Teleport>

    <section id="catalogo-completo" class="section full-catalog" aria-labelledby="catalogo-titulo">
      <div class="catalog-toolbar">
        <div>
          <span class="eyebrow">TODO EL CONTENIDO DEL BLOQUE</span>
          <h2 id="catalogo-titulo" ref="catalogHeading" tabindex="-1">Todos los cursos</h2>
          <p>Explora el catálogo por nombre del curso y filtra por autor.</p>
        </div>
        <div class="search-field">
          <label for="catalog-course-search">Buscar en todos los cursos</label>
          <div>
            <input id="catalog-course-search" v-model="catalogSearch" type="search" placeholder="Nombre del curso" autocomplete="off" />
            <span aria-hidden="true">⌕</span>
          </div>
        </div>
        <div class="search-field">
          <label for="catalog-author">Filtrar por autor</label>
          <select id="catalog-author" v-model="catalogAuthor" @focus="loadAuthors" @click="loadAuthors">
            <option value="">{{ authorsLoading ? 'Cargando autores…' : 'Todos los autores' }}</option>
            <option v-for="author in authors" :key="author" :value="author">{{ author }}</option>
          </select>
          <button v-if="authorsError" class="text-button" type="button" @click="loadAuthors">Reintentar carga de autores</button>
        </div>
      </div>
      <div v-if="!catalogEnabled" class="empty-panel">
        <p>Consulta el catálogo completo cuando lo necesites.</p>
        <button class="button button-primary" type="button" @click="loadCatalog()">Ver catálogo completo</button>
      </div>
      <div v-else-if="catalogLoading" aria-live="polite" aria-busy="true">
        <div class="content-skeleton skeleton"></div>
        <p>Cargando cursos…</p>
      </div>
      <div v-else-if="catalogError" class="error-panel" role="alert">
        <p>No pudimos cargar el catálogo completo.</p>
        <button class="button button-primary" type="button" @click="loadCatalog(true)">Volver a intentar</button>
      </div>
      <template v-else>
        <p class="search-results" role="status">{{ catalogTotal }} {{ catalogTotal === 1 ? "curso" : "cursos" }}{{ catalogSearch.trim() ? " encontrados" : " en el catálogo" }}</p>
        <div v-if="!catalogTotal" class="empty-panel">
          <h3>{{ catalogSearch.trim() ? "No encontramos cursos con esa búsqueda" : "No hay cursos disponibles por ahora" }}</h3>
          <button v-if="catalogSearch.trim()" class="text-button" type="button" @click="catalogSearch = ''">Limpiar búsqueda</button>
        </div>
        <ul v-else class="course-list catalog-course-list">
          <li v-for="course in catalogItems" :key="studyCourseKey(course)">
                <button
                  type="button"
                  class="course-row"
                  @click="openCourseDescription(course, $event)"
                >
                  <span class="course-icon" aria-hidden="true">▤</span
                  ><span class="course-row-copy"
                    ><strong>{{
                      course.name_del_curso || "Curso sin título"
                    }}</strong
                    ><span
                      v-if="course.author && course.author !== 'DESCONOCIDO'"
                      >{{ course.author }}</span
                    ></span
                  ><span v-if="course.es_gratis" class="free-badge">Gratis</span
                  ><span class="course-open-label"
                    >Ver curso <span aria-hidden="true">→</span></span
                  >
                </button>
          </li>
        </ul>
        <nav v-if="catalogPages > 1" class="catalog-pagination" aria-label="Paginación de todos los cursos">
          <button class="button button-light" type="button" :disabled="catalogPage === 1" @click="changeCatalogPage(catalogPage - 1)">Anterior</button>
          <span aria-live="polite">Página {{ catalogPage }} de {{ catalogPages }}</span>
          <button class="button button-light" type="button" :disabled="catalogPage === catalogPages" @click="changeCatalogPage(catalogPage + 1)">Siguiente</button>
        </nav>
      </template>
    </section>

    <section class="section how-section" aria-label="Cómo estudiar">
      <span class="eyebrow">APRENDE A TU MANERA</span>
      <h2>Un objetivo. Tu propio ritmo.</h2>
      <div class="how-grid">
        <article>
          <span aria-hidden="true">01</span>
          <h3>Elige tu habilidad</h3>
          <p>
            Comienza por la ruta que se conecta con tus objetivos de trabajo o
            aprendizaje.
          </p>
        </article>
        <article>
          <span aria-hidden="true">02</span>
          <h3>Encuentra tu nivel</h3>
          <p>
            Revisa las descripciones y elige entre cursos iniciales,
            intermedios, avanzados o completos.
          </p>
        </article>
        <article>
          <span aria-hidden="true">03</span>
          <h3>Practica y continúa</h3>
          <p>
            Estudia según tu disponibilidad y vuelve al material cuando
            necesites repasar.
          </p>
        </article>
      </div>
    </section>

    <section class="section faq-section">
      <div>
        <span class="eyebrow">ANTES DE EMPEZAR</span>
        <h2>Resolvemos tus dudas</h2>
        <p>Las rutas te orientan; el acceso incluye todo el contenido de {{ config.title }}.</p>
      </div>
      <div class="faq-list">
        <article v-for="(faq, index) in faqs" :key="faq.question">
          <h3>
            <button
              type="button"
              :aria-expanded="openFaq === index"
              :aria-controls="`study-faq-${index}`"
              @click="openFaq = openFaq === index ? null : index"
            >
              {{ faq.question
              }}<span aria-hidden="true">{{
                openFaq === index ? "−" : "+"
              }}</span>
            </button>
          </h3>
          <p v-if="openFaq === index" :id="`study-faq-${index}`">
            {{ faq.answer }}
          </p>
        </article>
      </div>
    </section>

    <section v-if="!alreadyBought" class="section final-section">
      <div>
        <span class="eyebrow">DA EL SIGUIENTE PASO</span>
        <h2>Abre nuevas posibilidades<br />con tus habilidades</h2>
        <p>
          Accede a {{ config.title }} y
          explora las rutas a tu ritmo.
        </p>
        <p v-if="category" class="final-count">
          {{ packTotal }} cursos incluidos · Un solo pago
        </p>
      </div>
      <div class="final-actions">
        <strong v-if="category" class="final-price"
          >${{ formattedPrice }} <span>COP</span></strong
        ><button
          class="button button-white"
          type="button"
          :disabled="!category"
          data-track="campaign-final-web"
          @click="handleWebBuy('final')"
        >
          Obtener acceso completo
          →</button
        ><a
          class="button button-outline-white"
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleWhatsApp('final')"
          ><WhatsAppIcon class="whatsapp-inline-icon" /> Consultar por WhatsApp
          ↗</a
        >
      </div>
    </section>

    <dialog
      ref="courseDialog"
      class="course-dialog"
      aria-labelledby="study-course-title"
      @cancel.prevent="closeCourseDescription()"
      @click="$event.target === courseDialog && closeCourseDescription()"
    >
      <template v-if="selectedCourse"
        ><header class="dialog-header">
          <div>
            <span class="eyebrow">{{ selectedCourseRouteTitle || category?.titulo || "Cursos de tu acceso completo" }}</span>
            <h2 id="study-course-title">
              {{ selectedCourse.name_del_curso || "Descripción del curso" }}
            </h2>
            <p v-if="selectedCourse.author">{{ selectedCourse.author }}</p>
          </div>
          <button
            type="button"
            class="dialog-close"
            autofocus
            aria-label="Cerrar descripción del curso"
            @click="closeCourseDescription()"
          >
            ×
          </button>
        </header>
        <div class="dialog-body">
          <div v-if="contentLoading" aria-live="polite">
            <div class="content-skeleton skeleton"></div>
            <p>Cargando descripción…</p>
          </div>
          <div v-else-if="contentError" class="error-panel" role="alert">
            <p>No pudimos cargar la descripción.</p>
            <button
              class="text-button"
              type="button"
              @click="loadCourseContent"
            >
              Volver a intentar
            </button>
          </div>
          <div
            v-else-if="content"
            class="course-content"
            v-html="content"
          ></div>
          <p v-else class="empty-description">
            Este curso todavía no tiene una descripción ampliada. Su contenido
            forma parte de {{ config.title }}.
          </p>
        </div>
        <footer class="dialog-footer">
          <button
            v-if="selectedCourse.info_tecnica?.url"
            class="button button-primary"
            type="button"
            :disabled="!canAccessCourse(selectedCourse) && !category"
            data-track="campaign-course-drive"
            @click="handleDriveClick"
          >
            {{
              canAccessCourse(selectedCourse)
                ? "Abrir curso en Google Drive ↗"
                : "Desbloquear con el acceso completo →"
            }}
          </button>
          <p
            v-if="
              selectedCourse.info_tecnica?.url &&
              !canAccessCourse(selectedCourse)
            "
          >
            El acceso se habilita al adquirir {{ config.title }} completo.
          </p>
          <p v-else-if="!selectedCourse.info_tecnica?.url">
            Este curso no tiene un enlace de Drive disponible en este momento.
          </p>
        </footer></template
      >
    </dialog>

    <dialog
      ref="freeDialog"
      class="free-dialog"
      aria-labelledby="free-course-title"
      @cancel.prevent="closeFreeCourseGate"
      @click="$event.target === freeDialog && closeFreeCourseGate()"
    >
      <form @submit.prevent="confirmFreeCourseAccess">
        <span class="eyebrow">ACCESO GRATUITO</span>
        <h2 id="free-course-title">Continúa al material gratuito</h2>
        <p>Ingresa un correo válido para continuar a Google Drive.</p>
        <label for="study-free-email">Correo electrónico</label
        ><input
          id="study-free-email"
          ref="freeCourseEmailRef"
          v-model="freeCourseEmail"
          type="email"
          autocomplete="email"
          required
          placeholder="tu@correo.com"
          :aria-invalid="Boolean(freeCourseEmailError)"
          :aria-describedby="
            freeCourseEmailError ? 'free-email-error' : undefined
          "
        />
        <p
          v-if="freeCourseEmailError"
          id="free-email-error"
          class="email-error"
          role="alert"
        >
          {{ freeCourseEmailError }}
        </p>
        <div class="free-actions">
          <button
            class="button button-light"
            type="button"
            @click="closeFreeCourseGate"
          >
            Cancelar</button
          ><button class="button button-primary" type="submit">
            Continuar a Drive
          </button>
        </div>
      </form>
    </dialog>

    <div class="mobile-purchase">
      <button
        class="button button-primary"
        type="button"
        :disabled="!category"
        @click="handleWebBuy('sticky')"
      >
        {{
          alreadyBought
            ? "Explorar mis rutas"
            : category
              ? `Acceder · $${formattedPrice}`
              : "Acceso completo"
        }}
      </button>
    </div>
    <a
      v-if="!routeDialogOpen && !alreadyBought"
      class="whatsapp-float whatsapp-float-page"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Consultar por WhatsApp sobre ${config.title}`"
      @click="handleWhatsApp('page_floating_button')"
      ><WhatsAppIcon /><span>Me gusta el contenido</span></a
    >
    <EmergentBuyComponent />
    <FooterComponent />
  </main>
</template>

<style scoped>

.route-finder { display: flex; flex-wrap: wrap; align-items: end; gap: 14px; margin-bottom: 24px; padding: 22px; border: 1px solid var(--line); border-radius: 18px; background: white; }
.route-finder .search-field { flex: 1 1 300px; min-width: 0; }
.route-finder > p { flex-basis: 100%; font-size: .78rem; }
.route-finder input { width: 100%; min-width: 0; }
.route-match-label { display: block; margin: 12px 0; color: var(--route-accent, var(--blue)); font-size: .7rem; font-weight: 700; }
.finder-summary { margin-bottom: 16px; }
.finder-summary > .text-button { font-size: calc(1em + 3px); }
.course-row.course-row-highlighted { background: #eef4ff; box-shadow: inset 3px 0 #315fcb; }
#finder-courses-title { scroll-margin-top: 90px; }
.finder-courses { margin-top: 32px; scroll-margin-top: 90px; }
.finder-courses > h3 { font-size: 1.35rem; margin-bottom: 8px; }
.finder-courses > p { font-size: .8rem; }
.finder-group { margin-top: 20px; padding: 20px; background: white; border: 1px solid var(--line); border-radius: 18px; min-width: 0; }
.finder-group h4 { margin: 0 0 12px; font-size: 1rem; }
.finder-course-routes { display: flex; flex-wrap: wrap; gap: 4px 18px; padding: 0 20px 16px; font-size: .75rem; color: var(--muted); }
.finder-course-routes .text-button { text-align: left; font-size: .75rem; min-height: 40px; }
.finder-course-list .course-row { width: 100%; }
@media (max-width: 600px) {
  .route-finder, .finder-group { padding: 14px; }
  .route-finder > button { width: 100%; }
  .finder-group .course-row { gap: 8px; padding: 12px 8px; }
  .finder-course-routes { padding-inline: 8px; }
  .finder-courses > h3 { font-size: 1.125rem; }
  #finder-courses-title { scroll-margin-top: 140px; }
}

.study-page {
  --ink: #152842;
  --muted: #5c6d81;
  --blue: #047857;
  --line: #dfe7f1;
  font-family: "Poppins", ui-sans-serif, system-ui, sans-serif;
  background: #f8fafc;
  color: var(--ink);
}
.study-page *,
.study-page *::before,
.study-page *::after {
  box-sizing: border-box;
}
.study-page button,
.study-page input {
  font: inherit;
}
.study-page button {
  cursor: pointer;
}
.study-page button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.study-page :focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 4px;
}
.study-page h1,
.study-page h2,
.study-page h3,
.study-page p {
  margin: 0;
}
.study-page a {
  text-decoration: none;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--blue);
  font-size: 0.7rem;
  letter-spacing: 0.13em;
  font-weight: 800;
}
.section,
.hero-inner,
.pack-strip {
  width: min(1240px, calc(100% - 64px));
  margin-inline: auto;
}
.section {
  padding-block: 52px;
}
.section h2 {
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.2;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  margin-bottom: 28px;
}
.section-heading h2 {
  margin: 10px 0;
}
.section-heading p,
.section p {
  color: var(--muted);
  line-height: 1.7;
}
.button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 13px 21px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.86rem;
  text-align: center;
  line-height: 1.4;
  transition:
    background 0.18s,
    transform 0.18s;
}
.button:hover {
  transform: translateY(-2px);
}
.button-primary {
  background: var(--blue);
  color: white;
  box-shadow: 0 6px 18px #0478571a;
}
.button-primary:hover {
  background: var(--accent-hover, #065f46);
}
.button-light {
  background: white;
  border-color: #dfe7f1;
  color: #233d60;
}
.button-light:hover {
  background: var(--hero-background, #ecfdf5);
}
.text-button {
  border: 0;
  background: none;
  padding: 8px 0;
  color: var(--blue);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.study-hero {
  background:
    radial-gradient(ellipse at 30% 0%, var(--hero-tint, #d1fae5) 0, transparent 65%), var(--hero-background, #f0fdf4);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}
.hero-inner {
  display: grid;
  grid-template-columns: 1.12fr 1fr;
  align-items: center;
  gap: 60px;
  padding-block: 70px;
}
.hero-copy h1 {
  margin: 22px 0;
  font-size: clamp(2.4rem, 4.25vw, 3.6rem);
  line-height: 1.12;
  letter-spacing: -0.055em;
  font-weight: 850;
}
.hero-copy h1 span {
  color: var(--blue);
}
.hero-description {
  max-width: 570px;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.85;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}
.hero-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 26px;
  font-size: 0.72rem;
  color: var(--muted);
}
.hero-facts b {
  color: #16a34a;
  margin-right: 4px;
}
.hero-visual {
  position: relative;
  padding-bottom: 36px;
}
.hero-visual > img {
  display: block;
  width: 100%;
  height: 430px;
  object-fit: contain;
  background: #fff;
  padding: 44px 14px 50px;
  border-radius: 24px;
  box-shadow: 0 24px 70px #15345c1c;
}
.personalized-page .route-image-report img[src$=".webp"] {
  object-fit: cover;
  padding: 0;
}
.personalized-page .hero-visual > img {
  object-fit: cover;
  padding: 0;
}
.hero-image-label {
  position: absolute;
  bottom: 12px;
  left: -22px;
  right: 25px;
  display: flex;
  gap: 13px;
  align-items: center;
  padding: 22px;
  border: 1px solid #e3eaf5;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 36px #15345c16;
}
.image-label-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #eaf1ff;
  color: var(--blue);
  font-size: 1.6rem;
}
.hero-image-label strong {
  font-size: 0.87rem;
  display: block;
}
.hero-image-label div > span {
  display: block;
  color: var(--muted);
  font-size: 0.72rem;
  margin-top: 5px;
}
.hero-photo-pill {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #fffef3ed;
  padding: 9px 12px;
  border-radius: 8px;
  color: #334155;
  font-size: 0.57rem;
  letter-spacing: 0.08em;
  font-weight: 800;
}
.pack-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding-block: 30px;
  border-bottom: 1px solid var(--line);
}
.pack-strip > div:first-child {
  max-width: 680px;
}
.pack-strip h2 {
  margin: 8px 0;
  font-size: 1.17rem;
  font-weight: 800;
}
.pack-strip p {
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--muted);
}
.pack-purchase {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
}
.price small {
  display: block;
  color: var(--muted);
  font-size: 0.65rem;
}
.price strong {
  display: block;
  font-size: 1.65rem;
  font-weight: 850;
  letter-spacing: -0.04em;
}
.price strong span {
  font-size: 0.65rem;
  letter-spacing: 0;
}
.inline-error {
  max-width: 300px;
}
.inline-error p {
  color: #b91c1c;
}
.count-pill {
  display: inline-block;
  background: #eaf1ff;
  color: #2b4e83;
  border: 1px solid #d8e5fc;
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}
.routes-section {
  scroll-margin-top: 100px;
}
.route-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}
.route-card {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 17px;
  background: white;
  overflow: hidden;
  text-align: left;
  color: var(--ink);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}
.route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px #203d6410;
  border-color: var(--route-accent);
}
.route-card.selected {
  border-color: var(--route-accent);
  box-shadow: 0 0 0 2px var(--route-accent);
}
.route-card-image {
  position: relative;
  height: 170px;
  overflow: hidden;
  background: color-mix(in srgb, var(--route-accent) 5%, white);
}
.route-card-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
.route-image-logo img {
  padding: 24px 32px 44px;
}
.route-image-report img {
  padding: 12px 14px 40px;
}
.route-card-tag {
  position: absolute;
  z-index: 1;
  bottom: 13px;
  left: 16px;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 0.58rem;
  font-weight: 700;
  background: white;
  color: var(--route-accent);
}
.route-card-copy {
  padding: 20px;
}
.route-card-title {
  display: flex;
  align-items: start;
  gap: 15px;
  justify-content: space-between;
}
.route-card-title h3 {
  font-size: 1.07rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.35;
}
.route-card-arrow {
  color: var(--route-accent);
  font-size: 1.3rem;
}
.route-card-copy p {
  margin-top: 10px;
  min-height: 48px;
  font-size: 0.79rem;
  line-height: 1.65;
}
.route-card-bottom {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #edf1f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 0.66rem;
  color: var(--muted);
}
.route-card-bottom strong {
  color: var(--route-accent);
}
.catalog-note {
  font-size: 0.72rem;
  margin-top: 20px !important;
}
.image-credits {
  display: inline-block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.7rem;
  text-decoration: underline !important;
  text-underline-offset: 3px;
}
.route-detail {
  padding-top: 12px;
}
.detail-intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
  padding: 36px;
  border-radius: 20px;
  background: white;
  border: 1px solid var(--line);
  border-top: 4px solid var(--route-accent);
}
.detail-intro h2 {
  margin: 12px 0 16px;
  scroll-margin-top: 110px;
}
.detail-intro p {
  font-size: 0.9rem;
}
.detail-intro .count-pill {
  margin-top: 20px;
}
.learning-steps {
  padding: 0;
  margin: 0;
  list-style: none;
}
.learning-steps li {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 15px 0;
  border-bottom: 1px solid #edf1f6;
  font-size: 0.83rem;
  line-height: 1.6;
}
.learning-steps li:last-child {
  border-bottom: 0;
}
.step-number {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  background: #f1f5f9;
  color: var(--route-accent);
  border-radius: 11px;
  font-size: 0.8rem;
  font-weight: 800;
}
.catalog-toolbar {
  margin: 36px 0 25px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 40px;
}
.catalog-toolbar h3 {
  font-size: 1.1rem;
  font-weight: 800;
}
.catalog-toolbar p {
  margin-top: 8px;
  max-width: 670px;
  font-size: 0.76rem;
}
.search-field {
  flex: 0 1 300px;
  min-width: 0;
}
.search-field label {
  display: block;
  font-size: 0.71rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.search-field > div {
  position: relative;
}
.search-field input,
.search-field select,
.free-dialog input {
  width: 100%;
  padding: 13px 38px 13px 14px;
  border: 1px solid #cbd8e7;
  background: white;
  border-radius: 11px;
  color: var(--ink);
  font-size: 0.8rem;
}
.search-field div > span {
  position: absolute;
  top: 8px;
  right: 15px;
  font-size: 1.4rem;
  color: var(--muted);
  pointer-events: none;
}
.search-results {
  font-size: 0.8rem;
  margin-bottom: 18px !important;
}
.level-groups {
  display: grid;
  gap: 22px;
}
.level-group {
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.level-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 24px;
  background: #f2f6fc;
}
.level-heading h3 {
  font-size: 1rem;
  font-weight: 800;
}
.level-heading h3 span {
  margin-left: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  background: white;
  color: var(--route-accent);
  font-size: 0.73rem;
}
.level-heading p {
  font-size: 0.75rem;
  margin-top: 7px;
}
.level-marker {
  color: var(--route-accent);
  font-size: 1.5rem;
}
.course-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.course-list li + li {
  border-top: 1px solid #edf1f6;
}
.course-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border: 0;
  text-align: left;
  color: var(--ink);
  transition: background 0.18s;
}
.course-row:hover {
  background: #f8faff;
}
.course-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #e5ecf4;
  border-radius: 10px;
  font-size: 1.2rem;
  color: var(--route-accent);
}
.course-row-copy {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.course-row-copy strong {
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.6;
  display: block;
}
.course-row-copy > span {
  display: block;
  font-size: 0.67rem;
  color: var(--muted);
  margin-top: 4px;
}
.course-open-label {
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--blue);
  font-weight: 700;
}
.free-badge {
  flex-shrink: 0;
  font-size: 0.65rem;
  background: #dcfce7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
}
.expand-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 16px;
  border: 0;
  border-top: 1px solid var(--line);
  background: #fafcff;
  color: var(--blue);
  font-size: 0.78rem;
  font-weight: 700;
}
.expand-button:hover {
  background: var(--hero-background, #ecfdf5);
}
.full-catalog-link {
  display: inline-block;
  margin-top: 24px;
  color: var(--blue);
  font-size: 0.8rem;
  font-weight: 700;
}
.error-panel,
.empty-panel {
  padding: 36px;
  border: 1px solid var(--line);
  background: white;
  border-radius: 16px;
  text-align: center;
}
.error-panel {
  border-color: #fecaca;
  background: #fff8f8;
}
.error-panel h3,
.empty-panel h3 {
  font-weight: 750;
}
.error-panel p,
.empty-panel p {
  margin: 10px 0 16px;
  font-size: 0.85rem;
}
.how-section {
  border-top: 1px solid var(--line);
}
.how-section h2 {
  margin-top: 12px;
}
.how-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 35px;
  margin-top: 28px;
}
.how-grid article > span {
  display: block;
  color: var(--blue);
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 15px;
}
.how-grid h3 {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 10px;
}
.how-grid p {
  font-size: 0.83rem;
}
.faq-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 70px;
  border-top: 1px solid var(--line);
}
.faq-section h2 {
  margin: 12px 0;
}
.faq-section > div > p {
  font-size: 0.85rem;
}
.faq-list article {
  border-bottom: 1px solid var(--line);
}
.faq-list h3 button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 100%;
  border: 0;
  background: none;
  text-align: left;
  color: var(--ink);
  padding: 20px 0;
  font-size: 0.86rem;
  font-weight: 700;
}
.faq-list h3 span {
  color: var(--blue);
  font-size: 1.25rem;
}
.faq-list article > p {
  font-size: 0.8rem;
  padding-bottom: 20px;
}
.final-section {
  display: grid;
  grid-template-columns: 1fr 0.6fr;
  align-items: center;
  gap: 50px;
  background: var(--accent-hover, #064e3b);
  color: white;
  border-radius: 23px;
  padding: 46px;
  margin-bottom: 60px;
}
.final-section .eyebrow {
  color: var(--hero-tint, #a7f3d0);
}
.final-section h2 {
  margin: 14px 0;
}
.final-section p {
  color: var(--hero-tint, #d1fae5);
  font-size: 0.87rem;
  max-width: 590px;
}
.final-section .final-count {
  font-size: 0.76rem;
  margin-top: 14px;
  color: var(--hero-tint, #a7f3d0);
}
.final-actions {
  display: grid;
  gap: 12px;
}
.final-price {
  font-size: 2.2rem;
  letter-spacing: -0.04em;
  text-align: center;
}
.final-price span {
  font-size: 0.8rem;
  letter-spacing: 0;
}
.button-white {
  background: white;
  color: #064e3b;
}
.button-outline-white {
  border-color: #7a9bd0;
  color: white;
  background: transparent;
}
.route-dialog,
.course-dialog,
.free-dialog {
  padding: 0;
  border: 1px solid #dfe7f1;
  border-radius: 20px;
  background: white;
  color: var(--ink);
  width: min(820px, calc(100% - 32px));
  max-height: 85dvh;
  margin: auto;
  box-shadow: 0 24px 80px #10274755;
}
.course-dialog[open] {
  display: flex;
  flex-direction: column;
}
.route-dialog::backdrop,
.course-dialog::backdrop,
.free-dialog::backdrop {
  background: #10213ec9;
  backdrop-filter: blur(5px);
}
.route-dialog {
  width: min(1100px, calc(100% - 32px));
  max-height: 90dvh;
  overflow: hidden;
}
.route-dialog[open] {
  display: flex;
  flex-direction: column;
}
.route-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.route-dialog-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  min-height: 0;
  padding-bottom: 96px;
}
.route-dialog .route-detail {
  width: 100%;
  margin: 0;
  padding: 24px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
  padding: 26px;
  border-bottom: 1px solid var(--line);
}
.dialog-header > div {
  min-width: 0;
}
.dialog-header h2 {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.45;
  margin-top: 8px;
  overflow-wrap: anywhere;
}
.dialog-header p {
  color: var(--muted);
  font-size: 0.75rem;
  margin-top: 8px;
}
.dialog-close {
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #f8fafc;
  height: 36px;
  width: 36px;
  font-size: 1.4rem !important;
}
.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 26px;
  min-height: 100px;
}
.dialog-footer {
  padding: 22px 26px;
  border-top: 1px solid var(--line);
  background: #f8fafc;
}
.dialog-footer .button {
  width: 100%;
}
.dialog-footer p {
  text-align: center;
  color: var(--muted);
  font-size: 0.75rem;
  line-height: 1.7;
}
.dialog-footer .button + p {
  margin-top: 10px;
}
.empty-description {
  color: var(--muted);
  line-height: 1.8;
  font-size: 0.88rem;
}
.course-content {
  color: #40536c;
  font-size: 0.9rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
  max-width: 100%;
  overflow-x: auto;
}
.course-content :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
}
.course-content :deep(p) {
  margin-bottom: 1rem;
}
.course-content :deep(h2),
.course-content :deep(h3) {
  color: var(--ink);
  font-weight: 800;
  line-height: 1.4;
  margin: 1rem 0 0.7rem;
}
.course-content :deep(ul),
.course-content :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.8rem 0;
}
.course-content :deep(ul) {
  list-style: disc;
}
.course-content :deep(ol) {
  list-style: decimal;
}
.course-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.course-content :deep(a) {
  color: var(--blue);
  text-decoration: underline;
}
.free-dialog {
  width: min(460px, calc(100% - 32px));
  padding: 30px;
}
.free-dialog h2 {
  font-size: 1.45rem;
  margin: 12px 0;
  font-weight: 800;
}
.free-dialog p {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.7;
}
.free-dialog label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  margin: 24px 0 8px;
}
.free-dialog .email-error {
  color: #b91c1c;
  margin-top: 10px;
}
.free-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}
.free-actions .button {
  flex: 1;
  padding-inline: 12px;
}
.whatsapp-inline-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #168844;
}
.button-outline-white .whatsapp-inline-icon {
  color: white;
}
.whatsapp-float {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 56px;
  padding: 14px 20px;
  border-radius: 999px;
  background: #087f3f;
  color: white;
  box-shadow: 0 8px 26px #064e3b40;
  font-size: 0.82rem;
  font-weight: 700;
  transition:
    background 0.18s,
    transform 0.18s;
}
.whatsapp-float:hover {
  background: #066c35;
  transform: translateY(-2px);
}
.whatsapp-float svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}
.whatsapp-float-page {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 35;
}
.whatsapp-float-route {
  position: absolute;
  right: 24px;
  bottom: 20px;
  z-index: 1;
}

.mobile-purchase {
  display: none;
}
.skeleton {
  background: linear-gradient(110deg, #e9eef6 30%, #f5f8fc 50%, #e9eef6 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 14px;
}
.route-skeleton {
  height: 315px;
}
.price-skeleton {
  width: 280px;
  height: 60px;
}
.content-skeleton {
  width: 100%;
  height: 160px;
  margin-bottom: 20px;
}
.loading-message {
  grid-column: 1 / -1;
  font-size: 0.85rem;
  text-align: center;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
@media (max-width: 1100px) {
  .hero-inner {
    gap: 30px;
  }
  .hero-visual > img {
    height: 390px;
  }
  .pack-strip {
    align-items: start;
  }
  .pack-purchase {
    flex-direction: column;
    align-items: start;
    gap: 10px;
  }
  .route-grid {
    gap: 18px;
  }
  .route-card-copy {
    padding: 17px;
  }
}
@media (max-width: 850px) {
  .section,
  .hero-inner,
  .pack-strip {
    width: calc(100% - 40px);
  }
  .hero-inner {
    grid-template-columns: 1fr;
    padding-block: 45px;
    gap: 32px;
  }
  .hero-copy h1 {
    max-width: 670px;
    font-size: 2.8rem;
  }
  .hero-visual {
    max-width: 650px;
    width: 100%;
    margin: auto;
  }
  .hero-visual > img {
    height: 350px;
  }
  .hero-image-label {
    left: 15px;
    right: 15px;
  }
  .route-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .detail-intro {
    gap: 25px;
    padding: 26px;
  }
  .catalog-toolbar {
    gap: 22px;
  }
  .search-field {
    flex-basis: 260px;
  }
  .faq-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .final-section {
    gap: 25px;
    padding: 32px;
  }
  .how-grid {
    gap: 22px;
  }
}

.full-catalog {
  --route-accent: var(--blue);
}
.full-catalog h2 {
  margin-top: 10px;
  scroll-margin-top: 100px;
}
.catalog-course-list {
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.catalog-pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.catalog-pagination > span {
  font-size: 0.8rem;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .study-page *,
  .study-page *::before,
  .study-page *::after {
    scroll-behavior: auto !important;
    animation: none !important;
    transition: none !important;
  }
}
</style>

<style scoped src="../styles/campaignMobile.css"></style>
