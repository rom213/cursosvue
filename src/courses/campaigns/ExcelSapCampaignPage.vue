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
import CategoryService from "../../services/CategorieService";
import type { IPaginatedCourses } from "../../services/CategorieService";
import ApiService from "../../services/ApiService";
import type { ICategory, ICategoryCourseDetail } from "../../types/Categorie";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import { authStore } from "../../store/AuthStore";
import { useTracking } from "../../composables/useTracking";
import { useCampaignReturn } from "../../composables/useCampaignReturn";
import { pageViewCoordinator } from "../../analytics/pageViewCoordinator";
import EmergentBuyComponent from "../emergent.buy.component.vue";
import FooterComponent from "../../components/footer/footer.component.vue";
import WhatsAppIcon from "./WhatsAppIcon.vue";
import {
  STUDY_CATEGORY_ID,
  STUDY_CAMPAIGN_ID,
  STUDY_ROUTES,
  coursesForStudyRoute,
  groupStudyCourses,
  loadStudyCatalog,
  studyCourseKey,
} from "./studyRoutes";
import type { StudyLevel } from "./studyRoutes";

defineOptions({ name: "ExcelSapCampaignPage" });

const router = useRouter();
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
const courses = ref<ICategoryCourseDetail[]>([]);
const categoryLoading = ref(true);
const catalogLoading = ref(true);
const categoryError = ref(false);
const catalogError = ref(false);
const selectedRouteId = ref("excel");
const search = ref("");
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

const routesWithCourses = computed(() =>
  STUDY_ROUTES.map((definition) => ({
    ...definition,
    courses: coursesForStudyRoute(courses.value, definition),
  })),
);
const visibleRoutes = computed(() =>
  routesWithCourses.value.filter(
    (item) => item.featured || item.courses.length,
  ),
);
const selectedStudyRoute = computed(
  () =>
    routesWithCourses.value.find((item) => item.id === selectedRouteId.value) ??
    routesWithCourses.value[0]!,
);
const courseGroups = computed(() =>
  groupStudyCourses(selectedStudyRoute.value.courses, search.value),
);
const searchTotal = computed(() =>
  courseGroups.value.reduce((sum, group) => sum + group.courses.length, 0),
);
const catalogTotal = computed(() => courses.value.length);
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
  const product =
    category.value?.titulo ?? "Business Intelligence, Datos y Oficina";
  const price = category.value ? ` por $${formattedPrice.value} COP` : "";
  return `https://wa.me/573209971514?text=${encodeURIComponent(`${message} Quiero consultar cómo obtener acceso al bloque 103 completo: ${product}${price}. ¿Me ayudan?`)}`;
}
const whatsappUrl = computed(() =>
  whatsappLink(
    "Hola, me gustó todo el contenido de las rutas de estudio de datos y oficina.",
  ),
);
const routeWhatsappUrl = computed(() =>
  whatsappLink(
    `Hola, me gustó la ruta de ${selectedStudyRoute.value.title} y quiero estudiar sus cursos.`,
  ),
);

const faqs = [
  {
    question: "¿Qué incluye mi compra?",
    answer:
      "La compra da acceso al bloque 103 completo: Business Intelligence, Datos y Oficina. Las rutas organizan sus cursos para ayudarte a elegir qué estudiar; no se compran por separado.",
  },
  {
    question: "¿En qué orden estudio los cursos?",
    answer:
      "Comienza por el nivel inicial, continúa con el intermedio y explora el avanzado cuando tengas las bases. Los cursos completos pueden abarcar varios niveles. Puedes escoger entre distintos cursos según tus objetivos; no es necesario cursarlos todos.",
  },
  {
    question: "¿Cómo se determina el nivel?",
    answer:
      "Los niveles son orientativos y se basan en lo que indica el título del curso. Si el título no permite confirmar la dificultad, el curso aparece en “Sin nivel indicado”. Revisa su descripción antes de elegirlo.",
  },
  {
    question: "¿Cómo accedo al material?",
    answer:
      "El acceso al material digital se entrega mediante Google Drive a la cuenta indicada durante la compra. Los cursos gratuitos y los accesos de quienes ya compraron conservan el flujo de acceso de la plataforma.",
  },
  {
    question: "¿El pago es una suscripción?",
    answer:
      "El precio mostrado corresponde a un pago único por el bloque completo. Puedes estudiar a tu ritmo, según tu disponibilidad.",
  },
];

