<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { categoryStore } from '../store/CategoryStore';
import CategoryService from '../services/CategorieService';
import FooterComponent from '../components/footer/footer.component.vue';
import { authStore } from '../store/AuthStore';
import EmergentBuyComponent from './emergent.buy.component.vue';
import { emergentBuyStore } from '../store/EmergentBuyStore';
import { cartStore } from '../store/CartStore';
import type { ICategory } from '../types/Categorie';
import CourseFilterBar from './CourseFilterBar.vue';
import CourseCard from './CourseCard.vue';
import type { PillarColor } from './CourseCard.vue';
import {
  classifyCategoryId,
  getCategoryBorderClass,
  getCategoryGlowClass,
  COMBOS,
  TODA_LA_TIENDA_ID,
  type FilterType,
} from './courseFilterData';

const storeemergentBuy = emergentBuyStore();
const categorStore = categoryStore();
const storeAuth = authStore();
const cartSt = cartStore();
const router = useRouter();

const pageSize = 6;
const currentOffset = ref(0);
const hasMoreCategories = ref(true);
const isLoadingMore = ref(false);
const categories = ref<ICategory[]>([]);

const loadMoreCategories = async () => {
  if (!hasMoreCategories.value || isLoadingMore.value) {
    return;
  }

  isLoadingMore.value = true;

  const batch = await CategoryService.getAllCategories(pageSize, currentOffset.value);
  const list = batch as ICategory[];

  if (list.length < pageSize) {
    hasMoreCategories.value = false;
  }

  currentOffset.value += list.length;

  const unboughtList = list.filter((item) => !item.user_bought);

  categories.value = [...categories.value, ...unboughtList];
  categorStore.setCategories(categories.value);

  isLoadingMore.value = false;
};

const handleScroll = () => {
  if (!hasMoreCategories.value || isLoadingMore.value) return;
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
  if (nearBottom) {
    void loadMoreCategories();
  }
};

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

const activeFilterType = ref<FilterType>('all');

const isCardHighlighted = (id: number): boolean => {
  if (activeFilterType.value === 'all') return false;
  return classifyCategoryId(id) === activeFilterType.value;
};

const getCardClasses = (id: number): string => {
  const border = getCategoryBorderClass(id);
  const highlighted = isCardHighlighted(id);
  const glow = highlighted ? getCategoryGlowClass(id) : '';
  return `${border} ${glow}`;
};

const loadAllCategories = async () => {
  while (hasMoreCategories.value) {
    await loadMoreCategories();
  }
};

const handleReorder = async (filterType: FilterType) => {
  activeFilterType.value = filterType;
  await loadAllCategories();
  if (filterType === 'all') {
    categories.value = [...categories.value].sort((a, b) => b.id - a.id);
  } else {
    const matching = categories.value.filter((c) => classifyCategoryId(c.id) === filterType);
    const rest = categories.value.filter((c) => classifyCategoryId(c.id) !== filterType);
    categories.value = [...matching, ...rest];
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resolvePillarColor = (id: number): PillarColor => {
  if (id === TODA_LA_TIENDA_ID) return 'amber';
  if ([100200, 100300, 200300].includes(id)) return 'purple';
  if (id === 100 || (id >= 101 && id <= 107)) return 'blue';
  if (id === 200 || (id >= 201 && id <= 207)) return 'emerald';
  if (id === 300 || (id >= 301 && id <= 309)) return 'orange';
  return 'blue';
};

const resolvePillarLabel = (id: number): string => {
  if (id === TODA_LA_TIENDA_ID) return '🏆 Toda la Tienda';
  const combo = COMBOS.find((c) => c.id === id);
  if (combo) return '📦 ' + combo.shortName;
  if (id === 100 || (id >= 101 && id <= 107)) return '💼 Negocios Digitales';
  if (id === 200 || (id >= 201 && id <= 207)) return '💻 Tecnología';
  if (id === 300 || (id >= 301 && id <= 309)) return '🎨 Academia Creativa';
  return '';
};

const resolveTypeLabel = (id: number): string => {
  const type = classifyCategoryId(id);
  const map: Record<FilterType, string> = {
    temas: '📌 Tema Individual',
    pilares: '📦 Paquete Completo',
    combos: '🔗 Combo',
    'toda-la-tienda': '🏆 Premium',
    all: '',
  };
  return map[type] ?? '';
};

const handleBuy = (item: ICategory) => {
  storeemergentBuy.handleEmergentBuy();
  storeemergentBuy.setCategoryEmergent(item);
};

const handleScrollTo = async (categoryId: number) => {
  await loadAllCategories();
  await nextTick();
  const el = document.getElementById('category-card-' + categoryId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-blue-400');
    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 2000);
  }
};

onMounted(async () => {
  categories.value = [];
  currentOffset.value = 0;
  hasMoreCategories.value = true;
  await loadMoreCategories();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div>
    <CourseFilterBar
      :categories="categories"
      @reorder="handleReorder"
      @scroll-to="handleScrollTo"
    />
    <div
      v-if="storeAuth.nameAffiliaty"
      class="text-[10px] mt-1 pl-2 font-semibold"
    >
      Comprar con el descuento de {{ storeAuth.nameAffiliaty }}
    </div>
    <TransitionGroup
      name="card-move"
      tag="div"
      class="md:grid md:grid-cols-2 lg:grid-cols-3 md:px-12 md:gap-4"
    >
      <CourseCard
        v-for="item in categories"
        :key="item.id"
        :id="'category-card-' + item.id"
        :category="item"
        :pillar-color="resolvePillarColor(item.id)"
        :pillar-label="resolvePillarLabel(item.id)"
        :type-label="resolveTypeLabel(item.id)"
        :has-resale="false"
        :currency-suffix="storeAuth.getProfile()?.user?.country === 'COP' ? ' COP' : ' USD'"
        :is-blurred="storeemergentBuy.emergentBuy.emergent"
        :is-premium="item.id === TODA_LA_TIENDA_ID"
        :card-classes="getCardClasses(item.id)"
        @click="handleClickCourseItem"
        @add-to-cart="addCarCategory"
        @buy="handleBuy"
        @preview="() => {}"
      />
    </TransitionGroup>
    <div v-if="isLoadingMore" class="text-center text-sm text-gray-600 mt-4">
      Búsqueda cargado para ti
    </div>
    <br />
    <EmergentBuyComponent />
    <FooterComponent />
  </div>
</template>

<style scoped>
.card-move-move {
  transition: transform 0.5s ease;
}
.card-move-enter-active,
.card-move-leave-active {
  transition: all 0.3s ease;
}
.card-move-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.card-move-leave-to {
  opacity: 0;
}
</style>
