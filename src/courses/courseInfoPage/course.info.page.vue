<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { courseIcons } from "../courseIcons";
import { courseInfoIcons } from "./courseInfo.icons";
import { authStore } from "../../store/AuthStore";
import { cartStore } from "../../store/CartStore";
import AffiliatyMessageComponent from "../../components/auth/affiliaty.message.component.vue";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import type { ICategory } from "../../types/Categorie";
import { onMounted, ref, watch, computed } from "vue";
import { categoryStore } from "../../store/CategoryStore";
import EmergentBuyComponent from "../emergent.buy.component.vue";
import AuthService from "../../services/AuthServices";
import CategoryService from "../../services/CategorieService";
import CourseFaqSection from "./CourseFaqSection.vue";
import {
  classifyCategoryId,
  getPilarForThemeId,
  getUpsellTargetId,
  PILARES,
  COMBOS,
} from "../courseFilterData";
import type { PilarKey } from "../courseFilterData";

const cartSt = cartStore();
const storeemergentBuy = emergentBuyStore();
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
const navegacion = ref(Navegacion.Contenido);
const openedFolders = ref<Record<string, boolean>>({});

const itemsPerPage = 5;
const itemsPerPageLista = 10;

const currentPages = ref({
  plataformas: 1,
  temas: 1,
  listaCompleta: 1
});

const searchTermLista = ref("");

watch(searchTermLista, () => {
  currentPages.value.listaCompleta = 1;
});

