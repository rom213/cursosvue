<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import CategoryService from "../../../../services/CategorieService";
import ApiService from "../../../../services/ApiService";
import type { ICategory, ICategoryCourseDetail } from "../../../../types/Categorie";
import { emergentBuyStore } from "../../../../store/EmergentBuyStore";
import { authStore } from "../../../../store/AuthStore";
import { useTracking } from "../../../../composables/useTracking";
import { useCampaignReturn } from "../../../../composables/useCampaignReturn";
import { pageViewCoordinator } from "../../../../analytics/pageViewCoordinator";
import EmergentBuyComponent from "../../../emergent.buy.component.vue";
import FooterComponent from "../../../../components/footer/footer.component.vue";
import WhatsAppIcon from "../../components/WhatsAppIcon.vue";
import StudyPurposeIcon from "../../components/StudyPurposeIcon.vue";
import { CursorArrowRaysIcon } from "@heroicons/vue/24/outline";
import {
  STUDY_CATEGORY_ID,
  STUDY_CAMPAIGN_ID,
  STUDY_ROUTES,
  coursesForStudyPurpose,
  groupStudyCourses,
  studyCourseKey,
} from "../../routes/studyRoutes";
import type { StudyLevel } from "../../routes/studyRoutes";
import { EXCEL_PURPOSES } from "../../routes/studyPurposes";
import { useLazyStudyCatalog } from "../../composables/useLazyStudyCatalog";

defineOptions({ name: "ExcelSapCampaignPage" });

const route = useRoute();
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
const selectedPurposeId = ref("");
const search = ref("");
const {
  stateFor, loadRoute, catalogItems, catalogTotal, catalogPage, catalogPages,
  catalogSearch, catalogAuthor, catalogEnabled, catalogLoading, catalogError,
  loadCatalog, changeCatalogPage: requestCatalogPage,
  authors, authorsLoading, authorsError, loadAuthors,
} = useLazyStudyCatalog(STUDY_CATEGORY_ID);
const catalogHeading = ref<HTMLElement | null>(null);
const selectedCourseRouteTitle = ref("");
const expandedLevels = ref<StudyLevel[]>([]);
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

const routesWithCourses = computed(() => STUDY_ROUTES.map((definition) => ({
  ...definition,
  courses: stateFor(definition.id).items,
  loaded: stateFor(definition.id).loaded,
})));
// Counts and availability are confirmed only when a route is opened.
const visibleRoutes = routesWithCourses;
// Excel es el producto que se vende; las demás rutas del bloque se presentan como regalo.
const excelRoute = computed(() => visibleRoutes.value.find((item) => item.id === "excel")!);
const bonusRoutes = computed(() => visibleRoutes.value.filter((item) => item.id !== "excel"));
const bonusPreview = computed(() =>
  bonusRoutes.value.slice(0, 4).map((item) => item.title.replace(/^Ruta /, "")).join(", "),
);
// Logotipos que se leen bien a 28 px.
const bonusLogos = computed(() =>
  ["power-bi", "sap", "access", "gestion-proyectos", "looker-studio"]
    .map((id) => bonusRoutes.value.find((item) => item.id === id))
    .filter((item) => item !== undefined),
);
function isRouteSelected(id: string) {
  return routeDialogOpen.value && selectedRouteId.value === id;
}
function routeCountLabel(studyRoute: { loaded: boolean; courses: ICategoryCourseDetail[] }) {
  if (!studyRoute.loaded) return "Explora los cursos de esta ruta";
  const total = studyRoute.courses.length;
  return `${total} ${total === 1 ? "curso disponible" : "cursos disponibles"}`;
}

const excelSheetRows = [
  { level: "Inicial", learn: "Formatos, referencias y tus primeras fórmulas", formula: "=SUMA(B2:B13)" },
  { level: "Intermedio", learn: "Funciones lógicas, búsquedas y gráficos", formula: "=BUSCARX(A2; Clientes; Ventas)" },
  { level: "Avanzado", learn: "Tablas dinámicas, Power Query y dashboards", formula: '=SUMAR.SI.CONJUNTO(Ventas; Región; "Norte")' },
  { level: "Automatización", learn: "Macros y VBA para tareas repetitivas", formula: "Sub GenerarReporte()" },
];
const activeSheetRow = ref(1);
const excelTopics = [
  "Fórmulas y funciones",
  "BUSCARX y BUSCARV",
  "Tablas dinámicas",
  "Formato condicional",
  "Gráficos y dashboards",
  "Power Query",
  "Validación de datos",
  "Macros y VBA",
].map((label, index) => ({ label, ref: `${"AB"[index % 2]}${Math.floor(index / 2) + 1}` }));
const routeLoading = computed(() => stateFor(selectedRouteId.value).loading);
const routeError = computed(() => stateFor(selectedRouteId.value).error);
const selectedStudyRoute = computed(
  () =>
    routesWithCourses.value.find((item) => item.id === selectedRouteId.value) ??
    routesWithCourses.value[0]!,
);
const routePurposes = computed(() => selectedStudyRoute.value.purposes ?? []);
const purposeOptions = computed(() => selectedStudyRoute.value.courses.length === 0 ? [] : routePurposes.value.map((purpose) => ({
  ...purpose,
  courseCount: coursesForStudyPurpose(selectedStudyRoute.value.courses, routePurposes.value, purpose.id).length,
})));
const selectedPurpose = computed(() => routePurposes.value.find((purpose) => purpose.id === selectedPurposeId.value));
const choosingPurpose = computed(() => purposeOptions.value.length > 0 && !selectedPurpose.value);
const showLevels = computed(() => !routeLoading.value && !routeError.value && !choosingPurpose.value);
const purposeCourses = computed(() => routePurposes.value.length
  ? coursesForStudyPurpose(selectedStudyRoute.value.courses, routePurposes.value, selectedPurposeId.value)
  : selectedStudyRoute.value.courses);
const courseGroups = computed(() =>
  groupStudyCourses(purposeCourses.value, search.value),
);
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
  () => category.value?.cantidad_cursos ?? catalogTotal.value,
);
function whatsappLink(message: string) {
  const price = category.value ? ` por $${formattedPrice.value} COP` : "";
  return `https://wa.me/573209971514?text=${encodeURIComponent(`${message} Quiero consultar cómo obtener el paquete Excel con las rutas de regalo (bloque 103)${price}. ¿Me ayudan?`)}`;
}
const whatsappUrl = computed(() =>
  whatsappLink("Hola, me interesa el paquete Excel."),
);
const routeWhatsappUrl = computed(() =>
  whatsappLink(
    selectedRouteId.value === "excel"
      ? "Hola, me gustó la Ruta Excel y quiero estudiar sus cursos."
      : `Hola, vi que la ${selectedStudyRoute.value.title} viene de regalo con el paquete Excel.`,
  ),
);

const purchaseFaqs = [
  {
    question: "¿Qué incluye mi compra?",
    answer:
      "Incluye el paquete Excel completo, de nivel inicial a avanzado, y de regalo las demás rutas del bloque 103: Power BI, Análisis de datos, Office, Business Intelligence, SAP y más. Todo con un solo pago; las rutas no se compran por separado.",
  },
  {
    question: "¿En qué orden estudio los cursos?",
    answer:
      "Empieza por Excel en el nivel inicial, continúa con el intermedio y explora el avanzado cuando tengas las bases. Después aprovecha las rutas de regalo, como Power BI o Análisis de datos, para dar el siguiente paso. No es necesario cursarlos todos.",
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
      "El precio mostrado corresponde a un pago único por el paquete Excel, con las rutas de regalo incluidas. Puedes estudiar a tu ritmo, según tu disponibilidad.",
  },
];

