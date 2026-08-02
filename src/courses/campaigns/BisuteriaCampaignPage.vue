<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CategoryService from "../../services/CategorieService";
import MessageService from "../../services/MessageService";
import type { ICategory, ICategoryCourseDetail } from "../../types/Categorie";
import type { IMessage } from "../../types/Message";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import { authStore } from "../../store/AuthStore";
import { useTracking } from "../../composables/useTracking";
import { useCampaignReturn } from "../../composables/useCampaignReturn";
import EmergentBuyComponent from "../emergent.buy.component.vue";
import FooterComponent from "../../components/footer/footer.component.vue";

defineOptions({ name: "BisuteriaCampaignPage" });

const CATEGORY_ID = 306;
const CAMPAIGN_ID = "bisuteria_joyeria_306";
const SUBCATEGORY = "Bisutería Y Manualidades, Joyería";
const WHATSAPP_PHONE = "573134141912";
const TOPIC_PAGE_SIZE = 10;

type BonusTopic = { subcategoria: string; count: number };
type TopicCoursesPage = {
  items: ICategoryCourseDetail[];
  total: number;
};

const JEWELRY_IDS = new Set([
  7718, 7722, 7813, 7834, 7862, 7902, 7903, 7904, 7905, 7906,
]);
const CRAFT_IDS = new Set([
  7828, 7837, 7842, 7843, 7846, 7847, 7851, 7861, 7865, 7871, 7884,
  7886, 7895,
]);

const router = useRouter();
const route = useRoute();
const buyStore = emergentBuyStore();
const userAuth = authStore();
const { activateCampaign } = useCampaignReturn();
const {
  trackViewItem,
  trackAddToCart,
  trackCustom,
  trackWhatsAppIntent,
  trackViewContentCourse,
} = useTracking();

const category = ref<ICategory | null>(null);
const courses = ref<ICategoryCourseDetail[]>([]);
const reviews = ref<IMessage[]>([]);
const coursesTotal = ref(0);
const loading = ref(true);
const categoryError = ref(false);
const catalogError = ref(false);
const reviewsLoading = ref(true);
const bonusTopics = ref<BonusTopic[]>([]);
const bonusTopicsLoading = ref(true);
const bonusTopicsError = ref(false);
const showAllBonusTopics = ref(false);
const openFaq = ref<number | null>(0);
const showCourseModal = ref(false);
const explorerView = ref<"courses" | "description">("description");
const selectedBonusTopic = ref<BonusTopic | null>(null);
const topicCourses = ref<ICategoryCourseDetail[]>([]);
const topicCoursesTotal = ref(0);
const topicCoursesPage = ref(1);
const topicSearchInput = ref("");
const topicSearch = ref("");
const topicCoursesLoading = ref(false);
const topicCoursesError = ref(false);
const topicCoursesCache = new Map<string, TopicCoursesPage>();
const selectedCourse = ref<ICategoryCourseDetail | null>(null);
const courseContentCache = ref<Record<number, string>>({});
const courseContentLoading = ref<Record<number, boolean>>({});
const courseModalCloseRef = ref<HTMLButtonElement | null>(null);
const topicSearchRef = ref<HTMLInputElement | null>(null);
const topicBackRef = ref<HTMLButtonElement | null>(null);
const courseTriggerRef = ref<HTMLElement | null>(null);
const viewedCourseIds = new Set<number>();
const showFreeCourseGate = ref(false);
const freeCourseEmail = ref("");
const freeCourseEmailError = ref("");
const pendingFreeCourseUrl = ref("");
const freeCourseEmailRef = ref<HTMLInputElement | null>(null);
const FREE_COURSE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let viewTracked = false;
let topicRequestSequence = 0;

const previousHead = {
  title: "",
  description: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

const techniques = [
  { title: "Alambrismo", text: "Crea aretes, anillos y estructuras con alambre." },
  { title: "Resina", text: "Diseña piezas con color, flores y acabados únicos." },
  { title: "Arcilla polimérica", text: "Modela accesorios ligeros desde cero." },
  { title: "Cordón y fibras", text: "Combina nudos, texturas y materiales naturales." },
  { title: "Accesorios de moda", text: "Convierte tus ideas en colecciones personales." },
  { title: "Presentación y venta", text: "Inspírate para exhibir, regalar o vender tus piezas." },
];

const benefits = [
  {
    title: "Crea a tu manera",
    text: "Aprende técnicas variadas para diseñar piezas que reflejen tu propio estilo.",
  },
  {
    title: "Empieza desde cero",
    text: "Encuentra opciones para principiantes y avanza a tu ritmo, sin horarios.",
  },
  {
    title: "Convierte ideas en ingresos",
    text: "Desarrolla productos hechos a mano que puedes regalar, usar o comenzar a vender.",
  },
];

const casualUseCases = [
  {
    title: "Quieres crear sin afán",
    text: "Te gusta aprender a tu ritmo, repetir una técnica y disfrutar el proceso sin horarios.",
  },
  {
    title: "Tienes ideas para accesorios",
    text: "Quieres hacer piezas para usar, regalar o preparar una primera colección con tu estilo.",
  },
  {
    title: "Quieres probar antes de especializarte",
    text: "Prefieres explorar alambre, resina, arcilla y fibras antes de elegir tu técnica favorita.",
  },
];

const faqs = [
  {
    question: "¿Qué recibo con mi compra?",
    answer:
      "Recibes acceso a la categoría 306 completa. Esta campaña destaca los cursos de bisutería, joyería y manualidades, y además incluye todos los demás cursos disponibles en Taller Maestro.",
  },
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "No. Hay contenidos pensados para comenzar desde las bases y explorar distintas técnicas antes de elegir tus favoritas.",
  },
  {
    question: "¿Cómo accedo a los cursos?",
    answer:
      "Después de confirmar el pago recibirás el acceso al material digital mediante Google Drive, asociado a la cuenta indicada durante la compra.",
  },
  {
    question: "¿El precio es un pago único?",
    answer:
      "Sí. El valor mostrado corresponde a un pago único por el paquete completo; no se presenta como una suscripción mensual.",
  },
  {
    question: "¿Puedo estudiar a mi propio ritmo?",
    answer:
      "Sí. Puedes organizar tu aprendizaje según tu disponibilidad y volver al material cuando necesites repasar una técnica.",
  },
  {
    question: "¿Puedo pedir ayuda antes de comprar?",
    answer:
      "Sí. Usa el botón de WhatsApp para consultar sobre el contenido, el proceso de pago o la entrega del acceso.",
  },
];

function normalizeCategory(item: ICategory): ICategory {
  const finalPrice = item.precio ?? item.precio_desc ?? 0;
  return {
    ...item,
    precio: finalPrice,
    // El API actual expone `precio` como valor final; varios flujos heredados
    // todavía leen `precio_desc`. Igualarlos evita compras/analítica sin monto.
    precio_desc: finalPrice,
  };
}

