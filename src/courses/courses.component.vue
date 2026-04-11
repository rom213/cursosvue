<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';
import { authStore } from '../store/AuthStore';
import EmergentBuyComponent from './emergent.buy.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import { cartStore } from '../store/CartStore';
import type { ICategory } from '../types/Categorie';
import CourseCard from './CourseCard.vue';
import type { PillarColor } from './CourseCard.vue';
import CourseFilterBar from './CourseFilterBar.vue';
import {
  classifyCategoryId,
  getPilarForThemeId,
  getUpsellTargetId,
  PILARES,
  COMBOS,
  TODA_LA_TIENDA_ID,
} from './courseFilterData';
import type { FilterType, PilarKey } from './courseFilterData';
import { OptionsEmergentBuy } from '../types/Payment';
import { usePromoQuery } from '../composables/usePromoQuery';
import SkeletonLoaderComponent from '../components/common/skeleton-loader.component.vue';

const storeemergentBuy = emergentBuyStore();
const categorStore = categoryStore();
const storeAuth = authStore();
const cartSt = cartStore();
const router = useRouter();

// ── Promo desde redes sociales ──
const { promoName, promoType } = usePromoQuery();
const searchTerm = ref(promoType.value === 'curso' ? (promoName.value ?? '') : '');

// ── Carga de categorías ──
const isLoading = ref(false);
const categories = ref<ICategory[]>([]);
const activeFilter = ref<FilterType>('all');

const UPSELL_POOL_IDS = new Set<number>([
  ...PILARES.map((p) => p.pilarId),
  TODA_LA_TIENDA_ID,
]);

// ── Upsell: pilares + toda-la-tienda (se rellenan desde la respuesta con filtro "all") ──
const upsellPool = ref<Map<number, ICategory>>(new Map());

const loadCategories = async () => {
  isLoading.value = true;
  const list = await CategoryService.getAllCategories(100, 0, activeFilter.value) as ICategory[];
  const unboughtList = list.filter((item) => !item.user_bought);
  categories.value = unboughtList;
  categorStore.setCategories(categories.value);
  if (activeFilter.value === 'all') {
    const pool = new Map<number, ICategory>();
    for (const c of unboughtList) {
      if (UPSELL_POOL_IDS.has(c.id)) pool.set(c.id, c);
    }
    upsellPool.value = pool;
  }
  isLoading.value = false;
};

// ── Mapeo pilar → color ──
const PILAR_TO_COLOR: Record<PilarKey, PillarColor> = {
  negocios: 'blue',
  tecnologia: 'emerald',
  creativa: 'orange',
};

const PILAR_EMOJI: Record<PilarKey, string> = {
  negocios: '💼',
  tecnologia: '💻',
  creativa: '🎨',
};

// ── Definicion de secciones ──
interface CatalogSection {
  id: string
  filterType: FilterType
  title: string
  description: string
  accentColor: string
  label?: string
  categories: ICategory[]
}

const SECTION_ORDER = [
  'bloques-negocios',
  'bloques-tecnologia',
  'bloques-creativa',
  'pilares',
  'combos',
  'toda-la-tienda',
] as const;

const SECTION_META: Record<string, { title: string; description: string; filterType: FilterType; accentColor: string; label?: string }> = {
  'bloques-negocios': {
    title: 'Negocios Digitales y Exito Profesional',
    description: 'Domina las finanzas, marketing digital, ventas y gestion empresarial. Ideal para emprendedores y profesionales.',
    filterType: 'bloques',
    accentColor: 'bg-blue-500',
  },
  'bloques-tecnologia': {
    title: 'Tecnologia, Codigo e Ingenieria',
    description: 'Programacion, inteligencia artificial, ciberseguridad y desarrollo web. El futuro es tech.',
    filterType: 'bloques',
    accentColor: 'bg-emerald-500',
  },
  'bloques-creativa': {
    title: 'Academia Creativa y Bienestar Integral',
    description: 'Diseno grafico, fotografia, musica, gastronomia y desarrollo personal. Explora tu lado creativo.',
    filterType: 'bloques',
    accentColor: 'bg-orange-500',
  },
  'pilares': {
    title: 'Pilares Principales',
    description: 'Domina un area completa de conocimiento. Ideal para especializarte y comenzar a monetizar.',
    filterType: 'pilares',
    accentColor: 'section-accent-pilares',
  },
  'combos': {
    title: 'Combinaciones de 2 Pilares',
    description: 'Une dos pilares y multiplica tu perfil profesional. Maximo valor por tu inversion.',
    filterType: 'combos',
    accentColor: 'bg-purple-500',
  },
  'toda-la-tienda': {
    title: 'Toda la Tienda 2026',
    description: 'El pack definitivo. Todo el conocimiento, una sola compra. Acceso vitalicio a los 3 pilares.',
    filterType: 'toda-la-tienda',
    accentColor: 'section-accent-premium',
    label: 'Recomendado',
  },
};