const faqs = computed(() => alreadyBought.value
  ? purchaseFaqs.filter((_, index) => index !== 0 && index !== 4).map((faq) =>
      faq.question === "¿Cómo accedo al material?"
        ? { ...faq, answer: "Elige una ruta, abre el temario de un curso y pulsa «Abrir curso en Google Drive». Tu acceso al paquete Excel y a las rutas de regalo ya está activo." }
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
        content_name: "Paquete Excel",
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

async function selectStudyRoute(id: string, event: Event, purposeId = "") {
  routeTrigger = event.currentTarget as HTMLElement;
  routeDialogOpen.value = true;
  selectedRouteId.value = id;
  selectedPurposeId.value = purposeId;
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
  if (purposeId) trackStudyPurpose(purposeId);
  await nextTick();
  if (!componentActive || !routeDialogOpen.value) return;
  routeDialog.value?.showModal();
  lockScroll();
  routeHeading.value?.focus({ preventScroll: true });
}

function selectStudyPurpose(id: string) {
  selectedPurposeId.value = id;
  search.value = "";
  expandedLevels.value = [];
  trackStudyPurpose(id);
}
function trackStudyPurpose(id: string) {
  trackCustom("StudyPurposeSelect", {
    content_id: STUDY_CATEGORY_ID,
    content_name: selectedStudyRoute.value.title,
    custom_data: { campaign_id: STUDY_CAMPAIGN_ID, study_route: selectedRouteId.value, study_purpose: id },
  });
}
function changeStudyPurpose() {
  selectedPurposeId.value = "";
  search.value = "";
  nextTick(() => routeHeading.value?.focus({ preventScroll: true }));
}

function closeStudyRoute(restoreFocus = true) {
  routeDialog.value?.close();
  routeDialogOpen.value = false;
  unlockScroll();
  if (restoreFocus) nextTick(() => routeTrigger?.focus());
}

function visibleGroupCourses(group: {
  id: StudyLevel;
  courses: ICategoryCourseDetail[];
}) {
  return expandedLevels.value.includes(group.id)
    ? group.courses
    : group.courses.slice(0, 6);
}
function toggleLevel(level: StudyLevel) {
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
function scrollToCatalog() {
  document
    .getElementById("catalogo-completo")
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
  { element: HTMLMetaElement; content: string; created: boolean }
>();
function setupMetadata() {
  previousTitle = document.title;
  const title = "Paquete Excel de básico a avanzado + rutas de regalo | Cursos Estudia y Trabaja";
  const description =
    "Domina Excel: fórmulas, tablas dinámicas, dashboards y macros. Con tu paquete Excel recibes de regalo las rutas de Power BI, análisis de datos, Office, SAP y más.";
  document.title = title;
  for (const [attribute, key, value] of [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    [
      "property",
      "og:image",
      `${window.location.origin}/images/campaigns/excel/excel-social.webp`,
    ],
  ] as const) {
    const selector = `meta[${attribute}="${key}"]`;
    const existing = document.head.querySelector<HTMLMetaElement>(selector);
    const element = existing ?? document.createElement("meta");
    previousMeta.set(selector, {
      element,
      content: element.content,
      created: !existing,
    });
    element.setAttribute(attribute, key);
    element.content = value;
    if (!existing) document.head.appendChild(element);
  }
}
function completePageView() {
  const token = pageViewCoordinator.activeTokenFor(window.location.href);
  if (token != null) pageViewCoordinator.complete(token, document.title);
}
onMounted(() => {
  setupMetadata();
  activateCampaign({
    id: STUDY_CAMPAIGN_ID,
    title: "tu paquete Excel",
    path: route.fullPath,
    categoryId: STUDY_CATEGORY_ID,
  });
  completePageView();
  void loadLanding();
});
watch(
  () => route.fullPath,
  async () => {
    if (!componentActive || route.name !== "excel-campaign") return;
    activateCampaign({
      id: STUDY_CAMPAIGN_ID,
      title: "tu paquete Excel",
      path: route.fullPath,
      categoryId: STUDY_CATEGORY_ID,
    });
    await nextTick();
    if (componentActive) completePageView();
  },
  { flush: "post" },
);
onBeforeUnmount(() => {
  componentActive = false;
  landingSequence++;
  contentSequence++;
  routeDialogOpen.value = false;
  unlockScroll();
  document.title = previousTitle;
  for (const {
    element,
    content: previousContent,
    created,
  } of previousMeta.values()) {
    if (created) element.remove();
    else element.content = previousContent;
  }
});
</script>

<template>
  <main class="study-page">
    <section class="xl-hero">
      <picture class="xl-hero-art">
        <source
          media="(max-width: 700px)"
          srcset="/images/campaigns/excel/excel-hero-mobile.webp"
          width="900"
          height="606"
        />
        <img
          src="/images/campaigns/excel/excel-hero.webp"
          alt="Ícono 3D de Microsoft Excel sobre fondo verde"
          width="2000"
          height="1347"
          fetchpriority="high"
        />
      </picture>
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="hero-badge"
            ><span class="hero-badge-dot" aria-hidden="true"></span>
            {{ alreadyBought ? "TU PAQUETE EXCEL ESTÁ ACTIVO" : "PAQUETE EXCEL · DE BÁSICO A AVANZADO" }}</span
          >
          <h1 v-if="alreadyBought">
            Tus cursos de Excel
            <span>están listos para ti</span>
          </h1>
          <h1 v-else>
            Domina Excel
            <span>y convierte datos en oportunidades</span>
          </h1>
          <div class="formula-bar" aria-hidden="true">
            <span class="formula-cell">B7</span><span class="formula-fx">fx</span
            ><span class="formula-text"
              ><span>=SI(dominas_Excel; "más oportunidades"; "empieza hoy")</span></span
            >
          </div>
          <p v-if="alreadyBought" class="hero-description">
            Tu acceso al paquete Excel y a las {{ bonusRoutes.length }} rutas de regalo
            ya está activo. Elige un curso según tu nivel y ábrelo en Google Drive
            desde esta misma página.
          </p>
          <p v-else class="hero-description">
            Fórmulas, tablas dinámicas, dashboards y macros: aprende Excel desde
            cero hasta nivel avanzado. Y con tu paquete recibes de regalo
            {{ bonusRoutes.length }} rutas más, como Power BI, SAP y Análisis de datos.
          </p>
          <div class="hero-actions">
            <button
              class="button button-white"
              type="button"
              @click="scrollToRoutes"
            >
              {{ alreadyBought ? "Explorar mis cursos de Excel" : "Empezar con Excel" }}
              <span aria-hidden="true">↓</span>
            </button>
            <a
              v-if="!alreadyBought"
              class="button button-outline-white"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleWhatsApp('hero')"
              ><WhatsAppIcon class="whatsapp-inline-icon" /> Consultar por
              WhatsApp ↗</a
            >
          </div>
          <ul class="hero-facts">
            <li><b aria-hidden="true">✓</b> De nivel inicial a avanzado</li>
            <li><b aria-hidden="true">✓</b> Tablas dinámicas, dashboards y VBA</li>
            <li>
              <b aria-hidden="true">✦</b> {{ bonusRoutes.length }} rutas de regalo
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="pack-strip" aria-label="Paquete Excel">
      <div class="pack-copy">
        <span class="eyebrow">{{ alreadyBought ? "TU ACCESO ESTÁ ACTIVO" : "UN SOLO PAGO, TODO INCLUIDO" }}</span>
        <h2>
          Paquete Excel
          <em>+ {{ bonusRoutes.length }} rutas de regalo</em>
        </h2>
        <p v-if="alreadyBought">
          Ya tienes Excel y todas las rutas de regalo. Elige un curso y ábrelo
          directamente desde aquí.
        </p>
        <p v-else>
          Aprende Excel de básico a avanzado y llévate sin costo extra
          {{ bonusPreview }} y más.
        </p>
      </div>
      <ul class="pack-logos" aria-hidden="true">
        <li v-for="studyRoute in bonusLogos" :key="studyRoute.id">
          <img :src="studyRoute.image" alt="" width="44" height="44" loading="lazy" />
        </li>
        <li class="pack-logos-more">+{{ bonusRoutes.length - bonusLogos.length }}</li>
      </ul>
      <div class="pack-purchase" aria-live="polite">
        <div
          v-if="categoryLoading"
          class="price-skeleton skeleton"
          aria-label="Cargando precio"
        ></div>
        <template v-else-if="category"
          ><div v-if="!alreadyBought" class="price">
            <small>Pago único · Excel + rutas de regalo</small
            ><strong>${{ formattedPrice }} <span>COP</span></strong>
          </div>
          <button
            class="button button-primary"
            type="button"
            data-track="campaign-pack-web"
            @click="handleWebBuy('pack')"
          >
            {{ alreadyBought ? "Explorar mis rutas" : "Obtener paquete Excel" }}
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

    <section
      id="rutas-estudio"
      class="section excel-section"
      aria-labelledby="excel-titulo"
    >
      <div class="section-heading excel-heading">
        <span class="eyebrow">LA RUTA PROTAGONISTA</span>
        <h2 id="excel-titulo">Excel, paso a paso</h2>
        <p>
          Avanza por niveles: de tus primeras fórmulas a los dashboards y la
          automatización.
        </p>
      </div>
      <div class="excel-layout">
        <div class="sheet-window">
          <div class="sheet-titlebar" aria-hidden="true">
            <span class="sheet-dots"><i></i><i></i><i></i></span>
            <span>Ruta_Excel.xlsx</span>
            <span class="sheet-saved">Guardado</span>
          </div>
          <div class="sheet-ribbon" aria-hidden="true">
            <span class="active">Inicio</span><span>Insertar</span
            ><span>Fórmulas</span><span>Datos</span><span>Vista</span>
          </div>
          <div class="sheet-formula" aria-hidden="true">
            <span class="formula-cell"
              >D{{ activeSheetRow + 2 }}</span
            ><span class="formula-fx">fx</span
            ><span class="sheet-formula-text">{{
              excelSheetRows[activeSheetRow]?.formula
            }}</span>
          </div>
          <table class="sheet-grid">
            <caption class="sr-only">
              Niveles de la ruta Excel
            </caption>
            <thead>
              <tr class="sheet-letters" aria-hidden="true">
                <td></td>
                <td>A</td>
                <td>B</td>
                <td class="sheet-formula-col">C</td>
              </tr>
              <tr>
                <td class="sheet-row-number" aria-hidden="true">1</td>
                <th scope="col">Nivel</th>
                <th scope="col">Qué aprendes</th>
                <th scope="col" class="sheet-formula-col">Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in excelSheetRows"
                :key="row.level"
                :class="{ active: activeSheetRow === index }"
                @mouseenter="activeSheetRow = index"
                @click="activeSheetRow = index"
              >
                <td class="sheet-row-number" aria-hidden="true">{{ index + 2 }}</td>
                <th scope="row">
                  <span class="sheet-level-dot" aria-hidden="true"></span>{{ row.level }}
                </th>
                <td>{{ row.learn }}</td>
                <td class="sheet-formula-col">
                  <code>{{ row.formula }}</code>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="sheet-tabs" aria-hidden="true">
            <span class="active">Ruta Excel</span><span>Power BI</span
            ><span>SAP</span><span class="sheet-tab-add">+</span>
          </div>
        </div>

        <div class="excel-start" :style="{ '--route-accent': excelRoute.accent }">
          <h3>¿Para qué quieres aprender Excel?</h3>
          <p>Elige tu objetivo y te mostramos sus cursos ordenados por nivel.</p>
          <div class="excel-goals">
            <button
              v-for="purpose in EXCEL_PURPOSES"
              :key="purpose.id"
              type="button"
              class="excel-goal"
              aria-haspopup="dialog"
              aria-controls="study-route-dialog"
              @click="selectStudyRoute(excelRoute.id, $event, purpose.id)"
            >
              <span class="purpose-icon" aria-hidden="true"
                ><StudyPurposeIcon :id="purpose.id" /></span
              ><span class="excel-goal-copy"
                ><strong>{{ purpose.title }}</strong
                ><span>{{ purpose.description }}</span></span
              ><span class="excel-goal-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <button
            type="button"
            class="route-card route-card-excel"
            :class="{ selected: isRouteSelected(excelRoute.id) }"
            :style="{ '--route-accent': excelRoute.accent }"
            :aria-pressed="isRouteSelected(excelRoute.id)"
            aria-haspopup="dialog"
            aria-controls="study-route-dialog"
            @click="selectStudyRoute(excelRoute.id, $event)"
          >
            <div class="route-card-image route-image-logo">
              <img
                :src="excelRoute.image"
                :alt="excelRoute.imageAlt"
                width="640"
                height="400"
                loading="lazy"
              /><span class="route-card-tag">Ruta principal</span>
            </div>
            <div class="route-card-copy">
              <div class="route-card-title">
                <h3>{{ excelRoute.title }}</h3>
                <span class="route-card-arrow" aria-hidden="true">↗</span>
              </div>
              <p>{{ excelRoute.summary }}</p>
              <span class="route-card-bottom"
                ><span>{{ routeCountLabel(excelRoute) }}</span
                ><strong>{{
                  isRouteSelected(excelRoute.id) ? "Seleccionada" : "Ver todos los cursos"
                }}</strong></span
              >
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="section skills-section" aria-labelledby="skills-titulo">
      <figure class="skills-photo">
        <img
          src="/images/campaigns/excel/excel-trabajo.webp"
          alt="Persona trabajando en un portátil con una hoja de cálculo con formato condicional"
          width="1200"
          height="900"
          loading="lazy"
        />
        <figcaption class="skills-chip" aria-hidden="true">
          <span>fx</span> =SUMAR.SI.CONJUNTO(Ventas; Mes; "Oct")
        </figcaption>
      </figure>
      <div class="skills-copy">
        <span class="eyebrow">LO QUE VAS A PRACTICAR</span>
        <h2 id="skills-titulo">Las habilidades de Excel que más se usan en el trabajo</h2>
        <p>
          Temas frecuentes en los cursos de la ruta, para que encuentres justo lo
          que necesitas en tu día a día.
        </p>
        <ul class="skill-cells">
          <li v-for="topic in excelTopics" :key="topic.ref">
            <span class="cell-ref" aria-hidden="true">{{ topic.ref }}</span>{{ topic.label }}
          </li>
        </ul>
      </div>
    </section>

    <section id="rutas-regalo" class="bonus-band" aria-labelledby="regalo-titulo">
      <div class="section bonus-section">
        <div class="bonus-intro">
          <div>
            <span class="bonus-ribbon"
              ><span aria-hidden="true">✦</span>
              {{ alreadyBought ? "INCLUIDAS EN TU ACCESO" : "DE REGALO CON TU PAQUETE EXCEL" }}</span
            >
            <h2 id="regalo-titulo">
              {{ bonusRoutes.length }} rutas más,
              <span>sin costo extra</span>
            </h2>
            <p v-if="alreadyBought">
              Ya tienes acceso a todas. Elige una ruta para ver sus cursos y
              abrirlos en Google Drive.
            </p>
            <p v-else>
              Cuando domines Excel, da el siguiente paso con Power BI, Análisis de
              datos, SAP y más. Todas vienen incluidas en tu paquete Excel.
            </p>
          </div>
          <img
            class="bonus-photo"
            src="/images/campaigns/excel/excel-dashboard.webp"
            alt="Portátil con un dashboard de gráficos sobre un escritorio junto a una ventana"
            width="1200"
            height="675"
            loading="lazy"
          />
        </div>
        <div class="route-grid bonus-grid">
          <button
            v-for="studyRoute in bonusRoutes"
            :key="studyRoute.id"
            type="button"
            class="route-card route-card-bonus"
            :class="{ selected: isRouteSelected(studyRoute.id) }"
            :style="{ '--route-accent': studyRoute.accent }"
            :aria-pressed="isRouteSelected(studyRoute.id)"
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
                alreadyBought ? "Incluida" : "Gratis con Excel"
              }}</span>
            </div>
            <div class="route-card-copy">
              <div class="route-card-title">
                <h3>{{ studyRoute.title }}</h3>
                <span class="route-card-arrow" aria-hidden="true">↗</span>
              </div>
              <p>{{ studyRoute.summary }}</p>
              <span class="route-card-bottom"
                ><span>{{ routeCountLabel(studyRoute) }}</span
                ><strong>{{
                  isRouteSelected(studyRoute.id) ? "Seleccionada" : "Ver ruta"
                }}</strong></span
              >
            </div>
          </button>
          <div class="bonus-cta">
            <div>
              <strong>Y además, el catálogo completo</strong>
              <p v-if="category">
                {{ packTotal }} cursos entre Excel y las rutas de regalo, con un
                solo pago.
              </p>
            </div>
            <div class="bonus-cta-actions">
              <button
                v-if="category && !alreadyBought"
                class="button button-white"
                type="button"
                data-track="campaign-bonus-web"
                @click="handleWebBuy('bonus')"
              >
                Obtener paquete Excel <span aria-hidden="true">→</span>
              </button>
              <button class="text-button" type="button" @click="scrollToCatalog">
                Ver todos los cursos <span aria-hidden="true">↓</span>
              </button>
            </div>
          </div>
        </div>
        <p class="catalog-note">
          Un curso puede formar parte de varias rutas. Los contenidos se
          muestran según el catálogo disponible.
        </p>
        <a
          class="image-credits"
          href="/images/campaigns/datos-oficina/credits.html"
          target="_blank"
          rel="noopener noreferrer"
          >Créditos de las imágenes ↗</a
        >
      </div>
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
        <span class="eyebrow">{{
          selectedRouteId === "excel"
            ? "EXPLORA TU RUTA EXCEL"
            : alreadyBought
              ? "RUTA INCLUIDA EN TU ACCESO"
              : "RUTA DE REGALO CON TU PAQUETE EXCEL"
        }}</span>
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
        :aria-label="`Consultar por WhatsApp sobre la ${selectedStudyRoute.title}`"
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
            <div class="detail-pills">
              <span class="count-pill"
                >{{ selectedStudyRoute.loaded ? `${selectedStudyRoute.courses.length} cursos en esta ruta` : 'Consulta los cursos disponibles' }}</span
              >
              <span v-if="selectedRouteId !== 'excel'" class="gift-pill"
                ><span aria-hidden="true">✦</span>
                {{ alreadyBought ? "Incluida en tu acceso" : "Gratis con el paquete Excel" }}</span
              >
            </div>
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
        <section
          v-if="!routeLoading && !routeError && purposeOptions.length"
          class="purpose-picker"
          aria-labelledby="purpose-title"
        >
          <template v-if="selectedPurpose">
            <p class="purpose-current">
              <span class="purpose-icon" aria-hidden="true"><StudyPurposeIcon :id="selectedPurpose.id" /></span>
              <strong id="purpose-title">{{ selectedPurpose.title }}</strong>
              <button class="text-button" type="button" @click="changeStudyPurpose">Cambiar objetivo</button>
            </p>
          </template>
          <template v-else>
            <h3 id="purpose-title">¿Para qué quieres aprender Excel?</h3>
            <p>Haz clic en tu objetivo y te mostraremos sus cursos ordenados por nivel.</p>
            <div class="purpose-options">
              <button
                v-for="purpose in purposeOptions"
                :key="purpose.id"
                type="button"
                class="purpose-option"
                @click="selectStudyPurpose(purpose.id)"
              >
                <span class="purpose-icon" aria-hidden="true"><StudyPurposeIcon :id="purpose.id" /></span
                ><span class="purpose-copy"
                  ><strong>{{ purpose.title }}</strong
                  ><span>{{ purpose.description }}</span></span
                ><span class="purpose-action"
                  ><span class="purpose-count">{{ purpose.courseCount }} cursos</span
                  ><span class="purpose-cta"><CursorArrowRaysIcon aria-hidden="true" />Ver cursos</span></span
                >
              </button>
            </div>
          </template>
        </section>
        <div v-if="showLevels" class="catalog-toolbar">
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
        <p v-if="showLevels && search.trim()" class="search-results" role="status">
          {{ searchTotal }}
          {{ searchTotal === 1 ? "resultado" : "resultados" }} para “{{
            search.trim()
          }}”
        </p>
        <div v-if="showLevels && !courseGroups.length" class="empty-panel">
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
                : "Puedes explorar las demás rutas o consultar el catálogo completo del bloque."
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
        <div v-else-if="showLevels" class="level-groups">
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
                  ><span v-if="course.es_gratis" class="free-badge">Acceso libre</span
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
          <span class="eyebrow">TODO LO QUE INCLUYE TU PAQUETE</span>
          <h2 id="catalogo-titulo" ref="catalogHeading" tabindex="-1">Todos los cursos</h2>
          <p>Excel y las rutas de regalo en un solo catálogo. Busca por nombre y filtra por autor.</p>
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
                  ><span v-if="course.es_gratis" class="free-badge">Acceso libre</span
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
      <h2>Empieza por Excel. Sigue creciendo.</h2>
      <div class="how-grid">
        <article>
          <span aria-hidden="true">01</span>
          <h3>Elige tu objetivo</h3>
          <p>
            Trabajo, empleo, negocio o uso personal: te mostramos los cursos de
            Excel que encajan contigo.
          </p>
        </article>
        <article>
          <span aria-hidden="true">02</span>
          <h3>Avanza por niveles</h3>
          <p>
            Pasa de las fórmulas básicas a tablas dinámicas, dashboards y
            macros, a tu ritmo.
          </p>
        </article>
        <article>
          <span aria-hidden="true">03</span>
          <h3>Suma tus rutas de regalo</h3>
          <p>
            Con las bases de Excel, continúa con Power BI, Análisis de datos o
            SAP sin pagar de más.
          </p>
        </article>
      </div>
    </section>

    <section class="section faq-section">
      <div>
        <span class="eyebrow">ANTES DE EMPEZAR</span>
        <h2>Resolvemos tus dudas</h2>
        <p>Excel es tu ruta principal; las demás rutas vienen incluidas.</p>
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
        <h2>Empieza hoy con Excel.<br />Las demás rutas van de regalo.</h2>
        <p>
          Un solo pago por el paquete Excel, con {{ bonusRoutes.length }} rutas
          adicionales incluidas para seguir creciendo.
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
          Obtener paquete Excel
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
            <span class="eyebrow">{{ selectedCourseRouteTitle || "Paquete Excel" }}</span>
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
            forma parte del paquete Excel y sus rutas de regalo.
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
                : "Desbloquear con el paquete Excel →"
            }}
          </button>
          <p
            v-if="
              selectedCourse.info_tecnica?.url &&
              !canAccessCourse(selectedCourse)
            "
          >
            El acceso se habilita al adquirir el paquete Excel, que incluye todas
            las rutas de regalo.
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
              ? `Paquete Excel · $${formattedPrice}`
              : "Paquete Excel"
        }}
      </button>
    </div>
    <a
      v-if="!routeDialogOpen && !alreadyBought"
      class="whatsapp-float whatsapp-float-page"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp sobre el paquete Excel"
      @click="handleWhatsApp('page_floating_button')"
      ><WhatsAppIcon /><span>Me interesa Excel</span></a
    >
    <EmergentBuyComponent />
    <FooterComponent />
  </main>
