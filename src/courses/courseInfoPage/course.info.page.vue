<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { courseIcons } from "../courseIcons";
import { courseInfoIcons } from "./courseInfo.icons";
import { authStore } from "../../store/AuthStore";
import { cartStore } from "../../store/CartStore";
import AffiliatyMessageComponent from "../../components/auth/affiliaty.message.component.vue";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import { toastStore } from "../../store/ToastStore";
import type { ICategory, ICategoryCourseDetail } from "../../types/Categorie";
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from "vue";
import { categoryStore } from "../../store/CategoryStore";
import EmergentBuyComponent from "../emergent.buy.component.vue";
import AuthService from "../../services/AuthServices";
import CategoryService from "../../services/CategorieService";
import CourseFaqSection from "./CourseFaqSection.vue";
import CommentsBodyComponent from "./componentCourseInfo/comments.body.component.vue";
import FooterComponent from "../../components/footer/footer.component.vue";
import {
  classifyCategoryId,
  getPilarForThemeId,
  getUpsellTargetId,
  getBloquesCountForCategory,
  PILARES,
  COMBOS,
  TODA_LA_TIENDA_ID,
} from "../courseFilterData";
import type { PilarKey } from "../courseFilterData";
import { usePromoQuery } from "../../composables/usePromoQuery";
import { useTracking } from "../../composables/useTracking";
import descripcionesRaw from "./descripcionCursos.json";

const cartSt = cartStore();
const storeemergentBuy = emergentBuyStore();
const toasts = toastStore();
const { trackViewItem, trackAddToCart } = useTracking();
enum Navegacion {
  Contenido = 1,
  Preguntas = 2,
  Comentarios = 3,
  Beneficios = 4,
}

const router = useRouter();
const userAuth = authStore();
const route = useRoute();
const storeCategory = categoryStore();
const category = ref<ICategory>();
const categoryLoading = ref(true);
const navegacion = ref(Navegacion.Contenido);
const openedFolders = ref<Record<string, boolean>>({});
const isLoadingDrive = ref(false);
const showPreviewWarning = ref(false);
const pendingUrl = ref<string>("");
let previewTimeoutId: ReturnType<typeof setTimeout> | null = null;

const itemsPerPage = 5;
const itemsPerPageLista = 10;

const currentPages = ref({
  plataformas: 1,
  bloques: 1,
  listaCompleta: 1,
});

const searchTermLista = ref("");
/** Curso de la promo (banner): ordenar al frente y resaltar; no filtra la lista */
const promoHighlightTerm = ref("");
/** Contenedor scroll de "Lista completa" (para anclar arriba al buscar) */
const listaCompletaScrollRef = ref<HTMLElement | null>(null);