function uniqueCourses(items: ICategoryCourseDetail[]) {
  const seen = new Set<string>();
  return items.filter((course) => {
    const key = course.id != null
      ? `id:${course.id}`
      : `name:${course.name_del_curso ?? ""}:${course.author ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const groupedCourses = computed(() => {
  const jewelry: ICategoryCourseDetail[] = [];
  const crafts: ICategoryCourseDetail[] = [];
  const decoration: ICategoryCourseDetail[] = [];

  for (const course of courses.value) {
    if (course.id != null && JEWELRY_IDS.has(course.id)) jewelry.push(course);
    else if (course.id != null && CRAFT_IDS.has(course.id)) crafts.push(course);
    else decoration.push(course);
  }

  return [
    {
      title: "Bisutería y joyería",
      description: "Piezas, accesorios y técnicas para crear tu propia colección.",
      items: jewelry,
    },
    {
      title: "Técnicas y objetos artesanales",
      description: "Resina, cerámica, fibras y proyectos que amplían tus posibilidades.",
      items: crafts,
    },
    {
      title: "Decoración, regalos y eventos",
      description: "Ideas creativas complementarias para ocasiones y productos especiales.",
      items: decoration,
    },
  ];
});

const campaignTotal = computed(() => coursesTotal.value || courses.value.length);
const packTotal = computed(() => category.value?.cantidad_cursos || 0);
const finalPrice = computed(() => category.value?.precio ?? category.value?.precio_desc ?? 0);
const alreadyBought = computed(() => Boolean(category.value?.user_bought));

const formattedPrice = computed(() =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(finalPrice.value),
);

const focusedReviews = computed(() =>
  reviews.value.filter((review) =>
    /joyer|bisuter|alambr|accesor|resina/i.test(review.message),
  ),
);
const featuredReview = computed(() => focusedReviews.value[0] ?? null);
const remainingReviews = computed(() =>
  focusedReviews.value.filter((review) => review.id !== featuredReview.value?.id).slice(0, 5),
);
const averageRating = computed(() => {
  if (!focusedReviews.value.length) return 0;
  return focusedReviews.value.reduce((sum, review) => sum + review.stars, 0) / focusedReviews.value.length;
});
const visibleBonusTopics = computed(() =>
  showAllBonusTopics.value ? bonusTopics.value : bonusTopics.value.slice(0, 6),
);
const topicCoursesPages = computed(() =>
  Math.max(1, Math.ceil(topicCoursesTotal.value / TOPIC_PAGE_SIZE)),
);

const whatsappUrl = computed(() => {
  const product = category.value?.titulo ?? "Taller Maestro - Bisutería y Joyería";
  const priceText = finalPrice.value ? ` por $${formattedPrice.value} COP` : "";
  const message = encodeURIComponent(
    `Hola, llegué desde la campaña de Bisutería y Joyería. Quiero obtener acceso a ${product}${priceText}. ¿Me ayudan con la compra?`,
  );
  return `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
});

async function loadLanding() {
  loading.value = true;
  categoryError.value = false;
  catalogError.value = false;
  reviewsLoading.value = true;
  bonusTopicsLoading.value = true;
  bonusTopicsError.value = false;

  const [categoryResult, coursesResult, reviewsResult, bonusTopicsResult] = await Promise.allSettled([
    CategoryService.getCategoryById(CATEGORY_ID),
    CategoryService.getCourses(CATEGORY_ID, {
      subcategoria: SUBCATEGORY,
      limit: 100,
      offset: 0,
    }),
    MessageService.getAllMessageByCategory(CATEGORY_ID),
    CategoryService.getFacets<{ subcategoria: string; count: number }>(CATEGORY_ID, {
      by: "subcategoria",
      limit: 200,
      offset: 0,
    }),
  ]);

  if (categoryResult.status === "fulfilled" && categoryResult.value) {
    category.value = normalizeCategory(categoryResult.value);
    if (!viewTracked) {
      viewTracked = true;
      trackViewItem(category.value);
      trackCustom("CampaignView", {
        content_id: CATEGORY_ID,
        content_name: SUBCATEGORY,
        content_category: "campaign",
        value: finalPrice.value || undefined,
        currency: finalPrice.value ? "COP" : undefined,
        custom_data: { campaign_id: CAMPAIGN_ID },
      });
    }
  } else {
    categoryError.value = true;
  }

  if (coursesResult.status === "fulfilled") {
    courses.value = uniqueCourses(coursesResult.value.items);
    coursesTotal.value = coursesResult.value.total;
    // CategoryService degrada fallos de red a una respuesta vacía. En esta
    // campaña sabemos que la temática tiene contenido, por eso habilitamos retry.
    catalogError.value = courses.value.length === 0;
  } else {
    catalogError.value = true;
  }

  if (reviewsResult.status === "fulfilled") {
    reviews.value = reviewsResult.value.messages ?? [];
  }
  if (bonusTopicsResult.status === "fulfilled") {
    bonusTopics.value = bonusTopicsResult.value.items
      .filter((item) => item.subcategoria !== SUBCATEGORY)
      .sort((a, b) => b.count - a.count);
    bonusTopicsError.value = bonusTopics.value.length === 0;
  } else {
    bonusTopicsError.value = true;
  }
  reviewsLoading.value = false;
  bonusTopicsLoading.value = false;
  loading.value = false;
}

async function ensureCourseContent(course: ICategoryCourseDetail) {
  const id = course.id;
  if (id == null || courseContentCache.value[id] !== undefined || courseContentLoading.value[id]) return;
  courseContentLoading.value = { ...courseContentLoading.value, [id]: true };
  try {
    courseContentCache.value = {
      ...courseContentCache.value,
      [id]: await CategoryService.getCourseContenido(id),
    };
  } finally {
    courseContentLoading.value = { ...courseContentLoading.value, [id]: false };
  }
}

function trackCourseDescription(course: ICategoryCourseDetail) {
  const topicName = selectedBonusTopic.value?.subcategoria ?? SUBCATEGORY;
  if (selectedBonusTopic.value) {
    trackCustom("BonusCourseOpen", {
      content_id: course.id,
      content_name: course.name_del_curso,
      content_category: topicName,
      custom_data: { campaign_id: CAMPAIGN_ID, category_id: CATEGORY_ID },
    });
  }

  if (course.id == null || viewedCourseIds.has(course.id)) return;
  viewedCourseIds.add(course.id);
  trackViewContentCourse(course, category.value ?? undefined);
  trackCustom("CourseDescriptionOpen", {
    content_id: course.id,
    content_name: course.name_del_curso,
    content_category: topicName,
    custom_data: { campaign_id: CAMPAIGN_ID, category_id: CATEGORY_ID },
  });
}

async function openCourseDescription(course: ICategoryCourseDetail, event?: Event) {
  selectedCourse.value = course;
  selectedBonusTopic.value = null;
  explorerView.value = "description";
  courseTriggerRef.value = event?.currentTarget as HTMLElement | null;
  showCourseModal.value = true;
  ensureCourseContent(course);
  trackCourseDescription(course);
  await nextTick();
  courseModalCloseRef.value?.focus();
}

function closeCourseDescription(restoreFocus = true) {
  topicRequestSequence += 1;
  showCourseModal.value = false;
  selectedCourse.value = null;
  selectedBonusTopic.value = null;
  explorerView.value = "description";
  if (restoreFocus) nextTick(() => courseTriggerRef.value?.focus());
}

function topicCacheKey(topic: string, page: number, search: string) {
  return `${topic}::${page}::${search.trim().toLocaleLowerCase("es")}`;
}

async function loadTopicCourses(page = topicCoursesPage.value) {
  const topic = selectedBonusTopic.value;
  if (!topic) return;

  const safePage = Math.max(1, page);
  const search = topicSearch.value.trim();
  const cacheKey = topicCacheKey(topic.subcategoria, safePage, search);
  const cached = topicCoursesCache.get(cacheKey);
  topicCoursesPage.value = safePage;
  topicCoursesError.value = false;

  if (cached) {
    topicCoursesLoading.value = false;
    topicCourses.value = cached.items;
    topicCoursesTotal.value = cached.total;
    return;
  }

  const requestSequence = ++topicRequestSequence;
  topicCoursesLoading.value = true;
  try {
    const result = await CategoryService.getCourses(CATEGORY_ID, {
      subcategoria: topic.subcategoria,
      q: search || undefined,
      limit: TOPIC_PAGE_SIZE,
      offset: (safePage - 1) * TOPIC_PAGE_SIZE,
    });
    if (requestSequence !== topicRequestSequence) return;
    const pageResult = { items: uniqueCourses(result.items), total: result.total };
    topicCoursesCache.set(cacheKey, pageResult);
    topicCourses.value = pageResult.items;
    topicCoursesTotal.value = pageResult.total;
    topicCoursesError.value = !search && topic.count > 0 && pageResult.items.length === 0;
  } catch {
    if (requestSequence === topicRequestSequence) topicCoursesError.value = true;
  } finally {
    if (requestSequence === topicRequestSequence) topicCoursesLoading.value = false;
  }
}

async function openBonusTopic(topic: BonusTopic, event: Event) {
  courseTriggerRef.value = event.currentTarget as HTMLElement;
  selectedBonusTopic.value = topic;
  selectedCourse.value = null;
  explorerView.value = "courses";
  topicCourses.value = [];
  topicCoursesTotal.value = topic.count;
  topicCoursesPage.value = 1;
  topicSearchInput.value = "";
  topicSearch.value = "";
  showCourseModal.value = true;
  trackCustom("BonusTopicOpen", {
    content_id: CATEGORY_ID,
    content_name: topic.subcategoria,
    custom_data: { campaign_id: CAMPAIGN_ID, courses_total: topic.count },
  });
  void loadTopicCourses(1);
  await nextTick();
  courseModalCloseRef.value?.focus();
}

async function openBonusCourse(course: ICategoryCourseDetail) {
  selectedCourse.value = course;
  explorerView.value = "description";
  ensureCourseContent(course);
  trackCourseDescription(course);
  await nextTick();
  topicBackRef.value?.focus();
}

async function backToTopicCourses() {
  selectedCourse.value = null;
  explorerView.value = "courses";
  await nextTick();
  topicSearchRef.value?.focus();
}

function submitTopicSearch() {
  topicSearch.value = topicSearchInput.value.trim();
  loadTopicCourses(1);
}

function changeTopicPage(page: number) {
  if (page < 1 || page > topicCoursesPages.value || page === topicCoursesPage.value) return;
  loadTopicCourses(page);
}

function canAccessCourse(course: ICategoryCourseDetail) {
  return alreadyBought.value || Boolean(course.es_gratis);
}

function openDriveUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function handleDriveClick() {
  const course = selectedCourse.value;
  const url = course?.info_tecnica?.url;
  if (!course || !url) return;
  const allowed = canAccessCourse(course);

  trackCustom("DriveAccessClick", {
    content_id: course.id,
    content_name: course.name_del_curso,
    is_free: Boolean(course.es_gratis),
    custom_data: { campaign_id: CAMPAIGN_ID, allowed },
  });

  if (!allowed) {
    trackCustom("DriveAccessDenied", {
      content_id: course.id,
      content_name: course.name_del_curso,
      custom_data: { campaign_id: CAMPAIGN_ID, reason: "purchase_required" },
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
    showFreeCourseGate.value = true;
    nextTick(() => freeCourseEmailRef.value?.focus());
    return;
  }
  openDriveUrl(url);
}

function confirmFreeCourseAccess() {
  const email = freeCourseEmail.value.trim();
  if (!FREE_COURSE_EMAIL_RE.test(email)) {
    freeCourseEmailError.value = "Ingresa un correo válido.";
    return;
  }
  const url = pendingFreeCourseUrl.value;
  showFreeCourseGate.value = false;
  pendingFreeCourseUrl.value = "";
  if (url) openDriveUrl(url);
}

function closeFreeCourseGate() {
  showFreeCourseGate.value = false;
  pendingFreeCourseUrl.value = "";
  nextTick(() => courseTriggerRef.value?.focus());
}

function toggleBonusTopics() {
  showAllBonusTopics.value = !showAllBonusTopics.value;
  trackCustom("BonusTopicsExpand", {
    content_id: CATEGORY_ID,
    custom_data: {
      campaign_id: CAMPAIGN_ID,
      expanded: showAllBonusTopics.value,
      topics_total: bonusTopics.value.length,
    },
  });
}

function handleWebBuy(source: string) {
  if (!category.value) return;
  trackCustom("CampaignCtaClick", {
    content_id: CATEGORY_ID,
    value: finalPrice.value || undefined,
    currency: finalPrice.value ? "COP" : undefined,
    custom_data: { campaign_id: CAMPAIGN_ID, channel: "web", source },
  });

  if (alreadyBought.value) {
    router.push({ name: "mycourses" });
    return;
  }

  buyStore.setCategoryEmergent(category.value);
  trackAddToCart(category.value);
  if (!buyStore.emergentBuy.emergent) buyStore.handleEmergentBuy();
}

function handleWhatsApp(source: string) {
  if (!category.value) return;
  trackWhatsAppIntent(category.value, `campaign-${source}`);
  trackCustom("CampaignCtaClick", {
    content_id: CATEGORY_ID,
    value: finalPrice.value || undefined,
    currency: finalPrice.value ? "COP" : undefined,
    custom_data: { campaign_id: CAMPAIGN_ID, channel: "whatsapp", source },
  });
}

function scrollToCatalog() {
  document.getElementById("catalogo-bisuteria")?.scrollIntoView({ behavior: "smooth" });
}

function setMeta(selector: string, attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.dataset.campaignMeta = "true";
    document.head.appendChild(element);
  }
  element.content = value;
}

function setupMetadata() {
  previousHead.title = document.title;
  previousHead.description = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "";
  previousHead.ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? "";
  previousHead.ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ?? "";
  previousHead.ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? "";

  const title = "Bisutería y joyería desde cero | Taller Maestro";
  const description = "Aprende bisutería, alambrismo, resina y accesorios con una selección de cursos creativos y recibe acceso al pack Taller Maestro completo.";
  document.title = title;
  setMeta('meta[name="description"]', "name", "description", description);
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  setMeta('meta[property="og:description"]', "property", "og:description", description);
  setMeta('meta[property="og:image"]', "property", "og:image", `${window.location.origin}/images/campaigns/bisuteria/social.webp`);
}

function restoreMetadata() {
  document.title = previousHead.title;
  const restore = (selector: string, value: string) => {
    const element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) return;
    if (element.dataset.campaignMeta === "true" && !value) element.remove();
    else element.content = value;
  };
  restore('meta[name="description"]', previousHead.description);
  restore('meta[property="og:title"]', previousHead.ogTitle);
  restore('meta[property="og:description"]', previousHead.ogDescription);
  restore('meta[property="og:image"]', previousHead.ogImage);
}

onMounted(() => {
  setupMetadata();
  activateCampaign({
    id: CAMPAIGN_ID,
    title: "tu ruta de Bisutería y Joyería",
    path: route.fullPath,
    categoryId: CATEGORY_ID,
  });
  loadLanding();
});

onBeforeUnmount(restoreMetadata);
</script>

<template>
  <main class="campaign-page min-h-screen bg-[#fffaf4] text-[#35251f] pb-20 md:pb-0">
    <section class="relative overflow-hidden border-b border-[#ead8c8]">
      <img
        src="/images/campaigns/bisuteria/hero.webp"
        alt="Manos creando aretes artesanales con cuentas y alambre"
        class="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        width="1717"
        height="916"
        fetchpriority="high"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-[#fffaf4] via-[#fffaf4]/95 to-[#fffaf4]/10"></div>
      <div class="relative mx-auto grid min-h-[700px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div class="max-w-2xl rounded-[2rem] bg-[#fffaf4]/82 p-5 shadow-[0_25px_80px_rgba(71,39,28,0.08)] backdrop-blur-sm sm:p-9 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <span class="inline-flex items-center gap-2 rounded-full border border-[#c88d68]/30 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#8b4638]">
            <span aria-hidden="true">✦</span> Ruta creativa<span v-if="campaignTotal"> · {{ campaignTotal }} cursos</span>
          </span>
          <h1 class="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#422b25] sm:text-5xl lg:text-6xl">
            Aprende bisutería y joyería desde cero
            <span class="text-[#9b4d3d]">y crea piezas con tu estilo</span>
          </h1>
          <p class="mt-6 max-w-xl text-lg leading-relaxed text-[#6e574e] sm:text-xl">
            Explora alambrismo, resina, arcilla polimérica, fibras y accesorios para disfrutar creando o dar tus primeros pasos vendiendo piezas hechas por ti.
          </p>

          <div class="mt-7 flex flex-wrap items-end gap-x-5 gap-y-2" aria-live="polite">
            <div v-if="loading" class="h-12 w-44 animate-pulse rounded-xl bg-[#ead8c8]"></div>
            <template v-else-if="category">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#8a746b]">Pago único · Pack completo</p>
                <p class="mt-1 text-4xl font-black text-[#422b25]">${{ formattedPrice }} <span class="text-base font-bold">COP</span></p>
              </div>
              <span class="mb-1 rounded-full bg-[#e8f3e8] px-3 py-1.5 text-sm font-bold text-[#397247]">{{ packTotal ? `Acceso a ${packTotal} cursos` : 'Acceso al pack completo' }}</span>
            </template>
          </div>

          <div class="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <button
              type="button"
              :disabled="!category"
              data-track="campaign-hero-web"
              class="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#8f3f35] px-6 py-3 text-base font-black text-white shadow-lg shadow-[#8f3f35]/20 transition hover:-translate-y-0.5 hover:bg-[#78352d] disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleWebBuy('hero')"
            >
              <span aria-hidden="true">{{ alreadyBought ? "✓" : "✦" }}</span>
              {{ alreadyBought ? "Ver mis cursos" : "Comprar desde la web" }}
            </button>
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              data-track="campaign-hero-whatsapp"
              class="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#3d8152] bg-white/90 px-6 py-3 text-center text-base font-black text-[#326c45] shadow-lg shadow-[#386f49]/10 transition hover:-translate-y-0.5 hover:bg-[#f0faf3]"
              @click="handleWhatsApp('hero')"
            >
              <span aria-hidden="true">●</span> Comprar por WhatsApp
            </a>
          </div>
          <button type="button" class="mt-5 text-sm font-bold text-[#8f3f35] underline decoration-[#c88d68] underline-offset-4" @click="scrollToCatalog">
            Ver todo lo que vas a aprender ↓
          </button>
        </div>
      </div>
    </section>

    <section class="border-b border-[#ead8c8] bg-white" aria-label="Beneficios de acceso">
      <div class="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#ead8c8] sm:grid-cols-4">
        <div v-for="item in ['Pago único', 'Acceso por Google Drive', 'Estudia a tu ritmo', 'Soporte por WhatsApp']" :key="item" class="flex min-h-24 items-center justify-center bg-white px-4 text-center text-sm font-extrabold text-[#5d463e] sm:text-base">
          <span class="mr-2 text-[#b16b4d]" aria-hidden="true">✓</span>{{ item }}
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
      <div class="mx-auto max-w-3xl text-center">
        <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Una ruta para crear y crecer</p>
        <h2 class="mt-3 text-3xl font-black tracking-tight text-[#422b25] sm:text-5xl">Empieza por curiosidad. Continúa por todo lo que puedes crear.</h2>
        <p class="mt-5 text-lg leading-relaxed text-[#725d54]">No tienes que elegir entre un pasatiempo y una oportunidad: aprende una técnica, crea tus primeras piezas y decide hasta dónde quieres llevarla.</p>
      </div>
      <div class="mt-12 grid gap-5 md:grid-cols-3">
        <article v-for="(benefit, index) in benefits" :key="benefit.title" class="rounded-[1.75rem] border border-[#ead8c8] bg-white p-7 shadow-[0_18px_55px_rgba(88,51,37,0.07)]">
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3dfcf] font-black text-[#8f3f35]">0{{ index + 1 }}</span>
          <h3 class="mt-5 text-xl font-black text-[#422b25]">{{ benefit.title }}</h3>
          <p class="mt-3 leading-relaxed text-[#725d54]">{{ benefit.text }}</p>
        </article>
      </div>
    </section>

    <section class="bg-[#4b2e29] py-20 text-white">
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <img src="/images/campaigns/bisuteria/tecnicas.webp" alt="Materiales y herramientas para diferentes técnicas de joyería" class="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl" width="1200" height="900" loading="lazy" />
        <div>
          <p class="text-sm font-black uppercase tracking-[0.18em] text-[#e8b792]">Técnicas para explorar</p>
          <h2 class="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Encuentra la técnica que mejor habla de ti</h2>
          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <article v-for="technique in techniques" :key="technique.title" class="rounded-2xl border border-white/15 bg-white/8 p-5">
              <h3 class="font-black text-[#f7d5bc]">{{ technique.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-white/75">{{ technique.text }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="catalogo-bisuteria" class="scroll-mt-28 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div class="max-w-3xl">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Catálogo de la campaña</p>
          <h2 class="mt-3 text-3xl font-black tracking-tight text-[#422b25] sm:text-5xl">{{ campaignTotal }} cursos organizados para descubrirlos mejor</h2>
          <p class="mt-4 text-lg text-[#725d54]">Selecciona cualquier curso para conocer su descripción y forma de acceso.</p>
        </div>
        <span v-if="courses.length" class="w-fit rounded-full bg-[#f3dfcf] px-4 py-2 text-sm font-black text-[#8f3f35]">{{ courses.length }} cursos cargados</span>
      </div>

      <div v-if="loading" class="mt-10 grid gap-6 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-96 animate-pulse rounded-[1.75rem] bg-[#ead8c8]"></div>
      </div>
      <div v-else-if="catalogError" class="mt-10 rounded-3xl border border-[#e5b8a8] bg-white p-8 text-center">
        <p class="font-bold text-[#6f3f35]">No pudimos cargar el catálogo en este momento.</p>
        <button type="button" class="mt-4 rounded-xl bg-[#8f3f35] px-5 py-3 font-bold text-white" @click="loadLanding">Intentar de nuevo</button>
      </div>
      <div v-else class="mt-10 grid items-start gap-6 lg:grid-cols-3">
        <article v-for="(group, groupIndex) in groupedCourses" :key="group.title" class="overflow-hidden rounded-[1.75rem] border border-[#ead8c8] bg-white shadow-[0_18px_55px_rgba(88,51,37,0.07)]">
          <div class="border-b border-[#ead8c8] p-6" :class="groupIndex === 0 ? 'bg-[#f5dfd6]' : groupIndex === 1 ? 'bg-[#f2e8d8]' : 'bg-[#eee6de]'">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-xl font-black text-[#422b25]">{{ group.title }}</h3>
              <span class="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#8f3f35]">{{ group.items.length }}</span>
            </div>
            <p class="mt-2 text-sm leading-relaxed text-[#725d54]">{{ group.description }}</p>
          </div>
          <ol class="divide-y divide-[#f0e5dc]">
            <li v-for="(course, index) in group.items" :key="course.id ?? `${group.title}-${index}`">
              <button
                type="button"
                class="group/course flex w-full gap-3 p-4 text-left transition hover:bg-[#fff8f1] focus-visible:bg-[#fff8f1]"
                :aria-label="`Ver descripción de ${course.name_del_curso || 'curso creativo'}`"
                data-track="campaign-course-description"
                @click="openCourseDescription(course, $event)"
              >
                <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff5ed] text-xs font-black text-[#9b4d3d] transition group-hover/course:bg-[#8f3f35] group-hover/course:text-white">{{ index + 1 }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold leading-snug text-[#4b3730]">{{ course.name_del_curso || 'Curso creativo' }}</span>
                  <span v-if="course.author && course.author !== 'DESCONOCIDO'" class="mt-1 block text-xs uppercase tracking-wide text-[#9b877d]">{{ course.author }}</span>
                </span>
                <span class="mt-1 text-sm font-black text-[#9b4d3d] opacity-60 transition group-hover/course:translate-x-0.5 group-hover/course:opacity-100" aria-hidden="true">→</span>
              </button>
            </li>
          </ol>
        </article>
      </div>
    </section>

    <section class="bg-[#f0dfd0] py-20">
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div class="order-2 lg:order-1">
          <span class="inline-flex rounded-full bg-[#8f3f35] px-4 py-2 text-sm font-black text-white">Bono incluido con tu compra</span>
          <h2 class="mt-5 text-3xl font-black tracking-tight text-[#422b25] sm:text-5xl">No recibes solo esta temática: desbloqueas Taller Maestro completo</h2>
          <p class="mt-5 text-lg leading-relaxed text-[#675047]">Además de la ruta de bisutería y joyería, tu compra da acceso a <strong>{{ packTotal ? `${packTotal} cursos` : 'todos los cursos' }}</strong> de manualidades, costura, crochet, decoración y otros oficios creativos disponibles en la categoría 306.</p>
          <p class="mt-4 rounded-2xl border border-[#c99d7e] bg-white/65 p-5 font-bold text-[#6f3f35]">El precio sigue siendo el del paquete completo: ${{ formattedPrice }} COP como pago único.</p>
        </div>
        <img src="/images/campaigns/bisuteria/emprendimiento.webp" alt="Colección de joyería artesanal terminada y preparada para entregar" class="order-1 aspect-[3/2] w-full rounded-[2rem] object-cover shadow-2xl lg:order-2" width="1200" height="800" loading="lazy" />
      </div>
      <div class="mx-auto mt-14 max-w-7xl px-5 sm:px-8 lg:px-10">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p class="text-sm font-black uppercase tracking-[0.16em] text-[#9b4d3d]">También se incluye</p>
            <h3 class="mt-2 text-2xl font-black text-[#422b25] sm:text-3xl">Otras rutas creativas dentro del mismo pack</h3>
          </div>
          <span v-if="bonusTopics.length" class="text-sm font-bold text-[#725d54]">{{ bonusTopics.length }} temáticas adicionales</span>
        </div>
        <div v-if="bonusTopicsLoading" class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 6" :key="i" class="h-24 animate-pulse rounded-2xl bg-white/55"></div>
        </div>
        <div v-else-if="bonusTopicsError" class="mt-7 rounded-2xl border border-[#c99d7e] bg-white/60 p-5 text-center text-sm font-bold text-[#6f3f35]">
          No pudimos cargar las demás temáticas en este momento.
        </div>
        <div v-else class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="topic in visibleBonusTopics"
            :key="topic.subcategoria"
            type="button"
            class="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-[#d9bda7] bg-white/70 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#9b4d3d] hover:bg-white hover:shadow-md"
            :aria-label="`Ver los ${topic.count} cursos de ${topic.subcategoria}`"
            data-track="campaign-bonus-topic"
            @click="openBonusTopic(topic, $event)"
          >
            <span class="font-black leading-snug text-[#513a32]">
              {{ topic.subcategoria }}
              <span class="mt-2 block text-xs font-bold text-[#9b4d3d]">Ver cursos <span aria-hidden="true">→</span></span>
            </span>
            <span class="shrink-0 rounded-full bg-[#8f3f35] px-3 py-1.5 text-xs font-black text-white">{{ topic.count }} cursos</span>
          </button>
        </div>
        <button
          v-if="bonusTopics.length > 6"
          type="button"
          class="mx-auto mt-7 flex items-center gap-2 rounded-xl border-2 border-[#8f3f35] bg-transparent px-6 py-3 text-sm font-black text-[#8f3f35] transition hover:bg-white/60"
          :aria-expanded="showAllBonusTopics"
          data-track="campaign-bonus-topics"
          @click="toggleBonusTopics"
        >
          {{ showAllBonusTopics ? 'Ver solo las principales' : `Ver las ${bonusTopics.length} temáticas` }}
          <span aria-hidden="true">{{ showAllBonusTopics ? '↑' : '↓' }}</span>
        </button>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
      <div class="mx-auto max-w-3xl text-center">
        <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Así recibes tu acceso</p>
        <h2 class="mt-3 text-3xl font-black text-[#422b25] sm:text-5xl">Tres pasos para empezar</h2>
      </div>
      <div class="relative mt-12 grid gap-5 md:grid-cols-3">
        <article v-for="(step, index) in [
          ['Elige cómo comprar', 'Paga desde la web o solicita acompañamiento por WhatsApp.'],
          ['Confirma tus datos', 'Usamos la información de compra para gestionar correctamente tu acceso.'],
          ['Empieza a crear', 'Recibe el material digital y avanza según tu tiempo y tus intereses.'],
        ]" :key="step[0]" class="rounded-[1.75rem] border border-[#ead8c8] bg-white p-7 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8f3f35] text-lg font-black text-white">{{ index + 1 }}</span>
          <h3 class="mt-5 text-xl font-black text-[#422b25]">{{ step[0] }}</h3>
          <p class="mt-3 leading-relaxed text-[#725d54]">{{ step[1] }}</p>
        </article>
      </div>
    </section>

    <section class="bg-white py-20">
      <div class="mx-auto max-w-6xl px-5 sm:px-8">
        <div class="text-center">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Una ruta flexible y cercana</p>
          <h2 class="mt-3 text-3xl font-black text-[#422b25] sm:text-5xl">Esta ruta puede ser para ti si…</h2>
        </div>
        <div class="mt-10 grid gap-4 md:grid-cols-3">
          <article v-for="item in casualUseCases" :key="item.title" class="rounded-2xl border border-[#ead8c8] bg-[#fffaf4] p-6">
            <span class="text-xl text-[#9b4d3d]" aria-hidden="true">✦</span>
            <h3 class="mt-3 text-lg font-black text-[#422b25]">{{ item.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-[#725d54]">{{ item.text }}</p>
          </article>
        </div>

        <div v-if="reviewsLoading" class="mt-14 h-56 animate-pulse rounded-3xl bg-[#ead8c8]"></div>
        <div v-else-if="featuredReview" class="mt-16">
          <div class="mb-8 text-center">
            <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Reseñas relacionadas con esta temática</p>
            <h3 class="mt-2 text-2xl font-black text-[#422b25] sm:text-3xl">Experiencias registradas sobre joyería y accesorios</h3>
          </div>
          <article class="mx-auto max-w-3xl rounded-[2rem] bg-[#4b2e29] p-8 text-white shadow-xl sm:p-10">
            <div class="text-lg tracking-wider text-[#f1bd67]" :aria-label="`${featuredReview.stars} de 5 estrellas`">{{ '★'.repeat(featuredReview.stars) }}<span class="text-white/20">{{ '★'.repeat(5 - featuredReview.stars) }}</span></div>
            <blockquote class="mt-5 text-xl font-bold leading-relaxed sm:text-2xl">“{{ featuredReview.message }}”</blockquote>
            <p class="mt-5 text-sm font-bold text-white/70">{{ featuredReview.user.name }} · Reseña registrada</p>
          </article>
          <div v-if="remainingReviews.length" class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="review in remainingReviews" :key="review.id" class="rounded-2xl border border-[#ead8c8] bg-[#fffaf4] p-5">
              <div class="text-sm text-[#d19943]" :aria-label="`${review.stars} de 5 estrellas`">{{ '★'.repeat(review.stars) }}</div>
              <p class="mt-3 text-sm leading-relaxed text-[#5d463e]">“{{ review.message }}”</p>
              <p class="mt-4 text-xs font-black uppercase tracking-wide text-[#9b877d]">{{ review.user.name }}</p>
            </article>
          </div>
          <p class="mt-6 text-center text-sm font-bold text-[#725d54]">Promedio {{ averageRating.toFixed(1) }} de 5 · {{ focusedReviews.length }} reseña{{ focusedReviews.length === 1 ? '' : 's' }} relacionada{{ focusedReviews.length === 1 ? '' : 's' }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
      <div>
        <p class="text-sm font-black uppercase tracking-[0.18em] text-[#9b4d3d]">Antes de comprar</p>
        <h2 class="mt-3 text-3xl font-black text-[#422b25] sm:text-5xl">Preguntas frecuentes</h2>
        <p class="mt-5 text-lg leading-relaxed text-[#725d54]">Si necesitas resolver algo más, también puedes escribirnos directamente por WhatsApp.</p>
      </div>
      <div class="space-y-3">
        <article v-for="(faq, index) in faqs" :key="faq.question" class="overflow-hidden rounded-2xl border border-[#ead8c8] bg-white">
          <button type="button" class="flex w-full items-center justify-between gap-4 p-5 text-left font-black text-[#422b25]" :aria-expanded="openFaq === index" :aria-controls="`faq-answer-${index}`" @click="openFaq = openFaq === index ? null : index">
            {{ faq.question }}
            <span class="text-xl text-[#9b4d3d]" aria-hidden="true">{{ openFaq === index ? '−' : '+' }}</span>
          </button>
          <div v-show="openFaq === index" :id="`faq-answer-${index}`" class="border-t border-[#f0e5dc] px-5 py-4 leading-relaxed text-[#725d54]">{{ faq.answer }}</div>
        </article>
      </div>
    </section>

    <section class="bg-[#4b2e29] py-20 text-white">
      <div class="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <span class="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#f5c9aa]">Oferta permanente · Sin contadores artificiales</span>
        <h2 class="mt-6 text-3xl font-black tracking-tight sm:text-5xl">Tu próxima pieza puede comenzar hoy</h2>
        <p class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75">Accede a la ruta de bisutería y joyería y recibe también Taller Maestro completo por el precio vigente de la categoría 306.</p>
        <p v-if="category" class="mt-7 text-4xl font-black">${{ formattedPrice }} <span class="text-base text-white/70">COP · pago único</span></p>
        <div class="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
          <button type="button" :disabled="!category" data-track="campaign-final-web" class="min-h-14 rounded-2xl bg-[#e6ad72] px-6 py-3 font-black text-[#402a24] transition hover:-translate-y-0.5 hover:bg-[#f0bf8c] disabled:opacity-50" @click="handleWebBuy('final')">{{ alreadyBought ? 'Ver mis cursos' : 'Comprar desde la web' }}</button>
          <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" data-track="campaign-final-whatsapp" class="flex min-h-14 items-center justify-center rounded-2xl border-2 border-white/60 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10" @click="handleWhatsApp('final')">Comprar por WhatsApp</a>
        </div>
      </div>
    </section>

    <!-- Explorador reutilizable: listado de temática y descripción de curso -->
    <div
      v-if="showCourseModal && (selectedCourse || selectedBonusTopic)"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-course-modal-title"
      @click.self="closeCourseDescription()"
      @keydown.esc="closeCourseDescription()"
    >
      <div class="flex h-[min(88vh,800px)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
        <header class="flex items-start justify-between gap-4 border-b border-[#ead8c8] bg-[#fffaf4] p-5 sm:p-6">
          <div class="min-w-0">
            <button
              v-if="explorerView === 'description' && selectedBonusTopic"
              ref="topicBackRef"
              type="button"
              class="mb-3 inline-flex items-center gap-2 text-sm font-black text-[#8f3f35] hover:underline"
              @click="backToTopicCourses"
            >
              <span aria-hidden="true">←</span> Volver a los cursos
            </button>
            <p class="text-xs font-black uppercase tracking-[0.14em] text-[#9b4d3d]">
              {{ explorerView === 'courses' ? 'Temática incluida' : 'Descripción del curso' }}
            </p>
            <h2 id="campaign-course-modal-title" class="mt-2 text-lg font-black leading-snug text-[#422b25] sm:text-xl">
              {{ explorerView === 'courses' ? selectedBonusTopic?.subcategoria : (selectedCourse?.name_del_curso || 'Curso creativo') }}
            </h2>
            <p v-if="explorerView === 'courses'" class="mt-1 text-sm font-bold text-[#8d776e]">
              {{ topicCoursesTotal }} curso{{ topicCoursesTotal === 1 ? '' : 's' }} encontrado{{ topicCoursesTotal === 1 ? '' : 's' }}
            </p>
            <p v-else-if="selectedCourse?.author && selectedCourse.author !== 'DESCONOCIDO'" class="mt-1 text-xs font-bold uppercase tracking-wide text-[#8d776e]">
              {{ selectedCourse.author }}
            </p>
          </div>
          <button
            ref="courseModalCloseRef"
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-[#725d54] shadow-sm transition hover:bg-[#f2dfd1] hover:text-[#422b25]"
            aria-label="Cerrar explorador"
            @click="closeCourseDescription()"
          >
            ×
          </button>
        </header>

        <div v-if="explorerView === 'courses' && selectedBonusTopic" class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <form class="flex gap-2" role="search" @submit.prevent="submitTopicSearch">
            <label for="campaign-topic-search" class="sr-only">Buscar un curso en esta temática</label>
            <input
              id="campaign-topic-search"
              ref="topicSearchRef"
              v-model="topicSearchInput"
              type="search"
              placeholder="Buscar por nombre del curso"
              class="h-12 min-w-0 flex-1 rounded-xl border border-[#d9bda7] bg-[#fffaf4] px-4 text-sm text-[#422b25] outline-none transition placeholder:text-[#9b877d] focus:border-[#9b4d3d] focus:ring-2 focus:ring-[#d89563]/30"
            />
            <button type="submit" class="h-12 rounded-xl bg-[#8f3f35] px-5 text-sm font-black text-white transition hover:bg-[#78352d]">
              Buscar
            </button>
          </form>

          <div v-if="topicCoursesLoading" class="mt-6 space-y-3" aria-live="polite">
            <div v-for="i in 5" :key="i" class="h-16 animate-pulse rounded-xl bg-[#ead8c8]"></div>
            <p class="text-center text-sm font-bold text-[#8d776e]">Cargando cursos…</p>
          </div>
          <div v-else-if="topicCoursesError" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p class="text-sm font-bold text-red-700">No pudimos cargar los cursos de esta temática.</p>
            <button type="button" class="mt-3 text-sm font-black text-[#8f3f35] underline" @click="loadTopicCourses()">Volver a intentar</button>
          </div>
          <div v-else-if="!topicCourses.length" class="mt-6 rounded-2xl bg-[#fff7f0] p-6 text-center text-sm text-[#725d54]">
            No encontramos cursos con esa búsqueda.
          </div>
          <ol v-else class="mt-6 space-y-2">
            <li v-for="(course, index) in topicCourses" :key="course.id ?? `${course.name_del_curso}-${index}`">
              <button
                type="button"
                class="group flex w-full items-center gap-4 rounded-xl border border-[#ead8c8] bg-white p-4 text-left transition hover:border-[#c88d68] hover:bg-[#fffaf4]"
                @click="openBonusCourse(course)"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2dfd1] text-xs font-black text-[#8f3f35]">
                  {{ (topicCoursesPage - 1) * TOPIC_PAGE_SIZE + index + 1 }}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block font-black leading-snug text-[#4b3730]">{{ course.name_del_curso || 'Curso creativo' }}</span>
                  <span v-if="course.author && course.author !== 'DESCONOCIDO'" class="mt-1 block text-xs font-bold uppercase tracking-wide text-[#9b877d]">{{ course.author }}</span>
                </span>
                <span class="text-lg font-black text-[#9b4d3d] transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </button>
            </li>
          </ol>

          <nav v-if="!topicCoursesLoading && topicCoursesPages > 1" class="mt-6 flex items-center justify-between gap-3 border-t border-[#ead8c8] pt-5" aria-label="Paginación de cursos">
            <button type="button" :disabled="topicCoursesPage === 1" class="rounded-xl border border-[#d9bda7] px-4 py-2 text-sm font-black text-[#725d54] disabled:cursor-not-allowed disabled:opacity-40" @click="changeTopicPage(topicCoursesPage - 1)">Anterior</button>
            <span class="text-sm font-bold text-[#725d54]">Página {{ topicCoursesPage }} de {{ topicCoursesPages }}</span>
            <button type="button" :disabled="topicCoursesPage === topicCoursesPages" class="rounded-xl border border-[#d9bda7] px-4 py-2 text-sm font-black text-[#725d54] disabled:cursor-not-allowed disabled:opacity-40" @click="changeTopicPage(topicCoursesPage + 1)">Siguiente</button>
          </nav>
        </div>

        <div v-else-if="selectedCourse" class="min-h-40 flex-1 overflow-y-auto p-5 sm:p-6">
          <div v-if="selectedCourse.id != null && courseContentLoading[selectedCourse.id]" class="space-y-3" aria-live="polite">
            <div class="h-4 w-full animate-pulse rounded bg-[#ead8c8]"></div>
            <div class="h-4 w-5/6 animate-pulse rounded bg-[#ead8c8]"></div>
            <div class="h-4 w-2/3 animate-pulse rounded bg-[#ead8c8]"></div>
            <p class="pt-2 text-sm font-bold text-[#8d776e]">Cargando descripción…</p>
          </div>
          <div
            v-else-if="selectedCourse.id != null && courseContentCache[selectedCourse.id]"
            class="campaign-course-content text-sm leading-relaxed text-[#5f4a42] sm:text-base"
            v-html="courseContentCache[selectedCourse.id]"
          ></div>
          <div v-else class="rounded-2xl bg-[#fff7f0] p-5 text-center text-sm text-[#725d54]">
            Este curso todavía no tiene una descripción ampliada, pero hace parte del contenido incluido en la ruta.
          </div>
        </div>

        <footer v-if="explorerView === 'description' && selectedCourse" class="border-t border-[#ead8c8] bg-[#fffaf4] p-5 sm:p-6">
          <button
            v-if="selectedCourse.info_tecnica?.url"
            type="button"
            class="flex min-h-13 w-full items-center justify-center gap-3 rounded-xl px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5"
            :class="canAccessCourse(selectedCourse) ? 'bg-[#257a49] hover:bg-[#1f683e]' : 'bg-[#8f3f35] hover:bg-[#78352d]'"
            data-track="campaign-course-drive"
            @click="handleDriveClick"
          >
            <svg class="h-6 w-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#4da3ff" />
              <path d="M16.29 3.5H7.71l6.57 11.5h8.57L16.29 3.5z" fill="#5ed07b" />
              <path d="M4.45 20.5h15.1l3.3-5.5H7.75L4.45 20.5z" fill="#ffd255" />
            </svg>
            {{ canAccessCourse(selectedCourse) ? 'Abrir curso en Google Drive' : 'Desbloquear este curso y el pack' }}
          </button>
          <p v-if="selectedCourse.info_tecnica?.url && !canAccessCourse(selectedCourse)" class="mt-3 text-center text-xs leading-relaxed text-[#806b62]">
            Este acceso se habilita al adquirir la categoría 306 completa.
          </p>
          <p v-else-if="!selectedCourse.info_tecnica?.url" class="text-center text-sm font-bold text-[#806b62]">
            Este curso no tiene un enlace de Drive disponible en este momento.
          </p>
        </footer>
      </div>
    </div>

    <!-- Correo requerido para cursos gratuitos sin usuario identificado -->
    <div
      v-if="showFreeCourseGate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-course-gate-title"
      @click.self="closeFreeCourseGate"
      @keydown.esc="closeFreeCourseGate"
    >
      <form class="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="confirmFreeCourseAccess">
        <p class="text-xs font-black uppercase tracking-[0.14em] text-[#9b4d3d]">Acceso gratuito</p>
        <h2 id="free-course-gate-title" class="mt-2 text-2xl font-black text-[#422b25]">¿A qué correo asociamos tu acceso?</h2>
        <p class="mt-3 text-sm leading-relaxed text-[#725d54]">Ingresa un correo válido para continuar al material gratuito en Google Drive.</p>
        <label for="campaign-free-email" class="mt-6 block text-sm font-black text-[#513a32]">Correo electrónico</label>
        <input
          id="campaign-free-email"
          ref="freeCourseEmailRef"
          v-model="freeCourseEmail"
          type="email"
          autocomplete="email"
          required
          placeholder="tu@correo.com"
          class="mt-2 h-12 w-full rounded-xl border border-[#d9bda7] bg-[#fffaf4] px-4 text-[#422b25] outline-none transition focus:border-[#9b4d3d] focus:ring-2 focus:ring-[#d89563]/30"
        />
        <p v-if="freeCourseEmailError" class="mt-2 text-sm font-bold text-red-600">{{ freeCourseEmailError }}</p>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button type="button" class="rounded-xl border border-[#d9bda7] px-4 py-3 font-bold text-[#725d54] hover:bg-[#fff8f1]" @click="closeFreeCourseGate">Cancelar</button>
          <button type="submit" class="rounded-xl bg-[#257a49] px-4 py-3 font-black text-white hover:bg-[#1f683e]">Continuar a Drive</button>
        </div>
      </form>
    </div>

    <div v-if="categoryError" class="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-4 text-center shadow-2xl md:bottom-6">
      <p class="text-sm font-bold text-red-700">No pudimos cargar el precio y la compra está temporalmente deshabilitada.</p>
      <button type="button" class="mt-2 text-sm font-black text-[#8f3f35] underline" @click="loadLanding">Volver a intentar</button>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-[#ead8c8] bg-[#fffaf4]/95 p-3 shadow-[0_-10px_35px_rgba(60,35,27,0.12)] backdrop-blur md:hidden">
      <div class="grid grid-cols-2 gap-2">
        <button type="button" :disabled="!category" data-track="campaign-sticky-web" class="min-h-12 rounded-xl bg-[#8f3f35] px-3 text-sm font-black text-white disabled:opacity-50" @click="handleWebBuy('sticky')">{{ alreadyBought ? 'Mis cursos' : `Comprar $${formattedPrice}` }}</button>
        <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" data-track="campaign-sticky-whatsapp" class="flex min-h-12 items-center justify-center rounded-xl border-2 border-[#3d8152] bg-white px-3 text-center text-sm font-black text-[#326c45]" @click="handleWhatsApp('sticky')">WhatsApp</a>
      </div>
    </div>

    <EmergentBuyComponent />
    <FooterComponent />
  </main>
</template>

<style scoped>
.campaign-page {
  font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.campaign-page :focus-visible {
  outline: 3px solid #d89563;
  outline-offset: 3px;
}

.campaign-course-content :deep(p) {
  margin-bottom: 0.85rem;
}

.campaign-course-content :deep(h2) {
  margin-bottom: 0.8rem;
  color: #422b25;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.campaign-course-content :deep(h3) {
  margin: 1.15rem 0 0.55rem;
  color: #513a32;
  font-size: 1.05rem;
  font-weight: 800;
}

.campaign-course-content :deep(ul),
.campaign-course-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.4rem;
}

.campaign-course-content :deep(ul) {
  list-style: disc;
}

.campaign-course-content :deep(ol) {
  list-style: decimal;
}

.campaign-course-content :deep(li) {
  margin-bottom: 0.45rem;
}

.campaign-course-content :deep(iconify-icon) {
  margin-right: 0.35rem;
  color: #9b4d3d;
  vertical-align: -0.1em;
}

.campaign-course-content :deep(a) {
  color: #8f3f35;
  font-weight: 700;
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .campaign-page *,
  .campaign-page *::before,
  .campaign-page *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