</template>

<style scoped>
.study-page {
  --ink: #10231a;
  --muted: #526358;
  --brand: #107c41;
  --brand-dark: #0b5c30;
  --brand-deep: #0d3320;
  --brand-soft: #e7f4ec;
  --gold: #f3c34f;
  --line: #dbe7df;
  --mono: ui-monospace, "SFMono-Regular", "Cascadia Code", Consolas, monospace;
  font-family: "Poppins", ui-sans-serif, system-ui, sans-serif;
  background: #f5f8f6;
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
  outline: 3px solid #16a34a;
  outline-offset: 4px;
}
.study-page h1,
.study-page h2,
.study-page h3,
.study-page p,
.study-page figure {
  margin: 0;
}
/* El estilo global pone los h1 en Times New Roman. */
.study-page h1 {
  font-family: inherit;
}
.study-page a {
  text-decoration: none;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--brand);
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
  padding-block: 64px;
}
.section h2 {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.18;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  margin-bottom: 32px;
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
  padding: 13px 22px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.86rem;
  text-align: center;
  line-height: 1.4;
  transition:
    background 0.18s,
    transform 0.18s,
    box-shadow 0.18s;
}
.button:hover {
  transform: translateY(-2px);
}
.button-primary {
  background: var(--brand);
  color: white;
  box-shadow: 0 8px 22px #107c4130;
}
.button-primary:hover {
  background: var(--brand-dark);
}
.button-light {
  background: white;
  border-color: var(--line);
  color: var(--brand-deep);
}
.button-light:hover {
  background: var(--brand-soft);
}
.button-white {
  background: white;
  color: var(--brand-deep);
  box-shadow: 0 10px 30px #00000026;
}
.button-white:hover {
  background: #effaf3;
}
.button-outline-white {
  border-color: #ffffff59;
  color: white;
  background: #ffffff0f;
}
.button-outline-white:hover {
  background: #ffffff1f;
}
.text-button {
  border: 0;
  background: none;
  padding: 8px 0;
  color: var(--brand);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* ---------- Hero ---------- */
.xl-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: white;
  background: linear-gradient(90deg, #0b2d1b 0%, #113f27 38%, #1b5f38 62%);
}
.xl-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, #ffffff0b 0 1px, transparent 1px 36px),
    repeating-linear-gradient(90deg, #ffffff0b 0 1px, transparent 1px 110px);
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 30%, transparent 58%);
  mask-image: linear-gradient(90deg, #000 0%, #000 30%, transparent 58%);
}
.xl-hero-art {
  position: absolute;
  inset: 0 0 0 36%;
  z-index: -2;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 22%);
  mask-image: linear-gradient(90deg, transparent 0, #000 22%);
}
.xl-hero-art img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 62% center;
}
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 640px);
  align-items: center;
  min-height: clamp(560px, 80vh, 720px);
  padding-block: 72px 128px;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border: 1px solid #ffffff2e;
  border-radius: 999px;
  background: #ffffff12;
  backdrop-filter: blur(6px);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 4px #4ade8033;
}
.hero-copy h1 {
  margin: 24px 0 26px;
  font-size: clamp(2.8rem, 5.6vw, 4.75rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
}
.hero-copy h1 span {
  display: block;
  margin-top: 0.28em;
  max-width: 15em;
  color: #a6ecc2;
  font-size: 0.5em;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.03em;
}
.formula-bar {
  display: flex;
  align-items: stretch;
  max-width: 560px;
  overflow: hidden;
  border-radius: 10px;
  background: white;
  color: #1f2d25;
  font-family: var(--mono);
  font-size: 0.8rem;
  box-shadow: 0 18px 40px #00000033;
}
.formula-cell {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 52px;
  padding: 10px 12px;
  border-right: 1px solid #dfe6e1;
  color: #4b5b51;
}
.formula-fx {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  padding: 0 12px;
  border-right: 1px solid #dfe6e1;
  color: #7b8a81;
  font-family: Georgia, serif;
  font-style: italic;
}
.formula-text {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 10px 14px;
  overflow: hidden;
}
.formula-text > span {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-right: 2px solid var(--brand);
}
.hero-copy .hero-description {
  max-width: 560px;
  margin-top: 26px;
  color: #d3eadc;
  font-size: 1rem;
  line-height: 1.8;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 30px;
}
.hero-actions .whatsapp-inline-icon {
  color: #4ade80;
}
.hero-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  color: #c4e3d0;
  font-size: 0.76rem;
}
.hero-facts b {
  margin-right: 4px;
  color: #4ade80;
}
.hero-facts li:last-child b {
  color: var(--gold);
}