watch(searchTermLista, (val) => {
  currentPages.value.listaCompleta = 1;
  if (val.trim()) {
    nextTick(() => {
      listaCompletaScrollRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

const paginatedPlataformas = computed(() => {
  const list = category.value?.seccion_plataformas?.plataformas || [];
  const start = (currentPages.value.plataformas - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx,
  }));
});
const totalPagesPlataformas = computed(() =>
  Math.ceil(
    (category.value?.seccion_plataformas?.plataformas?.length || 0) /
      itemsPerPage,
  ),
);

const paginatedBloques = computed(() => {
  const list = category.value?.seccion_temas?.temas || [];
  const start = (currentPages.value.bloques - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx,
  }));
});
const totalPagesBloques = computed(() =>
  Math.ceil((category.value?.seccion_temas?.temas?.length || 0) / itemsPerPage),
);

const filteredListaCompleta = computed(() => {
  const list = category.value?.seccion_lista_completa?.lista_completa || [];

  // Extraer el item de promo para anclarlo siempre al inicio
  const promoTerm = promoHighlightTerm.value.trim().toLowerCase();
  const promoIndex = promoTerm
    ? list.findIndex((item) =>
        item.name_del_curso?.toLowerCase().includes(promoTerm),
      )
    : -1;
  const promoItem = promoIndex !== -1 ? list[promoIndex] : null;

  const searchTerm = searchTermLista.value.trim().toLowerCase();

  if (searchTerm) {
    // Filtrar por búsqueda excluyendo el item promo para no duplicarlo
    const results = list.filter(
      (item, idx) =>
        idx !== promoIndex &&
        item.name_del_curso?.toLowerCase().includes(searchTerm),
    );
    return promoItem ? [promoItem, ...results] : results;
  }

  if (promoItem) {
    const rest = list.filter((_, idx) => idx !== promoIndex);
    return [promoItem, ...rest];
  }

  return list;
});

type ListaCompletaRow = ICategoryCourseDetail & { vistaListaIndex: number };

/** Lista completa en modo búsqueda: estilo de cabecera / contenedor */
const isListaBuscando = computed(() => searchTermLista.value.trim().length > 0);

/** El item promo siempre queda en pos 0 de filteredListaCompleta cuando está activo */
const firstPromoListaIndex = computed(() =>
  promoHighlightTerm.value.trim() ? 0 : -1,
);

const isPromoItem = (curso: ListaCompletaRow) => {
  if (!promoHighlightTerm.value.trim()) return false;
  const term = promoHighlightTerm.value.toLowerCase();
  if (!curso.name_del_curso?.toLowerCase().includes(term)) return false;
  const first = firstPromoListaIndex.value;
  return first !== -1 && curso.vistaListaIndex === first;
};

/** Solo el primer resultado de búsqueda (global) lleva el estilo sky fuerte en la fila */
const isListaBusquedaDestacado = (curso: ListaCompletaRow) =>
  isListaBuscando.value && curso.vistaListaIndex === 0;

const paginatedListaCompleta = computed(() => {
  const list = filteredListaCompleta.value;
  const start = (currentPages.value.listaCompleta - 1) * itemsPerPageLista;
  return list.slice(start, start + itemsPerPageLista).map((item, idx) => {
    const vistaListaIndex = start + idx;
    return {
      ...item,
      originalIndex: vistaListaIndex,
      vistaListaIndex,
    };
  });
});
const totalPagesListaCompleta = computed(() =>
  Math.ceil((filteredListaCompleta.value.length || 0) / itemsPerPageLista),
);

const toggleFolder = (key: string) => {
  openedFolders.value[key] = !openedFolders.value[key];
};

const isFolderOpen = (key: string) => Boolean(openedFolders.value[key]);


const addCarCategory = (item: ICategory) => {
  if (cartSt.validateCart(item)) {
    cartSt.setCart(item);
    trackAddToCart(item);
  }
};
const syncCategoryFromRoute = async () => {
  const rawId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const index = Number(rawId);

  if (Number.isNaN(index)) {
    category.value = undefined;
    return;
  }

  category.value = storeCategory.findCategoryById(index);

  const fullCategory = await CategoryService.getCategoryById(index);
  if (fullCategory) {
    category.value = fullCategory;
  }
  categoryLoading.value = false;
  if (category.value) trackViewItem(category.value);
};
onMounted(() => {
  let index = Number(route.params.id);
  category.value = storeCategory.findCategoryById(index);

  if (route.params.googleid) {
    AuthService.get_affiliaty(route.params.googleid).then((res) => {
      userAuth.nameAffiliaty = res?.name;
      localStorage.setItem("google_affiliaty", String(route.params.googleid));
    });
  } else {
    userAuth.nameAffiliaty = undefined;
  }
});

const { promoName, promoType, promoBannerClicked, consumeBannerClick } = usePromoQuery();

watch(
  [
    () => route.params.id,
    () => storeCategory.categories.length,
    () => route.query._t,
    () => route.query.q_course,
  ],
  async () => {
    promoHighlightTerm.value = "";
    openedFolders.value["section-lista-completa"] = true;
    if (route.query.q_course) {
      searchTermLista.value = route.query.q_course as string;
      setTimeout(() => {
        const el = document.getElementById("lista-completa-header");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 180;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 600);
    } else {
      searchTermLista.value = "";
    }
    await syncCategoryFromRoute();
    await loadUpsellCategory();
    await loadBloques();
    // Aplicar highlight de promo DESPUÉS de cargar los datos.
    // Esto cubre el caso: usuario hace click en el banner → navega a página nueva.
    // markBannerClicked() se llama antes de navegar, así que promoBannerClicked ya es true al montar.
    if (promoBannerClicked.value && promoType.value === "curso" && promoName.value) {
      consumeBannerClick();
      promoHighlightTerm.value = promoName.value;
      setTimeout(() => {
        const el = document.getElementById("lista-completa-header");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 180;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 600);
    }
  },
  { immediate: true },
);

// Watch separado para dos casos:
// 1. dismissIntro: el usuario cierra el diálogo estando ya en la página → route no cambia.
// 2. Click en el banner estando ya en la página del promo → router.push no navega (mismo route).
// Sin immediate: el caso de navegación nueva lo maneja el watch principal al final del await.
watch(
  () => promoBannerClicked.value,
  (clicked) => {
    if (!clicked || promoType.value !== "curso" || !promoName.value) return;
    consumeBannerClick();
    promoHighlightTerm.value = promoName.value;
    searchTermLista.value = "";
    openedFolders.value["section-lista-completa"] = true;
    setTimeout(() => {
      const el = document.getElementById("lista-completa-header");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 180;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 600);
  },
);

// ── Tier detection ──
const PILAR_EMOJI: Record<PilarKey, string> = {
  negocios: "💼",
  tecnologia: "💻",
  creativa: "🎨",
};

const tierInfo = computed(() => {
  const id = category.value?.id;
  if (!id)
    return {
      tier: "basic" as const,
      label: "",
      includesResale: false,
      includesDiscount: false,
      isPremium: false,
      accentColor: "bg-blue-500",
      pillBg: "bg-blue-100",
      pillText: "text-blue-700",
    };

  const filterType = classifyCategoryId(id);

  if (filterType === "toda-la-tienda") {
    return {
      tier: "premium" as const,
      label: "👑 Toda la Tienda 2026",
      includesResale: true,
      includesDiscount: true,
      isPremium: true,
      accentColor: "bg-amber-500",
      pillBg: "bg-amber-100",
      pillText: "text-amber-700",
    };
  }
  if (filterType === "combos") {
    const combo = COMBOS.find((c) => c.id === id);
    return {
      tier: "advanced" as const,
      label: `⚡ ${combo?.name ?? "Combinacion"}`,
      includesResale: true,
      includesDiscount: true,
      isPremium: false,
      accentColor: "bg-purple-500",
      pillBg: "bg-purple-100",
      pillText: "text-purple-700",
    };
  }
  if (filterType === "pilares") {
    const pilar = PILARES.find((p) => p.pilarId === id);
    const key = pilar?.key ?? "negocios";
    return {
      tier: "advanced" as const,
      label: `${PILAR_EMOJI[key]} ${pilar?.shortLabel ?? ""}`,
      includesResale: true,
      includesDiscount: true,
      isPremium: false,
      accentColor: pilar?.bgColor ?? "bg-blue-500",
      pillBg: `bg-${key === "negocios" ? "blue" : key === "tecnologia" ? "emerald" : "orange"}-100`,
      pillText: `text-${key === "negocios" ? "blue" : key === "tecnologia" ? "emerald" : "orange"}-700`,
    };
  }
  // bloques
  const pilarKey = getPilarForThemeId(id);
  const pilar = pilarKey ? PILARES.find((p) => p.key === pilarKey) : null;
  const colorName =
    pilarKey === "negocios"
      ? "blue"
      : pilarKey === "tecnologia"
        ? "emerald"
        : "orange";
  return {
    tier: "basic" as const,
    label: `${pilarKey ? PILAR_EMOJI[pilarKey] : "📌"} ${pilar?.shortLabel ?? "Bloque Individual"}`,
    includesResale: false,
    includesDiscount: false,
    isPremium: false,
    accentColor: `bg-${colorName}-500`,
    pillBg: `bg-${colorName}-100`,
    pillText: `text-${colorName}-700`,
  };
});

const cuposCount = computed(() => category.value?.num_per ?? 23);
const cuposMax = computed(() => category.value?.cupos_google ?? 200);
const cuposPercent = computed(() =>
  Math.min(100, Math.round(((cuposMax.value - cuposCount.value) / cuposMax.value) * 100)),
);
const isLowStock = computed(() => cuposCount.value < 30);

const currencySuffix = computed(() =>
  ""
  // userAuth.getProfile()?.user?.country === "CO" ? "COP" : "USD",
);

const formatPrice = (price: number | undefined) => {
  if (price == null) return "0";
  return price.toLocaleString();
};

const hasDiscount = computed(
  () =>
    category.value?.precio_desc != null &&
    category.value.precio_desc > 0 &&
    category.value.precio_desc !== category.value.precio,
);
const discountPercent = computed(() => {
  if (!hasDiscount.value || !category.value?.precio) return 0;
  return Math.round(
    ((category.value.precio_desc - (category.value.precio ?? 0)) /
      category.value.precio_desc) *
      100,
  );
});

// ── Upsell ──
const upsellCategory = ref<ICategory | null>(null);

const upsellTierLabel = computed(() => {
  if (!upsellCategory.value) return "";
  const type = classifyCategoryId(upsellCategory.value.id);
  if (type === "pilares") return "🏛️ Pilar Completo";
  if (type === "toda-la-tienda") return "👑 Toda la Tienda 2026";
  return "";
});

const upsellBenefits = computed(() => {
  if (!upsellCategory.value) return [];
  const type = classifyCategoryId(upsellCategory.value.id);
  if (type === "pilares") {
    return [
      "Todos los blques del pilar",
      "Incluye reventa",
      "70% Dto. en toda la tienda",
    ];
  }
  if (type === "toda-la-tienda") {
    return [
      "Los 3 pilares completos",
      "Incluye reventa",
      "Máximo valor por tu inversión",
    ];
  }
  return [];
});

const loadUpsellCategory = async () => {
  const id = category.value?.id;
  if (!id) {
    upsellCategory.value = null;
    return;
  }
  const targetId = getUpsellTargetId(id);
  if (!targetId) {
    upsellCategory.value = null;
    return;
  }
  // Primero intentar desde el store
  const fromStore = storeCategory.findCategoryById(targetId);
  if (fromStore) {
    upsellCategory.value = fromStore;
    return;
  }
  // Si no está en store, cargar desde API
  const fromApi = await CategoryService.getCategoryById(targetId);
  if (fromApi) {
    upsellCategory.value = fromApi as ICategory;
  } else {
    upsellCategory.value = null;
  }
};

const selectedOption = ref<"current" | "upsell">("current");
const showUpsellDetails = ref(false);
const showBlocksList = ref(false);

const upsellBreakdown = computed(() => {
  const blocks = upsellCategory.value?.cat_rel_info ?? [];
  const total = upsellCategory.value?.precio ?? 0;
  const pricePerBlock =
    blocks.length > 0 ? Math.round(total / blocks.length) : 0;
  return { blocks, pricePerBlock };
});

const computedBloquesCount = computed(() => {
  const id = category.value?.id;
  if (!id) return null;
  return getBloquesCountForCategory(id);
});

const bloquesData = ref<
  { pilar: { id: number; titulo: string }; bloques: ICategory[] }[]
>([]);
const bloquesLoading = ref(false);

const _BLOQUE_IDS = new Set([
  100,
  200,
  300,
  100200,
  100300,
  200300,
  TODA_LA_TIENDA_ID,
]);

const loadBloques = async () => {
  const id = category.value?.id;
  if (!id || !_BLOQUE_IDS.has(id)) {
    bloquesData.value = [];
    return;
  }
  bloquesLoading.value = true;
  bloquesData.value = await CategoryService.getCategoryBloques(id);
  bloquesLoading.value = false;
};

const getPilarColorClasses = (pilarId: number) => {
  if (pilarId === 100)
    return {
      border: "border-blue-200",
      bg: "bg-blue-50/40",
      header: "bg-blue-100/60",
      badge: "bg-blue-200 text-blue-700",
      dot: "bg-blue-500",
    };
  if (pilarId === 200)
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50/40",
      header: "bg-emerald-100/60",
      badge: "bg-emerald-200 text-emerald-700",
      dot: "bg-emerald-500",
    };
  return {
    border: "border-orange-200",
    bg: "bg-orange-50/40",
    header: "bg-orange-100/60",
    badge: "bg-orange-200 text-orange-700",
    dot: "bg-orange-500",
  };
};

const getPilarEmoji = (pilarId: number) =>
  pilarId === 100 ? "💼" : pilarId === 200 ? "💻" : "🎨";

// ── Descripción desplegable ──
const descripcionesMap: Record<string, string> = {};
for (const group of Object.values(descripcionesRaw)) {
  for (const [key, value] of Object.entries(group)) {
    descripcionesMap[key] = value;
  }
}

const showDescripcion = ref(false);
const showLoginModal = ref(false);

const descripcionCurso = computed(() => {
  const titulo = category.value?.titulo;
  if (!titulo) return null;
  const tituloLower = titulo.toLowerCase().trim();
  for (const [key, value] of Object.entries(descripcionesMap)) {
    if (
      key.toLowerCase().includes(tituloLower) ||
      tituloLower.includes(key.toLowerCase())
    ) {
      return value;
    }
  }
  return null;
});

const selectedCategory = computed(() =>
  selectedOption.value === "upsell" && upsellCategory.value
    ? upsellCategory.value
    : category.value,
);

const handleBuySelected = () => {
  const item = selectedCategory.value;
  if (!item) return;
  storeemergentBuy.handleEmergentBuy();
  storeemergentBuy.setCategoryEmergent(item);
  trackAddToCart(item);
};

const handleAddToCartSelected = () => {
  const item = selectedCategory.value;
  if (!item) return;
  addCarCategory(item);
};

const handlePreview = async (item: ICategory | undefined, url: string) => {
  if (!item || !url) return;

  // Si no está logueado, mostrar modal de login
  if (!userAuth.getProfile()?.user) {
    showLoginModal.value = true;
    return;
  }

  // Si no ha comprado pero tiene preview habilitado, mostrar advertencia
  if (
    item.user_bought === false &&
    userAuth.getProfile()?.user?.vista_previa_drive === 1
  ) {
    pendingUrl.value = url;
    showPreviewWarning.value = true;
    return;
  }
  if (userAuth.getProfile()?.user?.vista_previa_drive === 0 && !category.value?.user_bought) {
    showBannerWithAutoClose();
    return;
  }
  window.location.href = url;
};

const handleConfirmPreview = async () => {
  try {
    isLoadingDrive.value = true;
    const google_id = userAuth.getProfile()?.user?.google_id;
    if (!google_id) return;

    const categoryId = category.value?.id;
    if (!categoryId) return;

    await CategoryService.agregarMiembroTiempo(google_id, categoryId);

    // Esperar 3 segundos después de la respuesta
    await new Promise(resolve => setTimeout(resolve, 3000));
    userAuth.noMostrarCursoDrive()
    // Abrir el enlace
    window.location.href = pendingUrl.value;

    // Establecer timeout de 30 segundos para mostrar el banner (que durará 4 segundos)
    previewTimeoutId = setTimeout(() => {
      showBannerWithAutoClose();
    }, 30000);
  } catch (error) {
    console.error("Error al preparar el enlace:", error);
  } finally {
    isLoadingDrive.value = false;
    showPreviewWarning.value = false;
    pendingUrl.value = "";
  }
};

const handleCancelPreview = () => {
  showPreviewWarning.value = false;
  pendingUrl.value = "";
};

const handleImagePreviewClick = () => {
  const url = category.value?.url;
  if (!url) return;

  const user = userAuth.getProfile()?.user;
  if (!user) {
    showLoginModal.value = true;
    return;
  }

  handlePreview(category.value, url);
};

const showBannerWithAutoClose = () => {
  toasts.add('guarantee', 8000);
};

// Limpiar timeouts al desmontar el componente
onBeforeUnmount(() => {
  if (previewTimeoutId) {
    clearTimeout(previewTimeoutId);
  }
});

const handleUpsellExplore = () => {
  if (!upsellCategory.value) return;
  router.push({
    name: "courses-description",
    params: { id: upsellCategory.value.id },
  });
};

const contentHeading = computed(() => {
  const t = tierInfo.value.tier;
  if (t === "basic") return "Contenido del bloque";
  if (t === "advanced") return "Contenido del pilar";
  return "Contenido del paquete";
});
</script>

<template>
  <div class="bg-[#f8faff] min-h-screen text-[#0d1b2a]">
    <!-- Loading overlay para Google Drive -->
    <div
      v-if="isLoadingDrive"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm">
        <div class="mb-4">
          <div class="animate-spin inline-block">
            <svg
              class="w-12 h-12 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
        <p class="text-lg font-semibold text-gray-800 mb-2">
          Preparando tu acceso
        </p>
        <p class="text-sm text-gray-600">
          Estamos preparando todo para ti y generando el link para visualizar
        </p>
      </div>
    </div>

    <!-- Modal: login requerido para vista previa -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div class="mb-4 flex justify-center">
          <div class="bg-blue-100 rounded-full p-3">
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-3 text-center">
          Vista previa disponible
        </h3>
        <p class="text-gray-600 text-center mb-6 leading-relaxed">
          Para ver una vista previa del contenido debes
          <strong>iniciar sesión con tu cuenta de Google</strong>.
          ¡Es gratis y solo toma un segundo!
        </p>
        <button
          @click="showLoginModal = false"
          class="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>

    <!-- Modal de advertencia para vista previa -->
    <div
      v-if="showPreviewWarning"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md">
        <!-- Icono amigable (cronómetro) -->
        <div class="mb-4 flex justify-center">
          <div class="bg-blue-100 rounded-full p-3">
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2" />
            </svg>
          </div>
        </div>

        <!-- Título -->
        <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">
          ¡Vistazo rápido activado!
        </h3>

        <!-- Mensaje principal -->
        <p class="text-gray-700 text-center mb-6 leading-relaxed">
          Tienes un <strong>acceso temporal de 2 minutos</strong> para explorar
          la calidad del contenido de este curso. ¡Aprovéchalo!
        </p>

        <!-- Nota de garantía -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            ✓ <strong>Garantía total:</strong> Recuerda que al comprar tienes 7
            días de garantía de reembolso. Explora con tranquilidad.
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-4">
          <button
            @click="handleCancelPreview"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleConfirmPreview"
            :disabled="isLoadingDrive"
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoadingDrive ? "Preparando..." : "Ver curso" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de garantía: renderizado en el stack global (App.vue) vía toastStore -->


    <!-- ═══ ESQUELETO DE CARGA ═══ -->
    <template v-if="categoryLoading">
      <section class="relative z-[1] pt-8 pb-6">
        <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <div class="h-6 w-28 bg-gray-200 rounded-full animate-pulse"></div>
            <div class="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <!-- Título -->
          <div class="h-10 w-3/4 bg-gray-200 rounded-xl animate-pulse mb-3"></div>
          <div class="h-10 w-1/2 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
          <!-- Subtítulos -->
          <div class="h-5 w-2/3 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-24 lg:pb-8">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          <!-- Columna izquierda skeleton -->
          <div class="order-2 lg:order-1 min-w-0">
            <!-- Tabs -->
            <div class="flex gap-1 p-1 bg-white rounded-2xl shadow-md mb-4">
              <div v-for="i in 4" :key="i" class="flex-1 h-11 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <!-- Acordeones -->
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="flex items-center justify-between p-4 lg:px-6">
                  <div class="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Columna derecha skeleton -->
          <div class="order-1 lg:order-2">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
              <!-- Imagen -->
              <div class="w-full aspect-video bg-gray-200 animate-pulse"></div>
              <div class="p-5 space-y-3">
                <!-- Precio -->
                <div class="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                <!-- Botones -->
                <div class="h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
                <div class="h-10 w-full bg-gray-100 rounded-xl animate-pulse"></div>
                <!-- Lista incluye -->
                <div class="pt-4 space-y-3">
                  <div v-for="i in 4" :key="i" class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-gray-200 animate-pulse shrink-0"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse" :style="`width: ${55 + i * 8}%`"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ HERO HEADER ═══ -->
    <section v-if="!categoryLoading" class="relative z-[1] pt-8 pb-6">
      <!-- Banner afiliado -->
      <div
        v-if="userAuth.nameAffiliaty"
        class="max-w-7xl mx-auto bg-blue-50 border border-blue-100 rounded-lg mx-4 md:mx-8 mb-6 px-4 py-2 text-sm text-blue-700 font-medium flex items-center gap-2"
      >
        <span class="text-blue-400">🎟️</span>
        Comprando con el descuento especial de
        <strong>{{ userAuth.nameAffiliaty }}</strong>
      </div>

      <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <!-- Tags del producto -->
        <div class="flex flex-wrap gap-2 mb-4">
          <!-- Etiqueta Bloque Individual para bloques basicos -->
          <span
            v-if="tierInfo.tier === 'basic'"
            class="inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600"
          >
            📌 Bloque Individual
          </span>
          <span
            class="inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1"
            :class="[tierInfo.pillBg, tierInfo.pillText]"
          >
            {{ tierInfo.label }}
          </span>
          <span
            v-if="tierInfo.isPremium"
            class="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50"
          >
            👑 Mejor Valor
          </span>
          <span
            v-if="tierInfo.includesResale"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
          >
            🤝 Incluye Reventa
          </span>
          <span
            v-if="tierInfo.includesDiscount"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
          >
            🎟️ 70% Dto. en toda la tienda
          </span>
        </div>

        <h1
          class="font-[Poppins] text-3xl md:text-4xl lg:text-5xl font-black text-[#0d1b2a] tracking-tight leading-tight mb-3 max-w-3xl"
        >
          {{ category?.titulo }}
        </h1>

        <p
          v-if="category?.frase_1"
          class="text-base lg:text-lg text-slate-500 leading-relaxed mb-2 max-w-2xl"
        >
          {{ category.frase_1 }}
        </p>

        <p
          v-if="category?.frase_2"
          class="text-sm text-slate-400 italic border-l-2 border-blue-200 pl-3 max-w-xl"
        >
          "{{ category.frase_2 }}"
        </p>

        <!-- ── Desplegable "Descubre lo que lograrás" ── -->
        <div v-if="descripcionCurso" class="mt-4 max-w-2xl">
          <button
            @click="showDescripcion = !showDescripcion"
            class="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors duration-200 px-0 py-1"
          >
            Descubre lo que lograrás
            <svg
              class="w-4 h-4 transition-transform duration-300"
              :class="{ 'rotate-180': showDescripcion }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Transition name="desc-accordion">
            <div v-show="showDescripcion" class="overflow-hidden">
              <p
                class="text-sm text-slate-600 leading-relaxed mt-2 pl-3 border-l-2 border-blue-300"
              >
                {{ descripcionCurso }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ═══ MAIN CONTENT ═══ -->
    <div v-if="!categoryLoading" class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-24 lg:pb-8">
      <div
        class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start"
      >
        <!-- ── COLUMNA IZQUIERDA: CONTENIDO ── -->
        <div class="order-2 lg:order-1 min-w-0">
          <!-- Tab Navigation -->
          <div
            class="flex flex-wrap gap-1 p-1 bg-white/90 backdrop-blur-sm border border-slate-100/80 rounded-2xl shadow-md mb-4 sticky top-16 max-md:top-28 z-10"
          >
            <button
              v-for="(tab, key) in [
                {
                  id: Navegacion.Contenido,
                  label: 'Contenido',
                  icon: courseInfoIcons.contenido,
                },
                {
                  id: Navegacion.Preguntas,
                  label: 'Preguntas',
                  icon: courseInfoIcons.preguntas,
                },
                {
                  id: Navegacion.Comentarios,
                  label: 'Reseñas',
                  icon: courseInfoIcons.comentarios,
                },
                {
                  id: Navegacion.Beneficios,
                  label: 'Beneficios',
                  icon: courseInfoIcons.beneficios,
                },
              ]"
              :key="key"
              @click="navegacion = tab.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer"
              :class="
                navegacion === tab.id
                  ? 'bg-[#1e40af] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#0d1b2a] bg-transparent'
              "
            >
              <div class="w-4 h-4" v-html="tab.icon"></div>
              {{ tab.label }}
            </button>
          </div>

          <!-- TAB: Contenido -->
          <div v-if="navegacion === Navegacion.Contenido" class="space-y-5">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-1 h-8 rounded-full shrink-0"
                :class="tierInfo.accentColor"
              />
              <h2
                class="font-[Poppins] text-xl md:text-2xl font-bold text-[#0d1b2a] tracking-tight"
              >
                {{ contentHeading }}
              </h2>
            </div>

            <!-- Pilares que incluye -->
            <div
              v-if="bloquesLoading || bloquesData.length"
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden transition-shadow hover:shadow-lg"
            >
              <button
                class="w-full flex items-center justify-between p-4 lg:px-6 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/60"
                @click="toggleFolder('section-bloques')"
              >
                <span class="font-[Poppins] text-base font-bold text-[#0d1b2a]"
                  >Pilares que incluye</span
                >
                <span class="flex items-center gap-3">
                  <template v-if="bloquesLoading">
                    <svg
                      class="w-4 h-4 animate-spin text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  </template>
                  <template v-else>
                    <span
                      class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
                    >
                      {{
                        bloquesData.reduce(
                          (acc, g) => acc + g.bloques.length,
                          0,
                        )
                      }}
                      bloques
                    </span>
                  </template>
                  <svg
                    class="w-5 h-5 text-slate-400 transition-transform duration-300"
                    :class="{ 'rotate-180': isFolderOpen('section-bloques') }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>

              <div
                v-show="isFolderOpen('section-bloques')"
                class="accordion-body border-t border-slate-100 bg-slate-50/40"
              >
                <!-- Precio por bloque -->
                <div
                  v-if="
                    !bloquesLoading && bloquesData.length && category?.precio
                  "
                  class="mx-4 lg:mx-6 mt-4 mb-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5"
                >
                  <svg
                    class="w-4 h-4 text-emerald-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span class="text-sm text-emerald-700">
                    Cada bloque te sale a
                    <strong
                      >{{
                        formatPrice(
                          Math.round(
                            category.precio /
                              bloquesData.reduce(
                                (acc, g) => acc + g.bloques.length,
                                0,
                              ),
                          ),
                        )
                      }}
                      {{ currencySuffix }}</strong
                    >
                  </span>
                </div>

                <!-- Grupos de bloques por pilar -->
                <div v-if="!bloquesLoading" class="p-4 lg:px-6 space-y-4">
                  <div v-for="group in bloquesData" :key="group.pilar.id">
                    <!-- Cabecera del pilar -->
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-base">{{
                        getPilarEmoji(group.pilar.id)
                      }}</span>
                      <span
                        class="font-[Poppins] font-bold text-sm text-[#0d1b2a]"
                        >{{ group.pilar.titulo }}</span
                      >
                      <span
                        class="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ml-1"
                        :class="getPilarColorClasses(group.pilar.id).badge"
                      >
                        {{ group.bloques.length }} bloques
                      </span>
                    </div>

                    <!-- Bloques -->
                    <div class="space-y-2">
                      <div
                        v-for="bloque in group.bloques"
                        :key="bloque.id"
                        class="bg-white rounded-xl border border-slate-100 overflow-hidden transition-colors hover:border-slate-200"
                      >
                        <div
                          class="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50/60"
                          @click="toggleFolder(`bloque-${bloque.id}`)"
                        >
                          <div class="flex items-center gap-3">
                            <span
                              class="w-2 h-2 rounded-full shrink-0"
                              :class="getPilarColorClasses(group.pilar.id).dot"
                            ></span>
                            <span
                              class="font-semibold text-sm text-[#0d1b2a]"
                              >{{ bloque.titulo }}</span
                            >
                          </div>
                          <div class="flex items-center gap-3 shrink-0 ml-2">
                            <span class="text-xs text-slate-500"
                              >{{
                                bloque.seccion_lista_completa
                                  ?.cantidad_cursos ??
                                bloque.seccion_lista_completa?.lista_completa
                                  ?.length ??
                                0
                              }}
                              cursos</span
                            >
                            <svg
                              class="w-4 h-4 text-slate-400 transition-transform"
                              :class="{
                                'rotate-180': isFolderOpen(
                                  `bloque-${bloque.id}`,
                                ),
                              }"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <div
                          v-show="isFolderOpen(`bloque-${bloque.id}`)"
                          class="border-t border-slate-50 bg-[#fafbfd] px-4 py-3 space-y-2"
                        >
                          <!-- Sub: Plataformas Integradas -->
                          <div
                            v-if="
                              bloque.seccion_plataformas?.plataformas?.length
                            "
                            class="bg-white rounded-xl border border-slate-100 overflow-hidden"
                          >
                            <button
                              class="w-full flex items-center justify-between px-4 py-2.5 bg-transparent border-none cursor-pointer transition-colors hover:bg-blue-50/30"
                              @click="toggleFolder(`bloque-${bloque.id}-plat`)"
                            >
                              <div class="flex items-center gap-2">
                                <svg
                                  class="w-4 h-4 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                                  />
                                </svg>
                                <span
                                  class="font-semibold text-xs text-[#0d1b2a]"
                                  >Autores</span
                                >
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="text-[0.65rem] text-slate-500"
                                  >{{
                                    bloque.seccion_plataformas
                                      .cantidad_plataformas ??
                                    bloque.seccion_plataformas.plataformas
                                      .length
                                  }}
                                  plataformas</span
                                >
                                <svg
                                  class="w-3.5 h-3.5 text-slate-400 transition-transform"
                                  :class="{
                                    'rotate-180': isFolderOpen(
                                      `bloque-${bloque.id}-plat`,
                                    ),
                                  }"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>
                            <div
                              v-show="isFolderOpen(`bloque-${bloque.id}-plat`)"
                              class="border-t border-slate-50 bg-[#fafbfd] px-4 py-3 max-h-72 overflow-y-auto"
                            >
                              <div
                                v-for="(plat, pIdx) in bloque
                                  .seccion_plataformas.plataformas"
                                :key="pIdx"
                                class="ml-2 pl-3 border-l-2 border-slate-200 py-1.5 flex items-center justify-between"
                              >
                                <span
                                  class="text-xs font-medium text-slate-700"
                                  >{{
                                    plat.titulo_plataforma || "Módulo"
                                  }}</span
                                >
                                <span class="text-[0.6rem] text-slate-400"
                                  >{{
                                    plat.cantidad_cursos_plataforma ??
                                    plat.cursos?.length ??
                                    0
                                  }}
                                  cursos</span
                                >
                              </div>
                            </div>
                          </div>

                          <!-- Sub: Lista Completa -->
                          <div
                            v-if="
                              bloque.seccion_lista_completa?.lista_completa
                                ?.length
                            "
                            class="bg-white rounded-xl border border-slate-100 overflow-hidden"
                          >
                            <button
                              class="w-full flex items-center justify-between px-4 py-2.5 bg-transparent border-none cursor-pointer transition-colors hover:bg-amber-50/30"
                              @click="toggleFolder(`bloque-${bloque.id}-lista`)"
                            >
                              <div class="flex items-center gap-2">
                                <svg
                                  class="w-4 h-4 text-amber-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                  <path
                                    fill-rule="evenodd"
                                    d="M4 5a2 2 0 012-2h3a1 1 0 010 2H6v11a2 2 0 002 2h7a2 2 0 002-2V5h-2a1 1 0 110-2h2a2 2 0 012 2v11a4 4 0 01-4 4H8a4 4 0 01-4-4V5z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                                <span
                                  class="font-semibold text-xs text-[#0d1b2a]"
                                  >Lista Completa</span
                                >
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="text-[0.65rem] text-slate-500"
                                  >{{
                                    bloque.seccion_lista_completa
                                      .cantidad_cursos ??
                                    bloque.seccion_lista_completa.lista_completa
                                      .length
                                  }}
                                  cursos</span
                                >
                                <svg
                                  class="w-3.5 h-3.5 text-slate-400 transition-transform"
                                  :class="{
                                    'rotate-180': isFolderOpen(
                                      `bloque-${bloque.id}-lista`,
                                    ),
                                  }"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>
                            <div
                              v-show="isFolderOpen(`bloque-${bloque.id}-lista`)"
                              class="border-t border-slate-50 bg-[#fafbfd] px-4 py-3 max-h-72 overflow-y-auto"
                            >
                              <div
                                v-for="(curso, cIdx) in bloque
                                  .seccion_lista_completa.lista_completa"
                                :key="cIdx"
                                class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                              >
                                <span class="text-xs font-medium text-slate-700"
                                  >{{ cIdx + 1 }}.
                                  {{ curso.name_del_curso || "Curso" }}</span
                                >
                                <button
                                  v-if="curso.info_tecnica?.url"
                                  :disabled="isLoadingDrive"
                                  class="text-[0.6rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border-none cursor-pointer hover:bg-blue-100 shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  @click.stop="
                                    handlePreview(
                                      category,
                                      curso.info_tecnica.url,
                                    )
                                  "
                                >
                                  <template v-if="isLoadingDrive">Preparando...</template>
                                  <template v-else>
                                    <svg class="inline-block w-3 h-3 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-1px">
                                      <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#0066DA"/>
                                      <path d="M16.29 3.5H7.71l6.57 11.5h8.57L16.29 3.5z" fill="#00AC47"/>
                                      <path d="M4.45 20.5h15.1l3.3-5.5H7.75L4.45 20.5z" fill="#FFBA00"/>
                                    </svg>
                                    Ver en Google Drive
                                  </template>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plataformas -->
            <div
              v-if="category?.seccion_plataformas?.plataformas?.length"
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden transition-shadow hover:shadow-lg"
            >
              <button
                class="w-full flex items-center justify-between p-4 lg:px-6 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/60"
                @click="toggleFolder('section-plataformas')"
              >
                <span class="font-[Poppins] text-base font-bold text-[#0d1b2a]"
                  >Autores</span
                >
                <span class="flex items-center gap-3">
                  <span
                    class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
                  >
                    {{
                      category?.seccion_plataformas?.cantidad_plataformas ??
                      category?.seccion_plataformas?.plataformas?.length ??
                      0
                    }}
                    autores
                  </span>
                  <svg
                    class="w-5 h-5 text-slate-400 transition-transform duration-300"
                    :class="{
                      'rotate-180': isFolderOpen('section-plataformas'),
                    }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              <div
                v-show="isFolderOpen('section-plataformas')"
                class="accordion-body border-t border-slate-100 p-4 lg:px-6 max-h-[600px] overflow-y-auto bg-slate-50/40"
              >
                <div
                  v-if="!category?.seccion_plataformas?.plataformas?.length"
                  class="text-sm text-slate-500 py-4 text-center"
                >
                  Sin elementos
                </div>

                <div
                  v-for="plataforma in paginatedPlataformas"
                  :key="plataforma.originalIndex"
                  class="mb-2 bg-white rounded-xl border border-slate-100 overflow-hidden transition-colors hover:border-slate-200"
                >
                  <div
                    class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50/30"
                    @click="toggleFolder(`plat-${plataforma.originalIndex}`)"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </span>
                      <span class="font-semibold text-[#0d1b2a]">{{
                        plataforma.titulo_plataforma || "Modulo"
                      }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-slate-500"
                        >{{
                          plataforma.cantidad_cursos_plataforma ??
                          plataforma.cursos?.length ??
                          0
                        }}
                        cursos</span
                      >
                      <svg
                        class="w-4 h-4 text-slate-400 transition-transform"
                        :class="{
                          'rotate-180': isFolderOpen(
                            `plat-${plataforma.originalIndex}`,
                          ),
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    v-show="isFolderOpen(`plat-${plataforma.originalIndex}`)"
                    class="border-t border-slate-50 bg-[#fafbfd] px-4 py-3"
                  >
                    <div
                      v-for="(curso, cIndex) in plataforma.cursos || []"
                      :key="cIndex"
                      class="ml-3 pl-4 border-l-2 border-blue-100 py-2.5 flex items-center justify-between group/item hover:border-l-blue-400 transition-colors"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span
                          class="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-[0.6rem] font-bold group-hover/item:bg-blue-100 transition-colors"
                        >
                          {{ cIndex + 1 }}
                        </span>
                        <span
                          class="text-sm font-medium text-slate-600 group-hover/item:text-slate-800 transition-colors truncate"
                        >
                          {{ curso.name_del_curso || "Leccion" }}
                        </span>
                      </div>
                      <button
                        v-if="curso.info_tecnica?.url"
                        :disabled="isLoadingDrive"
                        class="text-[0.65rem] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-100 shrink-0 ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click.stop="
                          handlePreview(category, curso.info_tecnica.url)
                        "
                      >
                        <template v-if="isLoadingDrive">Preparando...</template>
                        <template v-else>
                          <svg class="inline-block w-3 h-3 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-1px">
                            <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#0066DA"/>
                            <path d="M16.29 3.5H7.71l6.57 11.5h8.57L16.29 3.5z" fill="#00AC47"/>
                            <path d="M4.45 20.5h15.1l3.3-5.5H7.75L4.45 20.5z" fill="#FFBA00"/>
                          </svg>
                          Ver en Google Drive
                        </template>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="totalPagesPlataformas > 1"
                  class="flex items-center justify-center gap-4 mt-4 pt-3"
                >
                  <button
                    @click="currentPages.plataformas--"
                    :disabled="currentPages.plataformas === 1"
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span class="text-xs font-semibold text-slate-500"
                    >Pagina {{ currentPages.plataformas }} de
                    {{ totalPagesPlataformas }}</span
                  >
                  <button
                    @click="currentPages.plataformas++"
                    :disabled="
                      currentPages.plataformas === totalPagesPlataformas
                    "
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bloques -->
            <div
              v-if="category?.seccion_temas?.temas?.length"
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden transition-shadow hover:shadow-lg"
            >
              <button
                class="w-full flex items-center justify-between p-4 lg:px-6 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/60"
                @click="toggleFolder('section-bloques')"
              >
                <span class="font-[Poppins] text-base font-bold text-[#0d1b2a]"
                  >Bloques</span
                >
                <span class="flex items-center gap-3">
                  <span
                    class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
                  >
                    {{
                      computedBloquesCount ??
                      category?.seccion_temas?.temas?.length ??
                      0
                    }}
                    bloques
                  </span>
                  <svg
                    class="w-5 h-5 text-slate-400 transition-transform duration-300"
                    :class="{ 'rotate-180': isFolderOpen('section-bloques') }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              <div
                v-show="isFolderOpen('section-bloques')"
                class="accordion-body border-t border-slate-100 p-4 lg:px-6 max-h-[600px] overflow-y-auto bg-slate-50/40"
              >
                <div
                  v-if="!category?.seccion_temas?.temas?.length"
                  class="text-sm text-slate-500 py-4 text-center"
                >
                  Sin elementos
                </div>
                <div
                  v-for="bloque in paginatedBloques"
                  :key="bloque.originalIndex"
                  class="mb-2 bg-white rounded-xl border border-slate-100 overflow-hidden transition-colors hover:border-slate-200"
                >
                  <div
                    class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-emerald-50/30"
                    @click="toggleFolder(`bloque-${bloque.originalIndex}`)"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </span>
                      <span class="font-semibold text-[#0d1b2a]">{{
                        bloque.titulo_tema || "Bloque"
                      }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-slate-500"
                        >{{
                          bloque.cantidad_cursos_tema ??
                          bloque.cursos?.length ??
                          0
                        }}
                        cursos</span
                      >
                      <svg
                        class="w-4 h-4 text-slate-400 transition-transform"
                        :class="{
                          'rotate-180': isFolderOpen(
                            `bloque-${bloque.originalIndex}`,
                          ),
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    v-show="isFolderOpen(`bloque-${bloque.originalIndex}`)"
                    class="border-t border-slate-50 bg-[#fafbfd] px-4 py-3"
                  >
                    <div
                      v-for="(curso, cIndex) in bloque.cursos || []"
                      :key="cIndex"
                      class="ml-3 pl-4 border-l-2 border-emerald-100 py-2.5 flex items-center justify-between group/item hover:border-l-emerald-400 transition-colors"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span
                          class="w-5 h-5 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 text-[0.6rem] font-bold group-hover/item:bg-emerald-100 transition-colors"
                        >
                          {{ cIndex + 1 }}
                        </span>
                        <span
                          class="text-sm font-medium text-slate-600 group-hover/item:text-slate-800 transition-colors truncate"
                        >
                          {{ curso.name_del_curso || "Leccion" }}
                        </span>
                      </div>
                      <button
                        v-if="curso.info_tecnica?.url"
                        :disabled="isLoadingDrive"
                        class="text-[0.65rem] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-100 shrink-0 ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click.stop="
                          handlePreview(category, curso.info_tecnica.url)
                        "
                      >
                        <template v-if="isLoadingDrive">Preparando...</template>
                        <template v-else>
                          <svg class="inline-block w-3 h-3 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-1px">
                            <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#0066DA"/>
                            <path d="M16.29 3.5H7.71l6.57 11.5h8.57L16.29 3.5z" fill="#00AC47"/>
                            <path d="M4.45 20.5h15.1l3.3-5.5H7.75L4.45 20.5z" fill="#FFBA00"/>
                          </svg>
                          Ver en Google Drive
                        </template>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="totalPagesBloques > 1"
                  class="flex items-center justify-center gap-4 mt-4 pt-3"
                >
                  <button
                    @click="currentPages.bloques--"
                    :disabled="currentPages.bloques === 1"
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span class="text-xs font-semibold text-slate-500"
                    >Pagina {{ currentPages.bloques }} de
                    {{ totalPagesBloques }}</span
                  >
                  <button
                    @click="currentPages.bloques++"
                    :disabled="currentPages.bloques === totalPagesBloques"
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Lista Completa -->
            <div
              id="lista-completa-header"
              v-if="category?.seccion_lista_completa?.lista_completa?.length"
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden transition-shadow hover:shadow-lg"
            >
              <button
                class="w-full flex items-center justify-between p-4 lg:px-6 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/60"
                @click="toggleFolder('section-lista-completa')"
              >
                <span class="font-[Poppins] text-base font-bold text-[#0d1b2a]"
                  >Lista Completa</span
                >
                <span class="flex items-center gap-3">
                  <span
                    class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
                  >
                    <template v-if="computedBloquesCount !== null"
                      >{{ computedBloquesCount }} bloques &middot; </template
                    >{{
                      category?.seccion_lista_completa?.cantidad_cursos ??
                      category?.seccion_lista_completa?.lista_completa
                        ?.length ??
                      0
                    }}
                    cursos
                  </span>
                  <svg
                    class="w-5 h-5 text-slate-400 transition-transform duration-300"
                    :class="{
                      'rotate-180': isFolderOpen('section-lista-completa'),
                    }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              <div
                ref="listaCompletaScrollRef"
                v-show="isFolderOpen('section-lista-completa')"
                class="accordion-body border-t p-4 lg:px-6 max-h-[600px] overflow-y-auto transition-colors duration-200"
                :class="
                  isListaBuscando
                    ? 'border-sky-200 bg-gradient-to-b from-sky-50/95 to-sky-100/40 ring-2 ring-inset ring-sky-300/50'
                    : 'border-slate-100 bg-slate-50/40'
                "
              >
                <!-- Barra anclada arriba al buscar -->

                <!-- Buscador -->
                <div
                  class="mb-5 relative w-full lg:w-2/3 mx-auto rounded-xl transition-shadow"
                  :class="isListaBuscando ? 'ring-2 ring-sky-400/40 shadow-md shadow-sky-200/30' : ''"
                >
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5"
                      :class="isListaBuscando ? 'text-sky-500' : 'text-slate-400'"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    v-model="searchTermLista"
                    type="text"
                    placeholder="Buscar un curso especifico en este paquete..."
                    class="w-full py-3 pl-10 pr-10 rounded-xl text-sm transition-all shadow-sm focus:outline-none focus:ring-2"
                    :class="
                      isListaBuscando
                        ? 'border-2 border-sky-400 bg-white text-[#0d1b2a] focus:border-sky-500 focus:ring-sky-300/40'
                        : 'border border-slate-200 bg-white text-[#0d1b2a] focus:border-blue-500 focus:ring-blue-500/10'
                    "
                  />
                  <button
                    v-if="searchTermLista"
                    @click="searchTermLista = ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  v-if="!filteredListaCompleta.length"
                  class="text-sm text-slate-500 py-8 text-center flex flex-col items-center justify-center"
                >
                  <svg
                    class="w-12 h-12 text-slate-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  No se encontraron cursos que coincidan con "{{
                    searchTermLista
                  }}"
                </div>

                <div
                  v-for="curso in paginatedListaCompleta"
                  :key="'lc-' + curso.vistaListaIndex + '-' + (curso.name_del_curso ?? '')"
                  class="mb-1.5 rounded-xl border overflow-hidden transition-all group"
                  :class="
                    isPromoItem(curso)
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200 hover:border-amber-400 hover:shadow-sm'
                      : isListaBusquedaDestacado(curso)
                        ? 'bg-white border-sky-300 ring-1 ring-sky-200/90 shadow-sm shadow-sky-100 hover:border-sky-400 hover:shadow-md'
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                  "
                >
                  <div class="flex items-center justify-between px-4 py-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <span
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors"
                        :class="
                          isPromoItem(curso)
                            ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-200'
                            : isListaBusquedaDestacado(curso)
                              ? 'bg-sky-600 text-white group-hover:bg-sky-700'
                              : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                        "
                      >
                        {{ curso.vistaListaIndex + 1 }}
                      </span>
                      <span
                        v-if="isPromoItem(curso)"
                        class="shrink-0 text-[0.65rem] font-bold uppercase tracking-wide text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md"
                      >
                        Tu curso
                      </span>
                      <span
                        class="text-sm font-medium transition-colors truncate"
                        :class="
                          isPromoItem(curso)
                            ? 'text-amber-950 group-hover:text-amber-950'
                            : isListaBusquedaDestacado(curso)
                              ? 'text-sky-950 group-hover:text-sky-950'
                              : 'text-slate-700 group-hover:text-[#0d1b2a]'
                        "
                        >{{ curso.name_del_curso || "Curso" }}</span
                      >
                    </div>
                    <button
                      v-if="curso.info_tecnica?.url"
                      :disabled="isLoadingDrive"
                      class="text-[0.65rem] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors hover:bg-blue-100 shrink-0 ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      @click.stop="
                        handlePreview(category, curso.info_tecnica.url)
                      "
                    >
                      <template v-if="isLoadingDrive">Preparando...</template>
                      <template v-else>
                        <svg class="inline-block w-3 h-3 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:-1px">
                          <path d="M7.71 3.5L1.15 15l3.3 5.5 6.57-11.5-3.31-5.5z" fill="#0066DA"/>
                          <path d="M16.29 3.5H7.71l6.57 11.5h8.57L16.29 3.5z" fill="#00AC47"/>
                          <path d="M4.45 20.5h15.1l3.3-5.5H7.75L4.45 20.5z" fill="#FFBA00"/>
                        </svg>
                        Ver en Google Drive
                      </template>
                    </button>
                  </div>
                </div>

                <div
                  v-if="totalPagesListaCompleta > 1"
                  class="flex items-center justify-center gap-4 mt-4 pt-3"
                >
                  <button
                    @click="currentPages.listaCompleta--"
                    :disabled="currentPages.listaCompleta === 1"
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span class="text-xs font-semibold text-slate-500"
                    >Pagina {{ currentPages.listaCompleta }} de
                    {{ totalPagesListaCompleta }}</span
                  >
                  <button
                    @click="currentPages.listaCompleta++"
                    :disabled="
                      currentPages.listaCompleta === totalPagesListaCompleta
                    "
                    class="p-1.5 rounded-full bg-transparent border-none text-slate-500 cursor-pointer transition-all hover:bg-slate-100 hover:text-[#0d1b2a] disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB: Preguntas -->
          <div v-if="navegacion === Navegacion.Preguntas" class="space-y-4">
            <CourseFaqSection />
          </div>

          <!-- TAB: Comentarios -->
          <div v-if="navegacion === Navegacion.Comentarios">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-1 h-8 rounded-full shrink-0"
                :class="tierInfo.accentColor"
              />
              <h2
                class="font-[Poppins] text-xl md:text-2xl font-bold text-[#0d1b2a] tracking-tight"
              >
                Lo que dicen nuestros estudiantes
              </h2>
            </div>
            <div
              class="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-md"
            >
              <CommentsBodyComponent :userBought="category?.user_bought ?? false" />
            </div>
          </div>

          <!-- TAB: Beneficios -->
          <div v-if="navegacion === Navegacion.Beneficios" class="space-y-8">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-1 h-8 rounded-full shrink-0"
                :class="tierInfo.accentColor"
              />
              <h2
                class="font-[Poppins] text-xl md:text-2xl font-bold text-[#0d1b2a] tracking-tight"
              >
                Lo que obtendras
              </h2>
            </div>

            <!-- Beneficios incluidos -->
            <div
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4"
              >
                <h3
                  class="text-white font-[Poppins] font-bold text-lg flex items-center gap-2"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Incluido en este paquete
                </h3>
              </div>
              <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Certificacion Oficial
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Certificado al concluir todos los modulos
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      A tu propio ritmo
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Acceso 24/7 al material. Estudia cuando quieras
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      100% Descargable
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Descarga el contenido y estudia sin conexion
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Garantia de 7 dias
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Reembolso completo si no quedas satisfecho
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Acceso vitalicio
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Pago unico sin suscripciones ni costos ocultos
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Acceso en moviles y TV
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Estudia desde cualquier dispositivo
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/60"
                >
                  <div
                    class="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Biblioteca de 10.134 libros
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Acceso a una coleccion de libros digitales para
                      complementar tu aprendizaje
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lo que NO incluye este paquete (solo si no tiene reventa/descuento y hay upsell) -->
            <div
              v-if="!tierInfo.includesResale && upsellCategory"
              class="bg-white rounded-2xl border border-slate-100/80 shadow-md overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-slate-400 to-slate-500 px-6 py-4"
              >
                <h3
                  class="text-white font-[Poppins] font-bold text-lg flex items-center gap-2"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  No incluido en este paquete
                </h3>
              </div>
              <div class="p-6 space-y-3">
                <div
                  class="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100/60"
                >
                  <div class="p-2 rounded-lg bg-red-100 text-red-500 shrink-0">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Reventa de cursos
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      No podras revender los cursos y generar ingresos como
                      afiliado
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100/60"
                >
                  <div class="p-2 rounded-lg bg-red-100 text-red-500 shrink-0">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      70% Dto. en toda la tienda
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      No tendras acceso al descuento exclusivo para futuras
                      compras
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100/60"
                >
                  <div class="p-2 rounded-lg bg-red-100 text-red-500 shrink-0">
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-[#0d1b2a] text-sm">
                      Contenido de otros pilares
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Solo incluye este bloque, no el pilar completo ni los
                      demas pilares
                    </p>
                  </div>
                </div>

                <!-- CTA para ver el upsell -->
                <div
                  class="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-sm font-bold text-[#0d1b2a]">
                        ¿Quieres todos los beneficios?
                      </p>
                      <p class="text-xs text-slate-500 mt-0.5">
                        {{ upsellCategory.titulo }} incluye reventa, descuento y
                        mucho mas contenido
                      </p>
                    </div>
                    <button
                      @click="handleUpsellExplore"
                      class="shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold border-none cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 shadow-md shadow-blue-600/20"
                    >
                      Ver paquete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── COLUMNA DERECHA: SIDEBAR DE COMPRA ── -->
        <div class="order-1 lg:order-2">
          <div
            class="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
            :class="
              tierInfo.isPremium
                ? 'border-2 border-amber-200/60 shadow-xl lg:sticky lg:top-20'
                : 'border border-slate-100/80 shadow-md lg:sticky lg:top-20'
            "
          >
            <!-- Imagen preview -->
            <div
              class="relative w-full aspect-video bg-slate-100 cursor-pointer overflow-hidden group"
              @click="handleImagePreviewClick"
            >
              <img
                v-if="category?.imagen_url"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                :src="category.imagen_url"
                alt="Imagen del curso"
              />
              <div
                class="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/15"
              >
                <div
                  class="bg-white/90 backdrop-blur-sm rounded-full p-3.5 shadow-lg transition-transform group-hover:scale-110"
                >
                  <div
                    class="w-8 h-8 text-[#1e40af] flex items-center justify-center"
                    v-html="courseIcons.preview"
                  ></div>
                </div>
                <span
                  class="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[0.65rem] font-semibold px-2 py-0.5 rounded-md"
                  >Vista previa</span
                >
              </div>
            </div>

            <div class="p-5">
              <!-- Precio -->
              <div class="mb-3">
                <div v-if="hasDiscount" class="flex items-center gap-2 mb-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600"
                  >
                    {{ discountPercent }}% Dto.
                  </span>
                  <span class="line-through text-slate-400 text-sm font-medium">
                    ${{ formatPrice(category?.precio_desc) }}
                    {{ currencySuffix }}
                  </span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span
                    class="font-[Poppins] text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight leading-none"
                    >${{ formatPrice(category?.precio) }}</span
                  >
                  <span
                    class="text-sm sm:text-base font-semibold text-slate-500"
                    >{{ currencySuffix }}</span
                  >
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <p
                    class="text-emerald-600 text-xs font-semibold flex items-center gap-1"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Pago unico · Acceso vitalicio
                  </p>
                  <span
                    class="inline-flex items-center gap-1 text-[0.65rem] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full tracking-wide"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Certificado
                  </span>
                </div>
              </div>

              <!-- Cupos progress bar -->
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="text-slate-500">Cupos disponibles</span>
                  <span
                    class="font-bold"
                    :class="isLowStock ? 'text-red-600' : 'text-slate-800'"
                    >{{ cuposCount }} / {{ cuposMax }}</span
                  >
                </div>
                <div class="w-full h-1 rounded-full overflow-hidden" :class="isLowStock ? 'bg-red-500' : 'bg-slate-100'">
                  <div
                    class="h-full rounded-full transition-all duration-700 bg-emerald-500"
                    :style="{ width: `${cuposPercent}%` }"
                  />
                </div>
                <p
                  v-if="isLowStock"
                  class="text-red-500 text-[0.65rem] font-semibold mt-1"
                >
                  Quedan pocos cupos disponibles
                </p>
              </div>

              <!-- ══ SELECTOR DE OPCIONES + CTA UNICO ══ -->
              <div class="space-y-3" >
                <!-- Opcion 1: Producto actual (siempre visible) -->
                <label
                  v-if="!selectedCategory?.user_bought"
                  class="block w-full rounded-xl px-4 py-3 border-2 cursor-pointer transition-all"
                  :class="
                    selectedOption === 'current'
                      ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  "
                >
                  <input
                    type="radio"
                    v-model="selectedOption"
                    value="current"
                    class="sr-only"
                  />
                  <div  class="flex items-center gap-3 w-full">
                    <div
                      class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                      :class="
                        selectedOption === 'current'
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 bg-white'
                      "
                    >
                      <div
                        v-if="selectedOption === 'current'"
                        class="w-1.5 h-1.5 rounded-full bg-white"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-slate-500 font-medium">
                        Este paquete
                      </p>
                      <p
                        class="text-xs sm:text-sm font-bold text-[#0d1b2a] truncate"
                      >
                        {{ category?.titulo }}
                      </p>
                    </div>
                    <span
                      class="text-sm sm:text-base font-extrabold text-[#0d1b2a] whitespace-nowrap shrink-0"
                    >
                      ${{ formatPrice(category?.precio) }}
                    </span>
                  </div>
                </label>

                <!-- Opcion 2: Upsell (solo si hay upsell disponible) -->
                <div v-if="upsellCategory && !tierInfo.isPremium">
                  <label
                    class="block w-full rounded-xl px-4 py-3 border-2 cursor-pointer transition-all"
                    :class="
                      selectedOption === 'upsell'
                        ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    "
                  >
                    <input
                      type="radio"
                      v-model="selectedOption"
                      value="upsell"
                      class="sr-only"
                    />
                    <div class="flex items-center gap-3 w-full">
                      <div
                        class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                        :class="
                          selectedOption === 'upsell'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300 bg-white'
                        "
                      >
                        <div
                          v-if="selectedOption === 'upsell'"
                          class="w-1.5 h-1.5 rounded-full bg-white"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-1.5">
                          <span
                            class="text-[0.6rem] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"
                          >
                            {{ upsellTierLabel }}
                          </span>
                          <span
                            class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.55rem] font-extrabold uppercase tracking-wider text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100"
                            >Popular</span
                          >
                        </div>
                        <p
                          class="text-xs sm:text-sm font-bold text-[#0d1b2a] truncate mt-0.5"
                        >
                          {{ upsellCategory.titulo }}
                        </p>
                      </div>
                      <span
                        class="text-sm sm:text-base font-extrabold text-blue-600 whitespace-nowrap shrink-0"
                      >
                        ${{ formatPrice(upsellCategory.precio) }}
                      </span>
                    </div>

                    <!-- Flechita de curiosidad -->
                    <button
                      type="button"
                      class="mt-2 w-full flex items-center justify-center gap-1 text-[0.65rem] font-semibold transition-colors border-none bg-transparent cursor-pointer"
                      :class="
                        showUpsellDetails
                          ? 'text-blue-600'
                          : 'text-slate-400 hover:text-blue-500'
                      "
                      @click.prevent.stop="
                        showUpsellDetails = !showUpsellDetails
                      "
                    >
                      <span>{{
                        showUpsellDetails
                          ? "Ocultar detalles"
                          : "¿Que incluye este paquete?"
                      }}</span>
                      <svg
                        class="w-3 h-3 transition-transform duration-200"
                        :class="showUpsellDetails ? 'rotate-180' : ''"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </label>

                  <!-- Panel desplegable con detalles -->
                  <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[32rem]"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 max-h-[32rem]"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="showUpsellDetails" class="overflow-hidden">
                      <div
                        class="mt-1 rounded-b-xl bg-blue-50/60 border border-t-0 border-blue-100 px-4 py-3 space-y-1.5"
                      >
                        <!-- Primer benefit: clickeable para expandir bloques -->
                        <button
                          type="button"
                          class="w-full flex items-center justify-between gap-2 text-xs text-slate-700 font-semibold hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer"
                          @click.stop="showBlocksList = !showBlocksList"
                        >
                          <div class="flex items-center gap-2">
                            <svg
                              class="w-3.5 h-3.5 text-emerald-500 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {{ upsellBenefits[0] }}
                          </div>
                          <svg
                            class="w-3 h-3 transition-transform duration-200 text-slate-400 shrink-0"
                            :class="{ 'rotate-180': showBlocksList }"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        <!-- Lista de bloques -->
                        <Transition
                          enter-active-class="transition-all duration-200 ease-out"
                          enter-from-class="opacity-0 max-h-0"
                          enter-to-class="opacity-100 max-h-60"
                          leave-active-class="transition-all duration-150 ease-in"
                          leave-from-class="opacity-100 max-h-60"
                          leave-to-class="opacity-0 max-h-0"
                        >
                          <div
                            v-if="
                              showBlocksList && upsellBreakdown.blocks.length
                            "
                            class="overflow-hidden pl-5 pb-1"
                          >
                            <p class="text-[0.65rem] text-slate-400 mb-1">
                              {{ upsellBreakdown.blocks.length }} bloques · ~${{
                                formatPrice(upsellBreakdown.pricePerBlock)
                              }}
                              c/u
                            </p>
                            <ul class="space-y-0.5">
                              <li
                                v-for="block in upsellBreakdown.blocks"
                                :key="block.id"
                                class="flex items-center justify-between gap-2"
                              >
                                <span
                                  class="text-[0.7rem] text-slate-600 truncate"
                                  >· {{ block.titulo }}</span
                                >
                                <span
                                  class="text-[0.65rem] text-slate-400 shrink-0 tabular-nums"
                                  >~${{
                                    formatPrice(upsellBreakdown.pricePerBlock)
                                  }}</span
                                >
                              </li>
                            </ul>
                          </div>
                        </Transition>

                        <!-- Resto de benefits -->
                        <div
                          v-for="(benefit, i) in upsellBenefits.slice(1)"
                          :key="i"
                          class="flex items-center gap-2 text-xs text-slate-700"
                        >
                          <svg
                            class="w-3.5 h-3.5 text-emerald-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {{ benefit }}
                        </div>

                        <button
                          type="button"
                          class="text-[0.65rem] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors border-none bg-transparent cursor-pointer pt-0.5"
                          @click="handleUpsellExplore"
                        >
                          Ver todos los detalles →
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- BOTON UNICO DE COMPRA -->
                <button
                  v-if="!selectedCategory?.user_bought"
                  @click="handleBuySelected"
                  class="w-full py-3.5 px-4 rounded-xl border-none text-sm sm:text-base font-bold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-center"
                  :class="{
                    'btn-premium-gradient': tierInfo.isPremium,
                    'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30':
                      selectedOption === 'upsell' && !tierInfo.isPremium,
                    'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30':
                      selectedOption === 'current' && !tierInfo.isPremium,
                  }"
                >
                  Desbloquear paquete — ${{ formatPrice(selectedCategory?.precio) }}
                  {{ currencySuffix }}
                </button>

                <button
                  v-if="!selectedCategory?.user_bought"
                  @click="handleAddToCartSelected"
                  class="w-full py-3 px-4 rounded-xl border-2 border-blue-700 bg-transparent text-sm font-bold text-blue-700 cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-800"
                >
                  Anadir al carrito
                </button>
              </div>

              <!-- Affiliate -->
              <div class="mt-4">
                <AffiliatyMessageComponent
                  :id_category="category?.id"
                  variant="card"
                />
              </div>

              <!-- Incluye -->
              <div class="mt-4 pt-4 border-t border-slate-100">
                <h4
                  class="text-xs font-bold text-[#0d1b2a] uppercase tracking-wider mb-3"
                >
                  Este curso incluye
                </h4>
                <ul class="space-y-2.5">
                  <li class="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg
                      class="w-4 h-4 text-[#1e40af]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Acceso de por vida</span>
                  </li>
                  <li class="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg
                      class="w-4 h-4 text-[#1e40af]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Acceso en moviles y TV</span>
                  </li>
                  <li class="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg
                      class="w-4 h-4 text-[#1e40af]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Garantia de reembolso de 7 dias</span>
                  </li>
                  <li class="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg
                      class="w-4 h-4 text-[#1e40af]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>Biblioteca de 10.134 libros</span>
                  </li>
                </ul>
              </div>

              <!-- Trust badge -->
              <div
                class="flex items-center justify-center gap-1.5 pt-4 border-t border-slate-100 mt-5 text-[0.65rem] text-slate-400 font-medium"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Pagos seguros y encriptados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ BARRA FLOTANTE DE COMPRA ═══ -->
    <Teleport to="body">
      <div
        v-if="!storeemergentBuy.emergentBuy.emergent"
        class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:hidden"
      >
        <div class="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-baseline gap-1.5 shrink-0">
            <span
              v-if="hasDiscount"
              class="text-[0.65rem] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full self-center"
            >
              {{ discountPercent }}% Dto.
            </span>
            <span
              class="font-[Poppins] text-xl font-extrabold text-[#0f172a] tracking-tight leading-none"
            >
              ${{ formatPrice(selectedCategory?.precio) }}
            </span>
            <span class="text-xs font-semibold text-slate-500">{{
              currencySuffix
            }}</span>
          </div>
          <button
            @click="handleBuySelected"
            class="flex-1 max-w-[280px] py-3 px-5 rounded-xl border-none text-sm font-bold text-white cursor-pointer transition-all active:scale-[0.97] whitespace-nowrap"
            :class="{
              'btn-premium-gradient': tierInfo.isPremium,
              'bg-blue-600 shadow-lg shadow-blue-600/25':
                selectedOption === 'upsell' && !tierInfo.isPremium,
              'bg-emerald-600 shadow-lg shadow-emerald-600/25':
                selectedOption === 'current' && !tierInfo.isPremium,
            }"
          >
            Desbloquear paquete
          </button>
        </div>
      </div>
    </Teleport>

    <EmergentBuyComponent />
    <FooterComponent />
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap");

/* Accordion transition for description */
.desc-accordion-enter-active,
.desc-accordion-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.3s ease;
  max-height: 300px;
  opacity: 1;
}
.desc-accordion-enter-from,
.desc-accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Premium CTA gradient animation */
.btn-premium-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 50%, #f59e0b 100%);
  background-size: 200% 200%;
  color: #451a03;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
  animation: premiumGrad 3s ease infinite;
}
.btn-premium-gradient:hover {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
}
@keyframes premiumGrad {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Custom scrollbar for accordion body */
.accordion-body::-webkit-scrollbar {
  width: 4px;
}
.accordion-body::-webkit-scrollbar-track {
  background: transparent;
}
.accordion-body::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}
.accordion-body::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

</style>