// ── Agrupar categorias en secciones ──
const buildSections = (cats: ICategory[]): CatalogSection[] => {
  const buckets: Record<string, ICategory[]> = {};
  for (const key of SECTION_ORDER) buckets[key] = [];

  for (const cat of cats) {
    const type = classifyCategoryId(cat.id);

    if (type === 'bloques') {
      const pilar = getPilarForThemeId(cat.id);
      if (pilar) buckets[`bloques-${pilar}`].push(cat);
    } else if (type === 'pilares') {
      buckets['pilares'].push(cat);
    } else if (type === 'combos') {
      buckets['combos'].push(cat);
    } else if (type === 'toda-la-tienda') {
      buckets['toda-la-tienda'].push(cat);
    }
  }

  return SECTION_ORDER
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      id: key,
      filterType: SECTION_META[key].filterType,
      title: SECTION_META[key].title,
      description: SECTION_META[key].description,
      accentColor: SECTION_META[key].accentColor,
      label: SECTION_META[key].label,
      categories: buckets[key],
    }));
};

// ── Filtrado por búsqueda ──
const displayedCategories = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return categories.value;
  return categories.value.filter(cat =>
    cat.titulo?.toLowerCase().includes(term) ||
    cat.pack_nombre?.toLowerCase().includes(term)
  );
});

const visibleSections = computed(() => buildSections(displayedCategories.value));

// ── Derivar props de card desde ID ──
function getCardProps(category: ICategory) {
  const filterType = classifyCategoryId(category.id);
  let pillarColor: PillarColor = 'blue';
  let pillarLabel = '';
  let typeLabel = '';
  let includesResale = false;
  let includesDiscount = false;
  let isPremium = false;

  if (filterType === 'bloques') {
    // Bloques individuales: tarjeta limpia, sin beneficios extra
    const pilarKey = getPilarForThemeId(category.id);
    if (pilarKey) {
      const pilar = PILARES.find((p) => p.key === pilarKey);
      pillarColor = PILAR_TO_COLOR[pilarKey];
      pillarLabel = `${PILAR_EMOJI[pilarKey]} ${pilar?.shortLabel ?? ''}`;
    }
    typeLabel = '📌 Bloque Individual';
  } else if (filterType === 'pilares') {
    // Pilares: reventa + 70% dto.
    const pilar = PILARES.find((p) => p.pilarId === category.id);
    if (pilar) {
      pillarColor = PILAR_TO_COLOR[pilar.key];
      pillarLabel = `${PILAR_EMOJI[pilar.key]} ${pilar.shortLabel}`;
    }
    typeLabel = '🏛️ Pilar Principal';
    includesResale = true;
    includesDiscount = true;
  } else if (filterType === 'combos') {
    // Combos: reventa + 70% dto.
    pillarColor = 'purple';
    const combo = COMBOS.find((c) => c.id === category.id);
    pillarLabel = `⚡ ${combo?.name ?? 'Combinacion'}`;
    typeLabel = '🔗 Combo de 2 Pilares';
    includesResale = true;
    includesDiscount = true;
  } else if (filterType === 'toda-la-tienda') {
    // Premium: reventa + 70% dto. + mejor valor
    pillarColor = 'amber';
    pillarLabel = '👑 Toda la Tienda 2026';
    typeLabel = '🏆 Pack Completo';
    includesResale = true;
    includesDiscount = true;
    isPremium = true;
  }

  return { pillarColor, pillarLabel, typeLabel, includesResale, includesDiscount, isPremium };
}

// ── Currency suffix ──
const currencySuffix = computed(() =>
  storeAuth.getProfile()?.user?.country === 'CO' ? ' COP' : ' USD'
);

// ── Event handlers ──
const addCarCategory = (item: ICategory) => {
  if (storeAuth.getProfile() == null) {
    router.push('/login');
    return;
  }
  if (cartSt.validateCart(item)) {
    cartSt.setCart(item);
  }
};

const handleClickCourseItem = (id: number) => {
  router.push({ name: 'courses-description', params: { id } });
};

const handleBuy = (item: ICategory) => {
  if (storeAuth.getProfile() == null) {
    router.push('/login');
    return;
  }
  storeemergentBuy.esVentaTercero=false 
  storeemergentBuy.handleChangeOptionsEmergentBuy(OptionsEmergentBuy.UserInternal)
  storeemergentBuy.handleEmergentBuy();
  storeemergentBuy.setCategoryEmergent(item);
};