async function loadLanding() {
  const sequence = ++landingSequence;
  const isCurrent = () => componentActive && sequence === landingSequence;
  catalogLoading.value = true;
  categoryLoading.value = true;
  catalogError.value = false;
  categoryError.value = false;
  courses.value = [];
  category.value = null;
  await Promise.allSettled([
    (async () => {
      try {
        const result = await CategoryService.getCategoryById(STUDY_CATEGORY_ID);
        if (!isCurrent()) return;
        if (!result || result.id !== STUDY_CATEGORY_ID)
          throw new Error("Bloque no disponible");
        const price = result.precio ?? result.precio_desc ?? 0;
        category.value = { ...result, precio: price, precio_desc: price };
        if (!viewTracked) {
          viewTracked = true;
          trackViewItem(category.value);
          trackCustom("CampaignView", {
            content_id: STUDY_CATEGORY_ID,
            content_name: "Rutas de datos y oficina",
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
    })(),
    (async () => {
      try {
        // ApiService conserva los errores; getCourses devuelve una página vacía si falla.
        const result = await loadStudyCatalog(async (offset, limit) => {
          const response = await ApiService.get<IPaginatedCourses>(
            `api/category/${STUDY_CATEGORY_ID}/courses?limit=${limit}&offset=${offset}`,
          );
          return response.data;
        }, isCurrent);
        if (result && isCurrent()) courses.value = result;
      } catch {
        if (isCurrent()) catalogError.value = true;
      } finally {
        if (isCurrent()) catalogLoading.value = false;
      }
    })(),
  ]);
}

async function selectStudyRoute(id: string, event: Event) {
  routeTrigger = event.currentTarget as HTMLElement;
  routeDialogOpen.value = true;
  selectedRouteId.value = id;
  search.value = "";
  expandedLevels.value = [];
  trackCustom("StudyRouteOpen", {
    content_id: STUDY_CATEGORY_ID,
    content_name: selectedStudyRoute.value.title,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      study_route: id,
      courses_total: selectedStudyRoute.value.courses.length,
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
  selectedCourse.value = course;
  void loadCourseContent();
  trackCustom("CourseDescriptionOpen", {
    content_id: course.id,
    content_name: course.name_del_curso,
    content_category: selectedStudyRoute.value.title,
    custom_data: {
      campaign_id: STUDY_CAMPAIGN_ID,
      category_id: STUDY_CATEGORY_ID,
      study_route: selectedRouteId.value,
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
  if (alreadyBought.value) {
    router.push({ name: "mycourses" });
    return;
  }
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
  { element: HTMLMetaElement; content: string; created: boolean }
>();
function setupMetadata() {
  previousTitle = document.title;
  const title = "Rutas de Excel, Power BI y datos | Cursos Estudia y Trabaja";
  const description =
    "Elige tu ruta de Excel, Power BI, análisis de datos, Office o Business Intelligence. Explora los cursos por nivel y accede al bloque 103 completo.";
  document.title = title;
  for (const [attribute, key, value] of [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    [
      "property",
      "og:image",
      `${window.location.origin}/images/campaigns/datos-oficina/social.webp`,
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
    title: "tus rutas de Datos y Oficina",
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
      title: "tus rutas de Datos y Oficina",
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
    <section class="study-hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="eyebrow"
            ><span aria-hidden="true">✦</span> EXCEL · POWER BI · ANÁLISIS DE
            DATOS</span
          >
          <h1>
            Aprende Excel, Power BI y Office
            <span>y transforma datos en decisiones</span>
          </h1>
          <p class="hero-description">
            Elige una ruta de Excel, Power BI, análisis de datos, Office o
            Business Intelligence. Aprende a organizar información, crear
            dashboards y mejorar tus tareas de oficina, desde las bases hasta
            los temas avanzados.
          </p>
          <div class="hero-actions">
            <button
              class="button button-primary"
              type="button"
              @click="scrollToRoutes"
            >
              Elegir mi ruta de estudio <span aria-hidden="true">↓</span>
            </button>
            <a
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
              ><b aria-hidden="true">✓</b> Hojas de cálculo, reportes y
              oficina</span
            >
          </div>
        </div>
        <div class="hero-visual">
          <img
            src="/images/campaigns/datos-oficina/hero-rutas-estudio.webp"
            alt="Ilustración de estudio con un portátil, hojas de cálculo, gráficos y herramientas de Excel, Power BI, Word y PowerPoint"
            width="1536"
            height="1024"
            fetchpriority="high"
          />
          <div class="hero-image-label">
            <span class="image-label-icon" aria-hidden="true">↗</span>
            <div>
              <strong>De las hojas de cálculo a los dashboards</strong
              ><span
                >Excel · Power BI · Análisis de datos · Business
                Intelligence</span
              >
            </div>
          </div>
          <div class="hero-photo-pill">DATOS Y HERRAMIENTAS DE OFICINA</div>
        </div>
      </div>
    </section>

    <section class="pack-strip" aria-label="Acceso al bloque completo">
      <div>
        <span class="eyebrow">UN BLOQUE, MUCHAS POSIBILIDADES</span>
        <h2>Business Intelligence, Datos y Oficina</h2>
        <p>
          Todas las rutas forman parte del bloque 103. Elige qué aprender; la
          compra incluye el bloque completo.
        </p>
      </div>
      <div class="pack-purchase" aria-live="polite">
        <div
          v-if="categoryLoading"
          class="price-skeleton skeleton"
          aria-label="Cargando precio"
        ></div>
        <template v-else-if="category"
          ><div class="price">
            <small>Pago único · Bloque completo</small
            ><strong>${{ formattedPrice }} <span>COP</span></strong>
          </div>
          <button
            class="button button-primary"
            type="button"
            data-track="campaign-pack-web"
            @click="handleWebBuy('pack')"
          >
            {{ alreadyBought ? "Ver mis cursos" : "Obtener acceso" }}
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
          <h2>Encuentra tu ruta</h2>
          <p>
            Elige una habilidad para explorar sus pasos y cursos disponibles.
          </p>
        </div>
        <span
          v-if="!catalogLoading && !catalogError && catalogTotal"
          class="count-pill"
          >{{ catalogTotal }} cursos en el catálogo</span
        >
      </div>
      <div
        v-if="catalogLoading"
        class="route-grid"
        aria-live="polite"
        aria-busy="true"
      >
        <div v-for="n in 5" :key="n" class="route-skeleton skeleton"></div>
        <p class="loading-message">
          Estamos preparando las rutas con el catálogo completo…
        </p>
      </div>
      <div v-else-if="catalogError" class="error-panel" role="alert">
        <h3>No pudimos cargar el catálogo completo</h3>
        <p>Vuelve a intentar para explorar todas las rutas y sus cursos.</p>
        <button
          class="button button-primary"
          type="button"
          @click="loadLanding"
        >
          Volver a intentar
        </button>
      </div>
      <template v-else>
        <div class="route-grid">
          <button
            v-for="studyRoute in visibleRoutes"
            :key="studyRoute.id"
            type="button"
            class="route-card"
            :class="{ selected: selectedRouteId === studyRoute.id }"
            :style="{ '--route-accent': studyRoute.accent }"
            :aria-pressed="selectedRouteId === studyRoute.id"
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
              <span class="route-card-bottom"
                ><span
                  >{{ studyRoute.courses.length }}
                  {{
                    studyRoute.courses.length === 1
                      ? "curso disponible"
                      : "cursos disponibles"
                  }}</span
                ><strong>{{
                  selectedRouteId === studyRoute.id
                    ? "Seleccionada"
                    : "Ver ruta"
                }}</strong></span
              >
            </div>
          </button>
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
      </template>
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
        v-if="routeDialogOpen"
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
      v-if="routeDialogBody"
      :to="routeDialogBody"
      :disabled="!routeDialogOpen"
    >
      <section
        v-if="!catalogLoading && !catalogError"
        id="ruta-detalle"
        class="section route-detail"
        :style="{ '--route-accent': selectedStudyRoute.accent }"
        aria-labelledby="ruta-titulo"
      >
        <div class="detail-intro">
          <div>
            <span class="eyebrow">TU CAMINO DE APRENDIZAJE</span>
            <h2 id="ruta-titulo" ref="routeHeading" tabindex="-1">
              Ruta de {{ selectedStudyRoute.title }}
            </h2>
            <p>{{ selectedStudyRoute.goal }}</p>
            <span class="count-pill"
              >{{ selectedStudyRoute.courses.length }} cursos en esta ruta</span
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
        <div class="catalog-toolbar">
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
        <p v-if="search.trim()" class="search-results" role="status">
          {{ searchTotal }}
          {{ searchTotal === 1 ? "resultado" : "resultados" }} para “{{
            search.trim()
          }}”
        </p>
        <div v-if="!courseGroups.length" class="empty-panel">
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
        <div v-else class="level-groups">
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
        <p>Las rutas te orientan; el acceso incluye todo el bloque.</p>
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

    <section class="section final-section">
      <div>
        <span class="eyebrow">DA EL SIGUIENTE PASO</span>
        <h2>Abre nuevas posibilidades<br />con tus habilidades</h2>
        <p>
          Accede al bloque completo de Business Intelligence, Datos y Oficina y
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
          {{ alreadyBought ? "Ver mis cursos" : "Acceder al bloque completo" }}
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
            <span class="eyebrow">{{ selectedStudyRoute.title }}</span>
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
            forma parte del bloque 103.
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
                : "Desbloquear con el bloque completo →"
            }}
          </button>
          <p
            v-if="
              selectedCourse.info_tecnica?.url &&
              !canAccessCourse(selectedCourse)
            "
          >
            El acceso se habilita al adquirir el bloque 103 completo.
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
            ? "Mis cursos"
            : category
              ? `Acceder · $${formattedPrice}`
              : "Acceso al bloque"
        }}
      </button>
    </div>
    <a
      v-if="!routeDialogOpen"
      class="whatsapp-float whatsapp-float-page"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp sobre todo el contenido del bloque 103"
      @click="handleWhatsApp('page_floating_button')"
      ><WhatsAppIcon /><span>Me gusta el contenido</span></a
    >
    <EmergentBuyComponent />
    <FooterComponent />
  </main>
</template>

<style scoped>
.study-page {
  --ink: #152842;
  --muted: #5c6d81;
  --blue: #245be8;
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
  outline: 3px solid #3b82f6;
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
  color: #245be8;
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
  box-shadow: 0 6px 18px #245be81a;
}
.button-primary:hover {
  background: #1849c7;
}
.button-light {
  background: white;
  border-color: #dfe7f1;
  color: #233d60;
}
.button-light:hover {
  background: #eff6ff;
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
    radial-gradient(ellipse at 30% 0%, #e8f0ff 0, transparent 65%), #f4f7fc;
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
  flex: 0 0 300px;
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
  background: #eff6ff;
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
  background: #173982;
  color: white;
  border-radius: 23px;
  padding: 46px;
  margin-bottom: 60px;
}
.final-section .eyebrow {
  color: #bfdbfe;
}
.final-section h2 {
  margin: 14px 0;
}
.final-section p {
  color: #dbeafe;
  font-size: 0.87rem;
  max-width: 590px;
}
.final-section .final-count {
  font-size: 0.76rem;
  margin-top: 14px;
  color: #bfdbfe;
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
  color: #173982;
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
@media (max-width: 600px) {
  .route-dialog .route-detail {
    padding: 16px;
  }
  .route-dialog-header {
    padding: 12px 16px;
  }
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
@media (max-width: 600px) {
  .whatsapp-float {
    font-size: 0.75rem;
    padding: 12px 16px;
    min-height: 52px;
  }
  .whatsapp-float-page {
    right: 16px;
    bottom: calc(86px + env(safe-area-inset-bottom));
  }
  .whatsapp-float-route {
    right: 16px;
    bottom: 16px;
  }
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
@media (max-width: 600px) {
  .study-page {
    padding-bottom: 80px;
  }
  .section,
  .hero-inner,
  .pack-strip {
    width: calc(100% - 32px);
  }
  .section {
    padding-block: 34px;
  }
  .hero-inner {
    padding-block: 34px;
  }
  .hero-copy h1 {
    font-size: 2.25rem;
  }
  .hero-description {
    font-size: 0.9rem;
  }
  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
  .hero-facts {
    display: grid;
  }
  .hero-visual > img {
    height: 280px;
  }
  .hero-image-label {
    padding: 16px;
    left: 10px;
    right: 10px;
  }
  .hero-image-label strong {
    font-size: 0.75rem;
  }
  .hero-image-label div > span {
    font-size: 0.65rem;
  }
  .pack-strip {
    flex-direction: column;
    gap: 20px;
    padding-block: 24px;
  }
  .pack-purchase {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }
  .pack-purchase .button {
    font-size: 0.77rem;
    padding-inline: 16px;
  }
  .price strong {
    font-size: 1.45rem;
  }
  .section-heading {
    flex-direction: column;
    align-items: start;
    gap: 15px;
  }
  .route-grid {
    grid-template-columns: 1fr;
  }
  .route-card-image {
    height: 170px;
  }
  .route-card-copy p {
    min-height: 0;
  }
  .route-card-copy {
    padding: 20px;
  }
  .detail-intro {
    grid-template-columns: 1fr;
    padding: 24px;
    gap: 22px;
  }
  .catalog-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-field {
    flex-basis: auto;
  }
  .level-heading {
    padding: 20px;
  }
  .course-row {
    padding: 18px 16px;
    gap: 11px;
    flex-wrap: wrap;
  }
  .course-icon {
    width: 31px;
    height: 36px;
  }
  .course-row-copy {
    min-width: 180px;
  }
  .course-open-label {
    margin-left: 42px;
  }
  .course-row-copy strong {
    font-size: 0.8rem;
  }
  .how-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .how-grid article > span {
    margin-bottom: 8px;
  }
  .final-section {
    width: calc(100% - 32px);
    grid-template-columns: 1fr;
    padding: 30px 24px;
    margin-bottom: 32px;
  }
  .final-actions {
    margin-top: 8px;
  }
  .mobile-purchase {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    border-top: 1px solid var(--line);
    background: #fffffff5;
    padding: 10px 12px max(10px, env(safe-area-inset-bottom));
    backdrop-filter: blur(8px);
    box-shadow: 0 -8px 30px #1528420a;
  }
  .mobile-purchase .button {
    min-height: 46px;
    padding: 11px 8px;
    font-size: 0.75rem;
  }
  .dialog-header {
    padding: 22px 18px;
  }
  .dialog-header h2 {
    font-size: 1.08rem;
  }
  .dialog-body,
  .dialog-footer {
    padding: 20px 18px;
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