/* ---------- Pack strip ---------- */
.pack-strip {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 32px;
  margin-top: -76px;
  padding: 26px 30px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: white;
  box-shadow: 0 30px 70px #0d332026;
}
.pack-strip h2 {
  margin: 8px 0 6px;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.pack-strip h2 em {
  color: var(--brand);
  font-style: normal;
}
.pack-strip p {
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--muted);
}
.pack-logos {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 0 0 10px;
  list-style: none;
}
.pack-logos li {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin-left: -10px;
  border: 2px solid white;
  border-radius: 50%;
  background: #f3f7f4;
  box-shadow: 0 4px 12px #0d332014;
}
.pack-logos img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.pack-logos-more {
  background: var(--brand-deep) !important;
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
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
  font-size: 1.75rem;
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
  background: var(--brand-soft);
  color: var(--brand-dark);
  border: 1px solid #cde6d6;
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

/* ---------- Excel section ---------- */
.excel-section {
  scroll-margin-top: 90px;
  padding-top: 88px;
}
.excel-heading {
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-inline: auto;
  margin-bottom: 40px;
  max-width: 640px;
  text-align: center;
}
.excel-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
  gap: 36px;
  align-items: start;
}
.sheet-window {
  overflow: hidden;
  border: 1px solid #c9dbcf;
  border-radius: 16px;
  background: white;
  box-shadow: 0 30px 70px #0d33201c;
}
.sheet-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 40px;
  padding: 0 16px;
  background: var(--brand);
  color: white;
  font-size: 0.74rem;
  font-weight: 600;
}
.sheet-dots {
  display: flex;
  gap: 6px;
}
.sheet-dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff55;
}
.sheet-saved {
  color: #c8f0d7;
  font-size: 0.66rem;
  font-weight: 500;
}
.sheet-ribbon {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  border-bottom: 1px solid #e3ebe6;
  background: #f4f8f5;
  font-size: 0.72rem;
  color: #56665c;
  overflow: hidden;
}
.sheet-ribbon span {
  padding: 10px 10px 9px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.sheet-ribbon .active {
  border-color: var(--brand);
  color: var(--brand);
  font-weight: 700;
}
.sheet-formula {
  display: flex;
  border-bottom: 1px solid #e3ebe6;
  font-family: var(--mono);
  font-size: 0.78rem;
}
.sheet-formula-text {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 9px 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--brand-deep);
}
.sheet-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.sheet-grid td,
.sheet-grid th {
  padding: 13px 14px;
  border: 1px solid #e3ebe6;
  text-align: left;
  vertical-align: middle;
}
.sheet-grid tr > :first-child {
  border-left: 0;
}
.sheet-grid tr > :last-child {
  border-right: 0;
}
.sheet-letters td {
  padding-block: 5px;
  background: #f4f8f5;
  color: #7d8d83;
  font-size: 0.68rem;
  text-align: center;
}
.sheet-row-number {
  width: 40px;
  background: #f4f8f5;
  color: #7d8d83;
  font-size: 0.68rem;
  text-align: center !important;
}
.sheet-grid thead th {
  background: var(--brand-soft);
  color: var(--brand-dark);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.sheet-grid tbody tr {
  cursor: default;
  transition: background 0.15s;
}
.sheet-grid tbody tr:hover,
.sheet-grid tbody tr.active {
  background: #f6fbf8;
}
.sheet-grid tbody th {
  font-weight: 700;
  white-space: nowrap;
}
.sheet-level-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 9px;
  border-radius: 2px;
  background: var(--brand);
  vertical-align: 1px;
}
.sheet-grid tbody tr:nth-child(2) .sheet-level-dot {
  background: #21a366;
}
.sheet-grid tbody tr:nth-child(3) .sheet-level-dot {
  background: #33c481;
}
.sheet-grid tbody tr:nth-child(4) .sheet-level-dot {
  background: var(--gold);
}
.sheet-grid tbody td:not(.sheet-row-number) {
  color: #3c4d43;
  line-height: 1.5;
}
.sheet-grid code {
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--brand-dark);
}
.sheet-grid tbody .sheet-formula-col {
  position: relative;
  background: #fafdfb;
}
.sheet-grid tbody tr.active .sheet-formula-col {
  outline: 2px solid var(--brand);
  outline-offset: -2px;
  background: white;
}
.sheet-grid tbody tr.active .sheet-formula-col::after {
  content: "";
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 7px;
  height: 7px;
  border: 1px solid white;
  background: var(--brand);
}
.sheet-tabs {
  display: flex;
  gap: 2px;
  padding: 0 10px;
  background: #f4f8f5;
  font-size: 0.7rem;
  color: #6b7b71;
}
.sheet-tabs span {
  padding: 9px 14px;
}
.sheet-tabs .active {
  background: white;
  color: var(--brand);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--brand);
}
.sheet-tab-add {
  color: #9aa9a0;
}
.excel-start {
  display: grid;
  gap: 14px;
}
.excel-start h3 {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.excel-start > p {
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.6;
}
.excel-goals {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}
.excel-goal {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: white;
  color: var(--ink);
  text-align: left;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.excel-goal:hover,
.excel-goal:focus-visible {
  border-color: var(--brand);
  box-shadow: 0 8px 22px #107c411f;
  transform: translateX(3px);
}
.excel-goal .purpose-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
}
.excel-goal-copy {
  display: grid;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.excel-goal-copy strong {
  font-size: 0.88rem;
}
.excel-goal-copy span {
  color: var(--muted);
  font-size: 0.72rem;
  line-height: 1.5;
}
.excel-goal-arrow {
  color: var(--brand);
  font-size: 1.1rem;
  font-weight: 700;
}

/* ---------- Route cards ---------- */
.route-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
/* Columna flexible: un <button> centra su contenido y desalinea las tarjetas de una fila. */
.route-card {
  display: flex;
  flex-direction: column;
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
  box-shadow: 0 16px 34px #0000002e;
  border-color: var(--route-accent);
}
.route-card.selected {
  border-color: var(--route-accent);
  box-shadow: 0 0 0 2px var(--route-accent);
}
.route-card-image {
  position: relative;
  flex-shrink: 0;
  height: 130px;
  overflow: hidden;
  background: color-mix(in srgb, var(--route-accent) 6%, white);
}
.route-card-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
.route-image-logo img {
  padding: 20px 32px 40px;
}
.route-image-report img {
  padding: 10px 12px 36px;
}
.route-card-tag {
  position: absolute;
  z-index: 1;
  bottom: 10px;
  left: 14px;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: var(--gold);
  color: #3b2a00;
}
.route-card-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px 18px 18px;
}
.route-card-title {
  display: flex;
  align-items: start;
  gap: 12px;
  justify-content: space-between;
}
.route-card-title h3 {
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
}
.route-card-arrow {
  color: var(--route-accent);
  font-size: 1.2rem;
}
.route-card-copy p {
  margin: 8px 0 14px;
  min-height: 44px;
  font-size: 0.76rem;
  line-height: 1.6;
  color: var(--muted);
}
.route-card-bottom {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #edf2ee;
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
.route-card-excel {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  margin-top: 6px;
  border: 0;
  background: linear-gradient(135deg, var(--brand-deep), var(--brand));
  color: white;
  box-shadow: 0 18px 40px #0d33203d;
}
.route-card-excel:hover {
  box-shadow: 0 22px 46px #0d332055;
}
.route-card-excel .route-card-image {
  height: auto;
  min-height: 150px;
  background: #ffffff14;
}
.route-card-excel .route-image-logo img {
  padding: 26px 22px 46px;
}
.route-card-excel .route-card-copy p {
  min-height: 0;
  color: #cdeedb;
}
.route-card-excel .route-card-arrow,
.route-card-excel .route-card-bottom strong {
  color: white;
}
.route-card-excel .route-card-bottom {
  border-color: #ffffff2b;
  color: #b8e4c9;
}

/* ---------- Skills ---------- */
.skills-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 60px;
  align-items: center;
}
.skills-photo {
  position: relative;
}
.skills-photo img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 30px 70px #0d332026;
}
.skills-chip {
  position: absolute;
  left: 20px;
  bottom: -18px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 40px);
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: white;
  color: var(--brand-dark);
  font-family: var(--mono);
  font-size: 0.74rem;
  white-space: nowrap;
  overflow: hidden;
  box-shadow: 0 14px 30px #0d33201f;
}
.skills-chip span {
  color: #7b8a81;
  font-family: Georgia, serif;
  font-style: italic;
}
.skills-copy h2 {
  margin: 12px 0 14px;
}
.skills-copy > p {
  font-size: 0.9rem;
}
.skill-cells {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: white;
}
.skill-cells li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-right: 1px solid #e6eee9;
  border-bottom: 1px solid #e6eee9;
  font-size: 0.84rem;
  font-weight: 600;
  transition: background 0.15s;
}
.skill-cells li:nth-child(2n) {
  border-right: 0;
}
.skill-cells li:nth-last-child(-n + 2) {
  border-bottom: 0;
}
.skill-cells li:hover {
  background: var(--brand-soft);
}
.skill-cells li:first-child {
  box-shadow: inset 0 0 0 2px var(--brand);
}
.cell-ref {
  min-width: 24px;
  color: #8a9a90;
  font-family: var(--mono);
  font-size: 0.66rem;
  font-weight: 500;
}