const paginatedPlataformas = computed(() => {
  const list = category.value?.seccion_plataformas?.plataformas || [];
  const start = (currentPages.value.plataformas - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesPlataformas = computed(() => Math.ceil((category.value?.seccion_plataformas?.plataformas?.length || 0) / itemsPerPage));

const paginatedTemas = computed(() => {
  const list = category.value?.seccion_temas?.temas || [];
  const start = (currentPages.value.temas - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesTemas = computed(() => Math.ceil((category.value?.seccion_temas?.temas?.length || 0) / itemsPerPage));

const filteredListaCompleta = computed(() => {
  const list = category.value?.seccion_lista_completa?.lista_completa || [];
  if (!searchTermLista.value) return list;
  const term = searchTermLista.value.toLowerCase();
  return list.filter(item => item.name_del_curso?.toLowerCase().includes(term));
});

const paginatedListaCompleta = computed(() => {
  const list = filteredListaCompleta.value;
  const start = (currentPages.value.listaCompleta - 1) * itemsPerPageLista;
  return list.slice(start, start + itemsPerPageLista).map((item, idx) => ({
    ...item,
    originalIndex: start + idx
  }));
});
const totalPagesListaCompleta = computed(() => Math.ceil((filteredListaCompleta.value.length || 0) / itemsPerPageLista));

const toggleFolder = (key: string) => {
  openedFolders.value[key] = !openedFolders.value[key];
};

const isFolderOpen = (key: string) => Boolean(openedFolders.value[key]);

const openInNewTab = (url?: string) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

const addCarCategory = (item: ICategory) => {
  if (userAuth.getProfile() == null) {
    router.push("/login");
    return;
  }
  if (cartSt.validateCart(item)) {
    cartSt.setCart(item);
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

watch(
  [() => route.params.id, () => storeCategory.categories.length],
  async () => {
    openedFolders.value['section-lista-completa'] = true;
    if (route.query.q_course) {
      searchTermLista.value = route.query.q_course as string;
      setTimeout(() => {
         const el = document.getElementById('lista-completa-header');
         if(el) {
           const y = el.getBoundingClientRect().top + window.scrollY - 180;
           window.scrollTo({ top: y, behavior: 'smooth' });
         }
      }, 600);
    } else {
      searchTermLista.value = "";
    }
    await syncCategoryFromRoute();
    await loadUpsellCategory();
  },
  { immediate: true },
);

// ── Tier detection ──
const PILAR_EMOJI: Record<PilarKey, string> = {
  negocios: '💼',
  tecnologia: '💻',
  creativa: '🎨',
};

const tierInfo = computed(() => {
  const id = category.value?.id;
  if (!id) return { tier: 'basic' as const, label: '', includesResale: false, includesDiscount: false, isPremium: false, accentColor: 'bg-blue-500', pillBg: 'bg-blue-100', pillText: 'text-blue-700' };

  const filterType = classifyCategoryId(id);

  if (filterType === 'toda-la-tienda') {
    return { tier: 'premium' as const, label: '👑 Toda la Tienda 2026', includesResale: true, includesDiscount: true, isPremium: true, accentColor: 'bg-amber-500', pillBg: 'bg-amber-100', pillText: 'text-amber-700' };
  }
  if (filterType === 'combos') {
    const combo = COMBOS.find(c => c.id === id);
    return { tier: 'advanced' as const, label: `⚡ ${combo?.name ?? 'Combinacion'}`, includesResale: true, includesDiscount: true, isPremium: false, accentColor: 'bg-purple-500', pillBg: 'bg-purple-100', pillText: 'text-purple-700' };
  }
  if (filterType === 'pilares') {
    const pilar = PILARES.find(p => p.pilarId === id);
    const key = pilar?.key ?? 'negocios';
    return { tier: 'advanced' as const, label: `${PILAR_EMOJI[key]} ${pilar?.shortLabel ?? ''}`, includesResale: true, includesDiscount: true, isPremium: false, accentColor: pilar?.bgColor ?? 'bg-blue-500', pillBg: `bg-${key === 'negocios' ? 'blue' : key === 'tecnologia' ? 'emerald' : 'orange'}-100`, pillText: `text-${key === 'negocios' ? 'blue' : key === 'tecnologia' ? 'emerald' : 'orange'}-700` };
  }
  // temas
  const pilarKey = getPilarForThemeId(id);
  const pilar = pilarKey ? PILARES.find(p => p.key === pilarKey) : null;
  const colorName = pilarKey === 'negocios' ? 'blue' : pilarKey === 'tecnologia' ? 'emerald' : 'orange';
  return { tier: 'basic' as const, label: `${pilarKey ? PILAR_EMOJI[pilarKey] : '📌'} ${pilar?.shortLabel ?? 'Tema Individual'}`, includesResale: false, includesDiscount: false, isPremium: false, accentColor: `bg-${colorName}-500`, pillBg: `bg-${colorName}-100`, pillText: `text-${colorName}-700` };
});

const themesCount = computed(() => category.value?.seccion_temas?.cantidad_temas ?? 0);
const cursosCount = computed(() => category.value?.cantidad_cursos ?? 122);
const cuposCount = computed(() => category.value?.num_per ?? 23);
const cuposMax = 200;
const cuposPercent = computed(() => Math.min(100, Math.round((cuposCount.value / cuposMax) * 100)));
const isLowStock = computed(() => cuposCount.value < 30);

const currencySuffix = computed(() =>
  userAuth.getProfile()?.user?.country === 'COP' ? 'COP' : 'USD'
);

const formatPrice = (price: number | undefined) => {
  if (price == null) return '0';
  return price.toLocaleString();
};

const hasDiscount = computed(() =>
  category.value?.precio_desc != null
  && category.value.precio_desc > 0
  && category.value.precio_desc !== category.value.precio
);
const discountPercent = computed(() => {
  if (!hasDiscount.value || !category.value?.precio) return 0;
  return Math.round(
    ((category.value.precio_desc - (category.value.precio ?? 0)) / category.value.precio_desc) * 100
  );
});

// ── Upsell ──
const upsellCategory = ref<ICategory | null>(null);

const upsellTierLabel = computed(() => {
  if (!upsellCategory.value) return '';
  const type = classifyCategoryId(upsellCategory.value.id);
  if (type === 'pilares') return '🏛️ Pilar Completo';
  if (type === 'toda-la-tienda') return '👑 Toda la Tienda 2026';
  return '';
});

const upsellBenefits = computed(() => {
  if (!upsellCategory.value) return [];
  const type = classifyCategoryId(upsellCategory.value.id);
  if (type === 'pilares') {
    return ['Todos los temas del pilar', 'Incluye reventa', '70% Dto. en toda la tienda'];
  }
  if (type === 'toda-la-tienda') {
    return ['Los 3 pilares completos', 'Incluye reventa', 'Máximo valor por tu inversión'];
  }
  return [];
});

const loadUpsellCategory = async () => {
  const id = category.value?.id;
  if (!id) { upsellCategory.value = null; return; }
  const targetId = getUpsellTargetId(id);
  if (!targetId) { upsellCategory.value = null; return; }
  // Primero intentar desde el store
  const fromStore = storeCategory.findCategoryById(targetId);
  if (fromStore) { upsellCategory.value = fromStore; return; }
  // Si no está en store, cargar desde API
  const fromApi = await CategoryService.getCategoryById(targetId);
  if (fromApi) { upsellCategory.value = fromApi as ICategory; }
  else { upsellCategory.value = null; }
};

const selectedOption = ref<'current' | 'upsell'>('current');
const showUpsellDetails = ref(false);

const selectedCategory = computed(() =>
  selectedOption.value === 'upsell' && upsellCategory.value
    ? upsellCategory.value
    : category.value
);

const handleBuySelected = () => {
  const item = selectedCategory.value;
  if (!item) return;
  if (userAuth.getProfile() == null) { router.push('/login'); return; }
  storeemergentBuy.handleEmergentBuy();
  storeemergentBuy.setCategoryEmergent(item);
};

const handleAddToCartSelected = () => {
  const item = selectedCategory.value;
  if (!item) return;
  addCarCategory(item);
};

const handleUpsellExplore = () => {
  if (!upsellCategory.value) return;
  router.push({ name: 'courses-description', params: { id: upsellCategory.value.id } });
};
</script>

<template>
  <div class="cip-root">

    <!-- ═══ HERO HEADER ═══ -->
    <section class="cip-hero">
      <!-- Olas decorativas -->
      <div class="cip-wave" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Banner afiliado -->
      <div v-if="userAuth.nameAffiliaty" class="cip-affiliate-banner">
        <span>🎟️</span>
        Comprando con el descuento especial de <strong>{{ userAuth.nameAffiliaty }}</strong>
      </div>

      <div class="cip-hero-inner">
        <!-- Tags del producto -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="cip-pill" :class="[tierInfo.pillBg, tierInfo.pillText]">
            {{ tierInfo.label }}
          </span>
          <span v-if="tierInfo.isPremium" class="cip-pill cip-pill--premium">
            👑 Mejor Valor
          </span>
          <span v-if="tierInfo.includesResale" class="cip-pill bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10">
            🤝 Incluye Reventa
          </span>
          <span v-if="tierInfo.includesDiscount" class="cip-pill bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            🎟️ 70% Dto. en toda la tienda
          </span>
        </div>

        <h1 class="cip-hero-title">{{ category?.titulo }}</h1>

        <p v-if="category?.frase_1" class="cip-hero-sub">{{ category.frase_1 }}</p>

        <p v-if="category?.frase_2" class="cip-hero-frase">
          "{{ category.frase_2 }}"
        </p>
      </div>
    </section>

    <!-- ═══ MAIN CONTENT ═══ -->
    <div class="cip-main">
      <div class="cip-grid">

        <!-- ── COLUMNA IZQUIERDA: CONTENIDO ── -->
        <div class="cip-content-col">

          <!-- Tab Navigation -->
          <div class="cip-tabs">
            <button
              v-for="(tab, key) in [
                { id: Navegacion.Contenido, label: 'Contenido', icon: courseInfoIcons.contenido },
                { id: Navegacion.Preguntas, label: 'Preguntas', icon: courseInfoIcons.preguntas },
                { id: Navegacion.Comentarios, label: 'Resenas', icon: courseInfoIcons.comentarios },
                { id: Navegacion.Beneficios, label: 'Beneficios', icon: courseInfoIcons.beneficios }
              ]"
              :key="key"
              @click="navegacion = tab.id"
              class="cip-tab"
              :class="navegacion === tab.id ? 'cip-tab--active' : ''"
            >
              <div class="w-4 h-4" v-html="tab.icon"></div>
              {{ tab.label }}
            </button>
          </div>

          <!-- TAB: Contenido -->
          <div v-if="navegacion === Navegacion.Contenido" class="space-y-5">
            <h2 class="cip-section-title">Temario del curso</h2>

            <!-- Plataformas -->
            <div v-if="category?.seccion_plataformas?.plataformas?.length" class="cip-accordion">
              <button class="cip-accordion-header" @click="toggleFolder('section-plataformas')">
                <span class="cip-accordion-title">Plataformas Integradas</span>
                <span class="flex items-center gap-3">
                  <span class="cip-accordion-badge">
                    {{ category?.seccion_plataformas?.cantidad_plataformas ?? category?.seccion_plataformas?.plataformas?.length ?? 0 }} clases
                  </span>
                  <svg class="w-5 h-5 text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-plataformas') }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-plataformas')" class="cip-accordion-body">
                <div v-if="!(category?.seccion_plataformas?.plataformas?.length)" class="text-sm text-slate-500 py-4 text-center">Sin elementos</div>

                <div v-for="plataforma in paginatedPlataformas" :key="plataforma.originalIndex" class="cip-folder-item">
                  <div class="cip-folder-header" @click="toggleFolder(`plat-${plataforma.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                      <span class="font-semibold text-[#0d1b2a]">{{ plataforma.titulo_plataforma || "Modulo" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-slate-500">{{ plataforma.cantidad_cursos_plataforma ?? plataforma.cursos?.length ?? 0 }} lecciones</span>
                      <svg class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`plat-${plataforma.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div v-show="isFolderOpen(`plat-${plataforma.originalIndex}`)" class="cip-folder-content">
                    <div v-for="(curso, cIndex) in plataforma.cursos || []" :key="cIndex" class="cip-lesson-item">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-700 hover:text-blue-600 cursor-pointer" @click="toggleFolder(`plat-${plataforma.originalIndex}-cur-${cIndex}`)">
                          {{ cIndex + 1 }}. {{ curso.name_del_curso || "Leccion" }}
                        </span>
                        <button v-if="curso.info_tecnica?.url" class="cip-resource-btn" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      </div>
                      <ul v-show="isFolderOpen(`plat-${plataforma.originalIndex}-cur-${cIndex}`)" class="mt-2 space-y-1 text-xs text-slate-500 list-disc ml-4">
                        <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div v-if="totalPagesPlataformas > 1" class="cip-paginator">
                  <button @click="currentPages.plataformas--" :disabled="currentPages.plataformas === 1" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="cip-paginator-text">Pagina {{ currentPages.plataformas }} de {{ totalPagesPlataformas }}</span>
                  <button @click="currentPages.plataformas++" :disabled="currentPages.plataformas === totalPagesPlataformas" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Temas -->
            <div v-if="category?.seccion_temas?.temas?.length" class="cip-accordion">
              <button class="cip-accordion-header" @click="toggleFolder('section-temas')">
                <span class="cip-accordion-title">Temas</span>
                <span class="flex items-center gap-3">
                  <span class="cip-accordion-badge">
                    {{ category?.seccion_temas?.cantidad_temas ?? category?.seccion_temas?.temas?.length ?? 0 }} temas
                  </span>
                  <svg class="w-5 h-5 text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-temas') }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-temas')" class="cip-accordion-body">
                <div v-if="!(category?.seccion_temas?.temas?.length)" class="text-sm text-slate-500 py-4 text-center">Sin elementos</div>
                <div v-for="tema in paginatedTemas" :key="tema.originalIndex" class="cip-folder-item">
                  <div class="cip-folder-header" @click="toggleFolder(`tema-${tema.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a2 2 0 012-2h5a1 1 0 010 2H4v5.586l6.293-6.293a1 1 0 011.414 0l6.293 6.293V5a1 1 0 112 0v5a1 1 0 01-.293.707z" clip-rule="evenodd"></path></svg>
                      <span class="font-semibold text-[#0d1b2a]">{{ tema.titulo_tema || "Tema" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-slate-500">{{ tema.cantidad_cursos_tema ?? tema.cursos?.length ?? 0 }} lecciones</span>
                      <svg class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`tema-${tema.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div v-show="isFolderOpen(`tema-${tema.originalIndex}`)" class="cip-folder-content">
                    <div v-for="(curso, cIndex) in tema.cursos || []" :key="cIndex" class="cip-lesson-item">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-700 hover:text-blue-600 cursor-pointer" @click="toggleFolder(`tema-${tema.originalIndex}-cur-${cIndex}`)">
                          {{ cIndex + 1 }}. {{ curso.name_del_curso || "Leccion" }}
                        </span>
                        <button v-if="curso.info_tecnica?.url" class="cip-resource-btn" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      </div>
                      <ul v-show="isFolderOpen(`tema-${tema.originalIndex}-cur-${cIndex}`)" class="mt-2 space-y-1 text-xs text-slate-500 list-disc ml-4">
                        <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div v-if="totalPagesTemas > 1" class="cip-paginator">
                  <button @click="currentPages.temas--" :disabled="currentPages.temas === 1" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="cip-paginator-text">Pagina {{ currentPages.temas }} de {{ totalPagesTemas }}</span>
                  <button @click="currentPages.temas++" :disabled="currentPages.temas === totalPagesTemas" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Lista Completa -->
            <div id="lista-completa-header" v-if="category?.seccion_lista_completa?.lista_completa?.length" class="cip-accordion">
              <button class="cip-accordion-header" @click="toggleFolder('section-lista-completa')">
                <span class="cip-accordion-title">Lista Completa</span>
                <span class="flex items-center gap-3">
                  <span class="cip-accordion-badge">
                    {{ category?.seccion_lista_completa?.cantidad_cursos ?? category?.seccion_lista_completa?.lista_completa?.length ?? 0 }} cursos
                  </span>
                  <svg class="w-5 h-5 text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isFolderOpen('section-lista-completa') }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              <div v-show="isFolderOpen('section-lista-completa')" class="cip-accordion-body">
                <!-- Buscador -->
                <div class="mb-5 relative w-full lg:w-2/3 mx-auto">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    v-model="searchTermLista"
                    type="text"
                    placeholder="Buscar un curso especifico en este paquete..."
                    class="cip-search-input"
                  >
                  <button v-if="searchTermLista" @click="searchTermLista = ''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div v-if="!filteredListaCompleta.length" class="text-sm text-slate-500 py-8 text-center flex flex-col items-center justify-center">
                  <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  No se encontraron cursos que coincidan con "{{ searchTermLista }}"
                </div>

                <div v-for="curso in paginatedListaCompleta" :key="curso.originalIndex" class="cip-folder-item">
                  <div class="cip-folder-header" @click="toggleFolder(`lista-cur-${curso.originalIndex}`)">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2h3a1 1 0 010 2H6a2 2 0 012 2v11a2 2 0 002 2h7a2 2 0 002-2V7a2 2 0 012-2h2a1 1 0 110 2h-2a2 2 0 012 2v11a4 4 0 01-4 4H8a4 4 0 01-4-4V5z" clip-rule="evenodd"></path></svg>
                      <span class="font-semibold text-[#0d1b2a]">{{ curso.name_del_curso || "Curso" }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button v-if="curso.info_tecnica?.url" class="cip-resource-btn" @click.stop="openInNewTab(curso.info_tecnica?.url)">Recursos</button>
                      <svg class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': isFolderOpen(`lista-cur-${curso.originalIndex}`) }" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div v-show="isFolderOpen(`lista-cur-${curso.originalIndex}`)" class="cip-folder-content">
                    <ul class="space-y-1 text-xs text-slate-500 list-disc ml-4">
                      <li v-for="(item, iIndex) in curso.contenido || []" :key="iIndex">{{ item }}</li>
                    </ul>
                  </div>
                </div>

                <div v-if="totalPagesListaCompleta > 1" class="cip-paginator">
                  <button @click="currentPages.listaCompleta--" :disabled="currentPages.listaCompleta === 1" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span class="cip-paginator-text">Pagina {{ currentPages.listaCompleta }} de {{ totalPagesListaCompleta }}</span>
                  <button @click="currentPages.listaCompleta++" :disabled="currentPages.listaCompleta === totalPagesListaCompleta" class="cip-paginator-btn">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
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
            <h2 class="cip-section-title mb-6">Lo que dicen nuestros estudiantes</h2>
            <div class="cip-empty-state">
              <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 class="text-lg font-bold text-[#0d1b2a]">Comentarios proximamente</h3>
              <p class="text-slate-500 mt-2 text-sm">Se uno de los primeros en dejar tu opinion al terminar el curso.</p>
            </div>
          </div>

          <!-- TAB: Beneficios -->
          <div v-if="navegacion === Navegacion.Beneficios">
            <h2 class="cip-section-title mb-6">Lo que obtendras</h2>
            <div class="cip-benefits-grid">
              <div class="cip-benefit-card">
                <div class="cip-benefit-icon">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-[#0d1b2a]">Certificacion Oficial</h4>
                  <p class="text-sm text-slate-500 mt-1">Recibe un certificado al concluir todos los modulos.</p>
                </div>
              </div>
              <div class="cip-benefit-card">
                <div class="cip-benefit-icon">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-[#0d1b2a]">A tu propio ritmo</h4>
                  <p class="text-sm text-slate-500 mt-1">Acceso 24/7 al material. Estudia cuando quieras.</p>
                </div>
              </div>
              <div class="cip-benefit-card">
                <div class="cip-benefit-icon">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-[#0d1b2a]">100% Descargable</h4>
                  <p class="text-sm text-slate-500 mt-1">Descarga todo el contenido y estudia sin conexion.</p>
                </div>
              </div>
              <div class="cip-benefit-card">
                <div class="cip-benefit-icon">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h4 class="font-bold text-[#0d1b2a]">Garantia de 7 dias</h4>
                  <p class="text-sm text-slate-500 mt-1">Reembolso completo si no quedas satisfecho.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── COLUMNA DERECHA: SIDEBAR DE COMPRA ── -->
        <div class="cip-sidebar-col">
          <div class="cip-sidebar" :class="{ 'cip-sidebar--premium': tierInfo.isPremium }">

            <!-- Imagen preview -->
            <div class="cip-sidebar-img-wrap" @click="category?.url ? openInNewTab(category.url) : null">
              <img v-if="category?.imagen_url" class="cip-sidebar-img" :src="category.imagen_url" alt="Imagen del curso" />
              <div class="cip-sidebar-img-overlay">
                <div class="cip-play-btn">
                  <div class="w-8 h-8 text-[#1e40af] flex items-center justify-center" v-html="courseIcons.preview"></div>
                </div>
                <span class="cip-preview-badge">Vista previa</span>
              </div>
            </div>

            <div class="cip-sidebar-body">
              <!-- Precio -->
              <div class="mb-3">
                <div v-if="hasDiscount" class="flex items-center gap-2 mb-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
                    {{ discountPercent }}% Dto.
                  </span>
                  <span class="line-through text-slate-400 text-sm font-medium">
                    ${{ formatPrice(category?.precio_desc) }} {{ currencySuffix }}
                  </span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="cip-price">${{ formatPrice(category?.precio) }}</span>
                  <span class="text-base font-semibold text-slate-500">{{ currencySuffix }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <p class="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    Pago unico · Acceso vitalicio
                  </p>
                  <span class="cip-cert-badge">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Certificado
                  </span>
                </div>
              </div>

              <!-- Cupos progress bar -->
              <div class="mb-3">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="text-slate-500">Cupos disponibles</span>
                  <span class="font-bold" :class="isLowStock ? 'text-red-600' : 'text-slate-800'">{{ cuposCount }} / {{ cuposMax }}</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="isLowStock ? 'bg-red-500' : 'bg-emerald-500'"
                    :style="{ width: `${cuposPercent}%` }"
                  />
                </div>
                <p v-if="isLowStock" class="text-red-500 text-[0.65rem] font-semibold mt-1">Quedan pocos cupos disponibles</p>
              </div>

              <!-- ══ SELECTOR DE OPCIONES + CTA ÚNICO ══ -->
              <div class="space-y-3">

                <!-- Opcion 1: Producto actual (siempre visible) -->
                <label
                  class="upsell-option group cursor-pointer"
                  :class="selectedOption === 'current' ? 'upsell-option--active' : 'upsell-option--idle'"
                >
                  <input type="radio" v-model="selectedOption" value="current" class="sr-only" />
                  <div class="flex items-center gap-3 w-full">
                    <div
                      class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                      :class="selectedOption === 'current' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'"
                    >
                      <div v-if="selectedOption === 'current'" class="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-slate-500 font-medium">Este paquete</p>
                      <p class="text-sm font-bold text-[#0d1b2a] truncate">{{ category?.titulo }}</p>
                    </div>
                    <span class="text-base font-extrabold text-[#0d1b2a] whitespace-nowrap">
                      ${{ formatPrice(category?.precio) }}
                    </span>
                  </div>
                </label>

                <!-- Opcion 2: Upsell (solo si hay upsell disponible) -->
                <div v-if="upsellCategory && !tierInfo.isPremium">
                  <label
                    class="upsell-option group cursor-pointer"
                    :class="selectedOption === 'upsell' ? 'upsell-option--active upsell-option--upgrade' : 'upsell-option--idle'"
                  >
                    <input type="radio" v-model="selectedOption" value="upsell" class="sr-only" />
                    <div class="flex items-center gap-3 w-full">
                      <div
                        class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                        :class="selectedOption === 'upsell' ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'"
                      >
                        <div v-if="selectedOption === 'upsell'" class="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="text-[0.6rem] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {{ upsellTierLabel }}
                          </span>
                          <span class="upsell-popular-tag">Popular</span>
                        </div>
                        <p class="text-sm font-bold text-[#0d1b2a] truncate mt-0.5">{{ upsellCategory.titulo }}</p>
                      </div>
                      <span class="text-base font-extrabold text-blue-600 whitespace-nowrap">
                        ${{ formatPrice(upsellCategory.precio) }}
                      </span>
                    </div>

                    <!-- Flechita de curiosidad -->
                    <button
                      type="button"
                      class="mt-2 w-full flex items-center justify-center gap-1 text-[0.65rem] font-semibold transition-colors"
                      :class="showUpsellDetails ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'"
                      @click.prevent.stop="showUpsellDetails = !showUpsellDetails"
                    >
                      <span>{{ showUpsellDetails ? 'Ocultar detalles' : '¿Qué incluye este paquete?' }}</span>
                      <svg
                        class="w-3 h-3 transition-transform duration-200"
                        :class="showUpsellDetails ? 'rotate-180' : ''"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </label>

                  <!-- Panel desplegable con detalles -->
                  <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-60"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 max-h-60"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="showUpsellDetails" class="overflow-hidden">
                      <div class="mt-1 rounded-b-xl bg-blue-50/60 border border-t-0 border-blue-100 px-4 py-3 space-y-2">
                        <ul class="space-y-1.5">
                          <li
                            v-for="(benefit, i) in upsellBenefits"
                            :key="i"
                            class="flex items-center gap-2 text-xs text-slate-700"
                          >
                            <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {{ benefit }}
                          </li>
                        </ul>
                        <button
                          type="button"
                          class="text-[0.65rem] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          @click="handleUpsellExplore"
                        >
                          Ver todos los detalles →
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- BOTON ÚNICO DE COMPRA -->
                <button
                  @click="handleBuySelected"
                  class="cip-btn-primary"
                  :class="{
                    'cip-btn-primary--premium': tierInfo.isPremium,
                    'cip-btn-primary--upsell': selectedOption === 'upsell' && !tierInfo.isPremium,
                  }"
                >
                  Comprar ahora — ${{ formatPrice(selectedCategory?.precio) }} {{ currencySuffix }}
                </button>

                <button
                  @click="handleAddToCartSelected"
                  class="cip-btn-secondary"
                >
                  Anadir al carrito
                </button>
              </div>

              <!-- Affiliate -->
              <div class="mt-4">
                <AffiliatyMessageComponent :id_category="category?.id" variant="card" />
              </div>

              <!-- Incluye -->
              <div class="cip-includes">
                <h4 class="text-xs font-bold text-[#0d1b2a] uppercase tracking-wider mb-3">Este curso incluye</h4>
                <ul class="space-y-2.5">
                  <li class="cip-include-item">
                    <svg class="w-4 h-4 text-[#1e40af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span>Acceso de por vida</span>
                  </li>
                  <li class="cip-include-item">
                    <svg class="w-4 h-4 text-[#1e40af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <span>Acceso en moviles y TV</span>
                  </li>
                  <li class="cip-include-item">
                    <svg class="w-4 h-4 text-[#1e40af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>Garantia de reembolso de 7 dias</span>
                  </li>
                </ul>
              </div>

              <!-- Trust badge -->
              <div class="flex items-center justify-center gap-1.5 pt-4 border-t border-slate-100 mt-5 text-[0.65rem] text-slate-400 font-medium">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                Pagos seguros y encriptados
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- ═══ BARRA FLOTANTE DE COMPRA ═══ -->
    <Teleport to="body">
      <div class="cip-floating-bar">
        <div class="cip-floating-bar-inner">
          <div class="cip-floating-bar-price">
            <span v-if="hasDiscount" class="cip-floating-bar-discount">
              {{ discountPercent }}% Dto.
            </span>
            <span class="cip-floating-bar-amount">${{ formatPrice(selectedCategory?.precio) }}</span>
            <span class="cip-floating-bar-currency">{{ currencySuffix }}</span>
          </div>
          <button
            @click="handleBuySelected"
            class="cip-floating-bar-btn"
            :class="{
              'cip-floating-bar-btn--premium': tierInfo.isPremium,
              'cip-floating-bar-btn--upsell': selectedOption === 'upsell' && !tierInfo.isPremium,
            }"
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </Teleport>

    <EmergentBuyComponent />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
.cip-root {
  font-family: 'Inter', system-ui, sans-serif;
  color: #0d1b2a;
  background: #f8faff;
  min-height: 100vh;
}

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
.cip-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 30%, #ffffff 65%);
  padding: 2rem 1.25rem 2rem;
}
@media (min-width: 1024px) {
  .cip-hero { padding: 2.5rem 0 2.5rem; }
}

.cip-wave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.cip-wave span {
  position: absolute;
  width: 400vh;
  height: 400vh;
  top: 0;
  left: 50%;
  transform: translate(-50%, -85%);
}
.cip-wave span:nth-child(1) { border-radius: 45%; background: rgba(30, 64, 175, 0.06); animation: cipWave 28s linear infinite; }
.cip-wave span:nth-child(2) { border-radius: 40%; background: rgba(59, 130, 246, 0.04); animation: cipWave 42s linear infinite; }
.cip-wave span:nth-child(3) { border-radius: 42.5%; background: rgba(30, 64, 175, 0.03); animation: cipWave 58s linear infinite; }
@keyframes cipWave {
  from { transform: translate(-50%, -85%) rotate(0deg); }
  to   { transform: translate(-50%, -85%) rotate(360deg); }
}

.cip-affiliate-banner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto 1.5rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 0.75rem;
  font-size: 0.82rem;
  color: #92400e;
  font-weight: 500;
  text-align: center;
}

.cip-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
@media (min-width: 1024px) {
  .cip-hero-inner {
    padding: 0 2.5rem;
    max-width: 1280px;
    margin: 0 auto;
  }
}

.cip-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}
.cip-pill--premium {
  background: linear-gradient(135deg, #f59e0b, #facc15, #f59e0b);
  color: #451a03;
  font-weight: 800;
  font-size: 0.78rem;
  padding: 0.3rem 0.85rem;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.cip-hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 900;
  color: #0d1b2a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 0.6rem;
}

.cip-hero-sub {
  font-size: clamp(0.95rem, 1.6vw, 1.15rem);
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 0.5rem;
  max-width: 600px;
}

.cip-hero-frase {
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  padding-left: 0.75rem;
  border-left: 2px solid rgba(30, 64, 175, 0.2);
}

/* ═══════════════════════════════════════════════════════════
   MAIN CONTENT AREA
═══════════════════════════════════════════════════════════ */
.cip-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem 6rem; /* extra bottom padding for floating bar */
}
@media (min-width: 1024px) {
  .cip-main { padding: 1.5rem 2.5rem 2rem; }
}

.cip-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .cip-grid {
    grid-template-columns: 1fr 380px;
    gap: 2rem;
    align-items: start;
  }
}

.cip-content-col { order: 2; }
.cip-sidebar-col { order: 1; }
@media (min-width: 1024px) {
  .cip-content-col { order: 1; }
  .cip-sidebar-col { order: 2; }
}

/* ═══════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════ */
.cip-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.35rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(30, 64, 175, 0.06);
  border-radius: 0.875rem;
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.04);
  margin-bottom: 1rem;
  position: sticky;
  top: 4rem;
  z-index: 10;
}

.cip-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.625rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cip-tab:hover:not(.cip-tab--active) {
  background: rgba(241, 245, 249, 0.8);
  color: #0d1b2a;
}
.cip-tab--active {
  background: #1e40af;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.25);
}

/* ═══════════════════════════════════════════════════════════
   ACCORDION / CONTENT SECTIONS
═══════════════════════════════════════════════════════════ */
.cip-section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0d1b2a;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}

.cip-accordion {
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.7);
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
  transition: box-shadow 0.2s ease;
}
.cip-accordion:hover {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.cip-accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.cip-accordion-header:hover { background: rgba(248, 250, 252, 0.6); }

.cip-accordion-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0d1b2a;
}

.cip-accordion-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.cip-accordion-body {
  border-top: 1px solid #f1f5f9;
  padding: 1rem 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  background: rgba(248, 250, 252, 0.4);
}

.cip-folder-item {
  margin-bottom: 0.6rem;
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: border-color 0.15s ease;
}
.cip-folder-item:hover { border-color: #e2e8f0; }

.cip-folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: background 0.12s ease;
}
.cip-folder-header:hover { background: rgba(30, 64, 175, 0.02); }

.cip-folder-content {
  border-top: 1px solid #f8fafc;
  background: #fafbfd;
  padding: 0.75rem 1rem;
}

.cip-lesson-item {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e2e8f0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.cip-resource-btn {
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.06);
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.cip-resource-btn:hover { background: rgba(30, 64, 175, 0.12); }

.cip-search-input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  color: #0d1b2a;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}
.cip-search-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.08);
}

.cip-paginator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
}

.cip-paginator-btn {
  padding: 0.4rem;
  border-radius: 999px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cip-paginator-btn:hover:not(:disabled) { background: #f1f5f9; color: #0d1b2a; }
.cip-paginator-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cip-paginator-text {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE & BENEFITS
═══════════════════════════════════════════════════════════ */
.cip-empty-state {
  background: #ffffff;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.cip-benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .cip-benefits-grid { grid-template-columns: 1fr 1fr; }
}

.cip-benefit-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 0.875rem;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
  transition: all 0.2s ease;
}
.cip-benefit-card:hover {
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.cip-benefit-icon {
  padding: 0.65rem;
  border-radius: 0.625rem;
  background: rgba(30, 64, 175, 0.06);
  color: #1e40af;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
.cip-sidebar {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.03);
  transition: box-shadow 0.3s ease;
}
@media (min-width: 1024px) {
  .cip-sidebar {
    position: sticky;
    top: 5rem;
    margin-top: -4rem;
  }
}
.cip-sidebar:hover {
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04);
}
.cip-sidebar--premium {
  border: 2px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.1), 0 4px 24px rgba(245, 158, 11, 0.08);
  animation: sidebarGlow 3s ease-in-out infinite;
}
@keyframes sidebarGlow {
  0%, 100% { box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.1), 0 4px 24px rgba(245, 158, 11, 0.08); }
  50% { box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25), 0 8px 32px rgba(245, 158, 11, 0.14); }
}

.cip-cert-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: #1e40af;
  background: rgba(30, 64, 175, 0.06);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.cip-sidebar-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f1f5f9;
  cursor: pointer;
  overflow: hidden;
}
.cip-sidebar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.cip-sidebar-img-wrap:hover .cip-sidebar-img {
  transform: scale(1.05);
}

.cip-sidebar-img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.cip-sidebar-img-wrap:hover .cip-sidebar-img-overlay {
  background: rgba(0, 0, 0, 0.15);
}

.cip-play-btn {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  border-radius: 999px;
  padding: 0.85rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
}
.cip-sidebar-img-wrap:hover .cip-play-btn {
  transform: scale(1.1);
}

.cip-preview-badge {
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
}

.cip-sidebar-body { padding: 1.25rem; }

.cip-price {
  font-family: 'Poppins', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1;
}

/* ── CTAs ───────────────────────────────────── */
/* ── Upsell option selector ── */
.upsell-option {
  display: block;
  width: 100%;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}
.upsell-option--idle {
  border-color: #e2e8f0;
  background: #ffffff;
}
.upsell-option--idle:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.upsell-option--active {
  border-color: #059669;
  background: #f0fdf4;
  box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.1);
}
.upsell-option--active.upsell-option--upgrade {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.1);
}
.upsell-popular-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #b45309;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  animation: popularPulse 2s ease-in-out infinite;
}
@keyframes popularPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.cip-btn-primary--upsell {
  background: #2563eb;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
}
.cip-btn-primary--upsell:hover {
  background: #1d4ed8;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}

.cip-btn-primary {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 0.75rem;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  background: #059669;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.2);
  transition: all 0.2s ease;
}
.cip-btn-primary:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
}
.cip-btn-primary--premium {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 50%, #f59e0b 100%);
  background-size: 200% 200%;
  color: #451a03;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
  animation: ctaPremiumGrad 3s ease infinite;
}
.cip-btn-primary--premium:hover {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
}
@keyframes ctaPremiumGrad {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.cip-btn-secondary {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid #1e40af;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e40af;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cip-btn-secondary:hover {
  background: rgba(30, 64, 175, 0.04);
  border-color: #1e3a8a;
}

/* ── Includes list ──────────────────────────── */
.cip-includes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.cip-include-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: #475569;
}

/* ═══════════════════════════════════════════════════════════
   SCROLLBAR
═══════════════════════════════════════════════════════════ */
.cip-accordion-body::-webkit-scrollbar { width: 4px; }
.cip-accordion-body::-webkit-scrollbar-track { background: transparent; }
.cip-accordion-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
.cip-accordion-body::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .cip-tabs { position: sticky; top: 7rem; }
  .cip-metric-divider { display: none; }
  .cip-hero-metrics { gap: 0.6rem; }
}

/* ═══════════════════════════════════════════════════════════
   FLOATING BUY BAR
═══════════════════════════════════════════════════════════ */
.cip-floating-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 1024px) {
  .cip-floating-bar { display: none; }
}

.cip-floating-bar-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cip-floating-bar-price {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-shrink: 0;
}

.cip-floating-bar-discount {
  font-size: 0.65rem;
  font-weight: 700;
  color: #dc2626;
  background: #fef2f2;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  align-self: center;
}

.cip-floating-bar-amount {
  font-family: 'Poppins', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1;
}

.cip-floating-bar-currency {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.cip-floating-bar-btn {
  flex: 1;
  max-width: 280px;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  background: #059669;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.cip-floating-bar-btn:active {
  transform: scale(0.97);
}
.cip-floating-bar-btn--premium {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 50%, #f59e0b 100%);
  background-size: 200% 200%;
  color: #451a03;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
  animation: ctaPremiumGrad 3s ease infinite;
}
.cip-floating-bar-btn--upsell {
  background: #2563eb;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}
</style>