const getUpsellCategory = (category: ICategory): ICategory | null => {
  const targetId = getUpsellTargetId(category.id);
  if (!targetId) return null;
  return categories.value.find((c) => c.id === targetId) ?? upsellPool.value.get(targetId) ?? null;
};

const handleUpsellBuy = (item: ICategory) => {
  handleBuy(item);
};

const handleUpsellExplore = (id: number) => {
  handleClickCourseItem(id);
};

const handleReorder = async (filterType: FilterType) => {
  activeFilter.value = filterType;
  await loadCategories();
};

const handleScrollTo = (categoryId: number) => {
  const el = document.getElementById('card-' + categoryId)
    ?? document.getElementById('section-' + categoryId);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── Lifecycle ──
onMounted(async () => {
  await loadCategories();
});
</script>

<template>
  <div class="bg-[#f8faff] min-h-screen">

    <!-- Banner de afiliado -->
    <div
      v-if="storeAuth.nameAffiliaty"
      class="bg-blue-50 border border-blue-100 rounded-lg mx-4 md:mx-8 mt-2 px-4 py-2 text-sm text-blue-700 font-medium flex items-center gap-2"
    >
      <span class="text-blue-400">🎟️</span>
      Comprar con el descuento de <strong>{{ storeAuth.nameAffiliaty }}</strong>
    </div>

    <!-- Barra de filtros sticky -->
    <CourseFilterBar
      :categories="categories"
      @reorder="handleReorder"
      @scroll-to="handleScrollTo"
    />

    <!-- Catalogo seccionado -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-10 pb-8">
      <template v-for="(section, idx) in visibleSections" :key="section.id">

        <!-- Separador entre secciones -->
        <div
          v-if="idx > 0"
          class="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-auto max-w-md mb-16"
        />

        <section :id="'section-' + section.id" class="mb-16">
          <!-- Encabezado de seccion -->
          <div class="mb-8">
            <!-- Label especial (ej. "Recomendado" para toda-la-tienda) -->
            <span
              v-if="section.label"
              class="inline-block text-[0.65rem] font-bold tracking-[0.12em] uppercase text-amber-600 bg-amber-50 border border-amber-200/50 rounded-full px-3 py-0.5 mb-3"
            >
              ✦ {{ section.label }}
            </span>

            <!-- Titulo con barra de acento -->
            <div class="flex items-center gap-3 mb-2">
              <div class="w-1 h-8 rounded-full shrink-0" :class="section.accentColor" />
              <h2 class="font-[Poppins] text-2xl md:text-3xl font-bold text-[#0d1b2a] tracking-tight">
                {{ section.title }}
              </h2>
            </div>
            <p class="text-sm text-slate-500 mt-1.5 max-w-2xl ml-4">
              {{ section.description }}
            </p>
          </div>

          <!-- Grid de cards: max 3 columnas -->
          <TransitionGroup
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8"
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <CourseCard
              v-for="cat in section.categories"
              :key="cat.id"
              :id="'card-' + cat.id"
              :category="cat"
              v-bind="getCardProps(cat)"
              :currency-suffix="currencySuffix"
              :is-blurred="storeemergentBuy.emergentBuy.emergent"
              :upsell-category="getUpsellCategory(cat)"
              @click="handleClickCourseItem"
              @add-to-cart="addCarCategory"
              @buy="handleBuy"
              @upsell-buy="handleUpsellBuy"
              @upsell-explore="handleUpsellExplore"
            />
          </TransitionGroup>
        </section>
      </template>

      <!-- Estado vacio -->
      <div
        v-if="!isLoading && categories.length === 0"
        class="text-center py-20"
      >
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="font-[Poppins] text-xl font-semibold text-[#0d1b2a]">
          {{ searchTerm ? 'Sin resultados para "' + searchTerm + '"' : 'No hay cursos disponibles' }}
        </p>
        <p class="text-sm text-slate-400 mt-1">
          {{ searchTerm ? 'Prueba con otro termino o limpia el buscador.' : 'Intenta con otro filtro o vuelve mas tarde.' }}
        </p>
      </div>
    </div>

    <!-- Skeleton Loader while loading -->
    <template v-if="isLoading">
      <div class="px-4 md:px-8">
        <SkeletonLoaderComponent type="card" :count="6" />
      </div>
    </template>

    <EmergentBuyComponent />
    <FooterComponent />
  </div>
</template>

<style>
/* ── Section accent gradients (no se pueden expresar con clases Tailwind puras) ── */
.section-accent-pilares {
  background: linear-gradient(180deg, #3b82f6 0%, #10b981 50%, #f97316 100%);
}
.section-accent-premium {
  background: linear-gradient(180deg, #f59e0b 0%, #facc15 100%);
}
</style>