/* ---------- Bonus routes ---------- */
.bonus-band {
  margin-top: 24px;
  background:
    radial-gradient(900px 420px at 88% 0%, #1f7a4a66, transparent 65%),
    var(--brand-deep);
  color: white;
  scroll-margin-top: 90px;
}
.bonus-section {
  padding-block: 80px;
}
.bonus-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 48px;
  align-items: center;
  margin-bottom: 40px;
}
.bonus-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--gold);
  color: #3b2a00;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.bonus-section h2 {
  margin: 18px 0 14px;
  color: white;
}
.bonus-section h2 span {
  color: #9be3b7;
}
.bonus-intro p {
  max-width: 520px;
  color: #c6e4d2;
  font-size: 0.92rem;
}
.bonus-photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid #ffffff1f;
  border-radius: 20px;
  box-shadow: 0 30px 60px #00000040;
}
.route-card-bonus {
  border-color: transparent;
}
/* Ocupa el resto de la última fila: 13 rutas dejan una sola tarjeta en ella. */
.bonus-cta {
  grid-column: span 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px 28px;
  padding: 28px 32px;
  border: 1px dashed #ffffff40;
  border-radius: 17px;
  background: #ffffff0d;
}
.bonus-cta strong {
  display: block;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.bonus-cta p {
  margin-top: 6px;
  color: #c6e4d2;
  font-size: 0.82rem;
}
.bonus-cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 22px;
}
.bonus-cta .text-button {
  color: #a6ecc2;
}
.bonus-section .catalog-note {
  margin-top: 26px;
  color: #a5cdb5;
  font-size: 0.72rem;
}
.bonus-section .image-credits {
  color: #a5cdb5;
}
.image-credits {
  display: inline-block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.7rem;
  text-decoration: underline !important;
  text-underline-offset: 3px;
}

/* ---------- Route dialog ---------- */
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
.detail-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.gift-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border-radius: 999px;
  background: #fff6db;
  border: 1px solid #f6dd8f;
  color: #6b4e00;
  font-size: 0.73rem;
  font-weight: 700;
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
  border-bottom: 1px solid #edf2ee;
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
  background: #f1f6f2;
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
  border: 1px solid #c9d9ce;
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
.purpose-picker {
  margin-top: 32px;
}
.purpose-picker h3 {
  font-size: 1.1rem;
  font-weight: 800;
}
.purpose-picker > p {
  margin-top: 8px;
  font-size: 0.76rem;
}
/* Dos columnas solo cuando cada tarjeta tiene al menos 360 px dentro del modal. */
.purpose-options {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
  gap: 14px;
}
.purpose-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px;
  text-align: left;
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--ink);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.purpose-option:hover,
.purpose-option:focus-visible {
  border-color: var(--route-accent);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--route-accent) 18%, transparent);
  transform: translateY(-2px);
}
.purpose-icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--route-accent) 10%, white);
  color: var(--route-accent);
}
.purpose-icon svg {
  width: 24px;
  height: 24px;
}
.purpose-current .purpose-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}
.purpose-current .purpose-icon svg {
  width: 20px;
  height: 20px;
}
.purpose-action {
  flex-shrink: 0;
  display: grid;
  justify-items: end;
  gap: 8px;
}
.purpose-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 999px;
  background: var(--route-accent);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.purpose-cta svg {
  width: 15px;
  height: 15px;
}
.purpose-copy {
  display: grid;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.purpose-copy strong {
  font-size: 0.92rem;
}
.purpose-copy span {
  font-size: 0.74rem;
  color: var(--muted);
}
.purpose-count {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--route-accent);
}
.purpose-current {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  font-size: 0.9rem;
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
  background: #f1f7f3;
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
  border-top: 1px solid #edf2ee;
}
.course-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: white;
  border: 0;
  text-align: left;
  color: var(--ink);
  transition: background 0.18s;
}
.course-row:hover {
  background: #f4faf6;
}
.course-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #e2ece5;
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
  color: var(--brand);
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
  background: #f7fbf8;
  color: var(--brand);
  font-size: 0.78rem;
  font-weight: 700;
}
.expand-button:hover {
  background: var(--brand-soft);
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

/* ---------- Catalog, how, FAQ, final ---------- */
.full-catalog {
  --route-accent: var(--brand);
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
.how-section {
  border-top: 1px solid var(--line);
}
.how-section h2 {
  margin-top: 12px;
}
.how-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 32px;
}
.how-grid article {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: white;
}
.how-grid article > span {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: var(--brand-soft);
  color: var(--brand);
  font-family: var(--mono);
  font-size: 0.8rem;
  font-weight: 800;
}
.how-grid article:last-child > span {
  background: #fff6db;
  color: #8a6400;
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
  color: var(--brand);
  font-size: 1.25rem;
}
.faq-list article > p {
  font-size: 0.8rem;
  padding-bottom: 20px;
}
.final-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 0.6fr;
  align-items: center;
  gap: 50px;
  background: linear-gradient(120deg, var(--brand-deep) 0%, var(--brand) 100%);
  color: white;
  border-radius: 26px;
  padding: 52px;
  margin-bottom: 64px;
}
.final-section::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(0deg, #ffffff0d 0 1px, transparent 1px 36px),
    repeating-linear-gradient(90deg, #ffffff0d 0 1px, transparent 1px 110px);
  -webkit-mask-image: linear-gradient(90deg, transparent 30%, #000);
  mask-image: linear-gradient(90deg, transparent 30%, #000);
}
.final-section .eyebrow {
  color: var(--gold);
}
.final-section h2 {
  margin: 14px 0;
}
.final-section p {
  color: #d3eadc;
  font-size: 0.88rem;
  max-width: 590px;
}
.final-section .final-count {
  font-size: 0.76rem;
  margin-top: 14px;
  color: #a6ecc2;
}
.final-actions {
  display: grid;
  gap: 12px;
}
.final-price {
  font-size: 2.3rem;
  letter-spacing: -0.04em;
  text-align: center;
}
.final-price span {
  font-size: 0.8rem;
  letter-spacing: 0;
}
.final-section .whatsapp-inline-icon {
  color: white;
}

/* ---------- Dialogs ---------- */
.route-dialog,
.course-dialog,
.free-dialog {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: white;
  color: var(--ink);
  width: min(820px, calc(100% - 32px));
  max-height: 85dvh;
  margin: auto;
  box-shadow: 0 24px 80px #0b241655;
}
.course-dialog[open] {
  display: flex;
  flex-direction: column;
}
.route-dialog::backdrop,
.course-dialog::backdrop,
.free-dialog::backdrop {
  background: #0a2416cc;
  backdrop-filter: blur(5px);
}
.route-dialog {
  width: min(1100px, calc(100% - 32px));
  max-height: 90dvh;
  overflow: hidden;
  background: #f7faf8;
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
  background: white;
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
  background: #f5f8f6;
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
  background: #f5f8f6;
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
  color: #3f5146;
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
  color: var(--brand);
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
  background: linear-gradient(110deg, #e6eee9 30%, #f4f8f5 50%, #e6eee9 70%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 14px;
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
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* La fórmula se escribe sola solo si la persona no pidió reducir el movimiento. */
@media (prefers-reduced-motion: no-preference) {
  .formula-text > span {
    width: 0;
    animation:
      formula-typing 2.6s steps(54, end) 0.5s forwards,
      formula-caret 0.9s step-end infinite;
  }
  @keyframes formula-typing {
    to {
      /* El ancho incluye el cursor de 2 px (box-sizing: border-box). */
      width: calc(54ch + 4px);
    }
  }
  @keyframes formula-caret {
    50% {
      border-color: transparent;
    }
  }
}

@media (max-width: 1100px) {
  .pack-strip {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .pack-logos {
    display: none;
  }
  .pack-purchase {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .route-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .bonus-cta {
    grid-column: span 2;
  }
  .excel-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 850px) {
  .section,
  .hero-inner,
  .pack-strip {
    width: calc(100% - 40px);
  }
  .xl-hero-art {
    inset: 0 0 0 20%;
    opacity: 0.55;
  }
  .hero-inner {
    min-height: 0;
    padding-block: 56px 116px;
  }
  .pack-strip {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .pack-purchase {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .route-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bonus-cta {
    grid-column: span 1;
    padding: 22px;
  }
  .skills-section,
  .bonus-intro {
    grid-template-columns: 1fr;
    gap: 40px;
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
  .how-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .final-section {
    grid-template-columns: 1fr;
    gap: 25px;
    padding: 34px;
  }
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

<style scoped src="../../styles/campaignMobile.css"></style>

<style scoped>
/* Ajustes de teléfono propios de esta página; van después del CSS compartido. */
@media (max-width: 600px) {
  .study-page .xl-hero {
    background: #0f3b25;
  }
  .study-page .xl-hero-art {
    position: relative;
    inset: auto;
    display: block;
    height: 230px;
    opacity: 1;
    -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
    mask-image: linear-gradient(180deg, #000 60%, transparent);
  }
  .study-page .xl-hero-art img {
    object-position: 60% center;
  }
  .study-page .xl-hero::after {
    display: none;
  }
  .study-page .hero-inner {
    margin-top: -40px;
    padding-block: 0 96px;
  }
  .study-page .hero-copy h1 {
    margin: 18px 0 20px;
    font-size: clamp(2.2rem, 11vw, 2.75rem);
  }
  .study-page .hero-badge {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
  }
  .study-page .formula-bar {
    font-size: 0.68rem;
  }
  .study-page .formula-cell {
    min-width: 40px;
    padding: 9px 8px;
  }
  .study-page .formula-fx {
    padding: 0 8px;
  }
  .study-page .formula-text {
    padding: 9px 10px;
  }
  .study-page .hero-description {
    margin-top: 20px;
  }
  .study-page .hero-facts {
    font-size: 0.72rem;
  }
  .study-page .pack-strip {
    margin-top: -64px;
    padding: 20px;
    border-radius: 18px;
  }
  .study-page .excel-section {
    padding-top: 48px;
  }
  .study-page .excel-heading {
    align-items: center;
    margin-bottom: 26px;
  }
  .study-page .sheet-ribbon span:nth-child(n + 4) {
    display: none;
  }
  .study-page .sheet-grid {
    font-size: 0.74rem;
  }
  .study-page .sheet-grid td,
  .study-page .sheet-grid th {
    padding: 11px 10px;
  }
  .study-page .sheet-row-number {
    width: 30px;
  }
  .study-page .sheet-formula-col {
    display: none;
  }
  .study-page .route-card-excel {
    grid-template-columns: 92px minmax(0, 1fr);
    grid-template-rows: none;
  }
  .study-page .route-card-excel .route-card-image {
    height: auto;
    min-height: 0;
  }
  .study-page .route-card-excel .route-card-image img {
    padding: 18px 14px 44px;
  }
  .study-page .excel-goal {
    padding: 12px;
    gap: 12px;
  }
  /* Objetivo del modal: ícono a la izquierda; cursos y botón debajo del texto. */
  .study-page .purpose-option {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    align-items: start;
    gap: 4px 12px;
    padding: 14px;
  }
  .study-page .purpose-option .purpose-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }
  .study-page .purpose-copy strong {
    font-size: 0.86rem;
  }
  .study-page .purpose-copy span {
    font-size: 0.72rem;
    line-height: 1.5;
  }
  .study-page .purpose-action {
    grid-column: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
  }
  .study-page .skills-section {
    gap: 44px;
  }
  .study-page .skills-chip {
    left: 12px;
    max-width: calc(100% - 24px);
    font-size: 0.66rem;
  }
  .study-page .skill-cells li {
    padding: 12px;
    font-size: 0.76rem;
  }
  .study-page .bonus-section {
    padding-block: 48px;
  }
  .study-page .bonus-intro {
    gap: 26px;
    margin-bottom: 26px;
  }
  /* En el teléfono las rutas de regalo son una lista compacta, no tarjetas altas. */
  .study-page .bonus-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .study-page .route-card-bonus {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    grid-template-rows: none;
  }
  .study-page .route-card-bonus .route-card-image {
    height: auto;
    min-height: 100px;
  }
  .study-page .route-card-bonus .route-card-image img {
    position: absolute;
    inset: 0;
    padding: 12px 12px 34px;
  }
  .study-page .route-card-bonus .route-card-tag {
    left: 6px;
    right: auto;
    bottom: 6px;
    max-width: calc(100% - 12px);
    padding: 3px 5px;
    font-size: 0.55rem;
    text-align: center;
  }
  .study-page .route-card-bonus .route-card-copy {
    gap: 2px;
    padding: 12px 14px;
  }
  .study-page .route-card-bonus .route-card-copy p {
    margin: 2px 0 8px;
    font-size: 0.72rem;
    line-height: 1.5;
  }
  .study-page .route-card-bonus .route-card-bottom {
    padding-top: 6px;
    border-top: 0;
  }
  .study-page .route-card-bonus .route-card-bottom > span {
    display: none;
  }
  .study-page .bonus-cta-actions,
  .study-page .bonus-cta-actions .button {
    width: 100%;
  }
  .study-page .how-grid article {
    padding: 20px;
  }
  .study-page .final-section {
    padding: 30px 22px;
  }
}
</style>
