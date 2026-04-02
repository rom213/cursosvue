<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ICategory } from '../types/Categorie';
import { courseIcons } from './courseIcons';
import { classifyCategoryId } from './courseFilterData';
import AffiliatyMessageComponent from '../components/auth/affiliaty.message.component.vue';

export type PillarColor = 'blue' | 'emerald' | 'orange' | 'purple' | 'amber'

interface CourseCardProps {
  category: ICategory
  pillarColor: PillarColor
  pillarLabel: string
  typeLabel?: string
  includesResale?: boolean
  includesDiscount?: boolean
  currencySuffix?: string
  isBlurred?: boolean
  isPremium?: boolean
  cardClasses?: string
  upsellCategory?: ICategory | null
}

const props = withDefaults(defineProps<CourseCardProps>(), {
  typeLabel: '',
  includesResale: false,
  includesDiscount: false,
  currencySuffix: ' USD',
  isBlurred: false,
  isPremium: false,
  cardClasses: '',
  upsellCategory: null,
});

const emit = defineEmits<{
  (e: 'click', id: number): void
  (e: 'add-to-cart', category: ICategory): void
  (e: 'buy', category: ICategory): void
  (e: 'preview', category: ICategory): void
  (e: 'upsell-buy', category: ICategory): void
  (e: 'upsell-explore', id: number): void
}>();

// ── Upsell state ──

// ── Tier level para renderizado condicional ──
const tierLevel = computed(() => {
  if (props.isPremium) return 'premium'
  if (props.includesResale) return 'advanced'
  return 'basic'
});

// ── Color system ──
const COLOR_MAP: Record<PillarColor, {
  borderTop: string
  pillBg: string
  pillText: string
  iconBg: string
  iconText: string
  cardRing: string
  progressBar: string
}> = {
  blue:    { borderTop: 'border-t-blue-500',    pillBg: 'bg-blue-100',    pillText: 'text-blue-700',    iconBg: 'bg-blue-50',    iconText: 'text-blue-500',    cardRing: 'ring-blue-100',    progressBar: 'bg-blue-500' },
  emerald: { borderTop: 'border-t-emerald-500', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', cardRing: 'ring-emerald-100', progressBar: 'bg-emerald-500' },
  orange:  { borderTop: 'border-t-orange-500',  pillBg: 'bg-orange-100',  pillText: 'text-orange-700',  iconBg: 'bg-orange-50',  iconText: 'text-orange-500',  cardRing: 'ring-orange-100',  progressBar: 'bg-orange-500' },
  purple:  { borderTop: 'border-t-purple-500',  pillBg: 'bg-purple-100',  pillText: 'text-purple-700',  iconBg: 'bg-purple-50',  iconText: 'text-purple-500',  cardRing: 'ring-purple-100',  progressBar: 'bg-purple-500' },
  amber:   { borderTop: 'border-t-amber-500',   pillBg: 'bg-amber-100',   pillText: 'text-amber-700',   iconBg: 'bg-amber-50',   iconText: 'text-amber-500',   cardRing: 'ring-amber-100',   progressBar: 'bg-amber-500' },
};

const colors = computed(() => COLOR_MAP[props.pillarColor]);

// ── Card wrapper classes por tier ──
const cardWrapperClasses = computed(() => {
  const base = 'group overflow-hidden flex flex-col h-full transition-all duration-300'
  if (tierLevel.value === 'premium') {
    return `${base} bg-gradient-to-b from-amber-50/40 to-white rounded-2xl shadow-xl border-2 border-amber-200/60 toda-tienda-card hover:-translate-y-3 hover:shadow-2xl`
  }
  if (tierLevel.value === 'advanced') {
    return `${base} bg-white rounded-2xl shadow-lg shadow-slate-200/60 border-t-4 ${colors.value.borderTop} ring-1 ring-inset ${colors.value.cardRing} hover:-translate-y-2 hover:shadow-xl`
  }
  return `${base} bg-white rounded-2xl shadow-md shadow-slate-200/40 border border-slate-100/80 hover:-translate-y-1 hover:shadow-lg`
});

// ── Metricas ──
const themesCount = computed(() => props.category.seccion_temas?.cantidad_temas ?? 0);
const cursosCount = computed(() => props.category.cantidad_cursos ?? 122);
const cuposCount = computed(() => props.category.num_per ?? 23);
const cuposMax = 200;
const cuposPercent = computed(() => Math.min(100, Math.round((cuposCount.value / cuposMax) * 100)));
const isLowStock = computed(() => cuposCount.value < 30);
const commentsCount = computed(() => props.category.pregunta_respuesta?.length ?? 0);

// ── Anclaje de precio ──
const hasDiscount = computed(() =>
  props.category.precio_desc != null
  && props.category.precio_desc > 0
  && props.category.precio_desc !== props.category.precio
);
const discountPercent = computed(() => {
  if (!hasDiscount.value || !props.category.precio) return 0;
  return Math.round(
    ((props.category.precio_desc - (props.category.precio ?? 0)) / props.category.precio_desc) * 100
  );
});

const formatPrice = (price: number | undefined) => {
  if (price == null) return '0';
  return price.toLocaleString();
};

const ctaBuyClasses = computed(() => {
  if (selectedOption.value === 'upsell') {
    return props.isPremium
      ? 'cta-premium py-3.5 px-4 text-lg shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-1'
      : 'bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5'
  }
  if (tierLevel.value === 'premium')
    return 'cta-premium py-3.5 px-4 text-lg shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-1'
  if (tierLevel.value === 'advanced')
    return 'bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5'
  return 'bg-slate-700 hover:bg-slate-800 text-white py-2.5 px-4 text-sm shadow-md shadow-slate-700/15 hover:shadow-lg hover:-translate-y-0.5'
});

const ctaCartClasses = computed(() => {
  if (tierLevel.value === 'premium')
    return 'bg-amber-500/15 border border-amber-400/40 text-amber-900 hover:bg-amber-500/25 py-3.5 px-3 text-lg shadow-md shadow-amber-500/15 hover:-translate-y-0.5'
  if (tierLevel.value === 'advanced')
    return 'bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-3 text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5'
  return 'bg-slate-700 hover:bg-slate-800 text-white py-2.5 px-3 text-sm shadow-md shadow-slate-700/15 hover:shadow-lg hover:-translate-y-0.5'
});

// ── Upsell helpers ──
const selectedOption = ref<'current' | 'upsell'>('current');
const showUpsellDetails = ref(false);
const showBlocksList = ref(false);

const upsellBreakdown = computed(() => {
  const blocks = props.upsellCategory?.cat_rel_info ?? [];
  const total = props.upsellCategory?.precio ?? 0;
  const pricePerBlock = blocks.length > 0 ? Math.round(total / blocks.length) : 0;
  return { blocks, pricePerBlock };
});

const upsellTierLabel = computed(() => {
  if (!props.upsellCategory) return '';
  const type = classifyCategoryId(props.upsellCategory.id);
  if (type === 'pilares') return '🏛️ Pilar';
  if (type === 'toda-la-tienda') return '👑 Tienda';
  return '';
});

const upsellBenefits = computed(() => {
  if (!props.upsellCategory) return [];
  const type = classifyCategoryId(props.upsellCategory.id);
  if (type === 'pilares') {
    return ['Todos los bloques del pilar', 'Incluye reventa', '70% Dto.'];
  }
  if (type === 'toda-la-tienda') {
    return ['Los 3 pilares completos', 'Incluye reventa', 'Máximo valor'];
  }
  return [];
});
</script>

<template>
  <div :class="{ 'blur-[2px]': isBlurred }">
    <div :class="[cardWrapperClasses, cardClasses]" class="relative">

      <!-- ══ 1. ZONA DE ETIQUETAS ══ -->
      <div
        class="flex flex-wrap p-5 pb-0"
        :class="tierLevel === 'basic' ? 'gap-1.5' : 'gap-2'"
      >
        <!-- Pilar (siempre) -->
        <span
          class="inline-flex items-center rounded-full font-semibold"
          :class="[
            colors.pillBg, colors.pillText,
            tierLevel === 'basic' ? 'text-[0.65rem] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          ]"
        >
          {{ pillarLabel }}
        </span>

        <!-- Tipo (siempre) -->
        <span
          v-if="typeLabel"
          class="inline-flex items-center rounded-full font-semibold bg-slate-100 text-slate-600"
          :class="tierLevel === 'basic' ? 'text-[0.65rem] px-2 py-0.5' : 'text-xs px-2.5 py-1'"
        >
          {{ typeLabel }}
        </span>

        <!-- 👑 Mejor Valor (solo premium) -->
        <span
          v-if="isPremium"
          class="mejor-valor-pill inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50"
        >
          👑 Mejor Valor
        </span>

        <!-- 🤝 Incluye Reventa (advanced+) -->
        <span
          v-if="includesResale"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
        >
          🤝 Incluye Reventa
        </span>

        <!-- 🎟️ 70% Dto. (advanced+) -->
        <span
          v-if="includesDiscount"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
        >
          🎟️ 70% Dto. en toda la tienda
        </span>
      </div>

      <!-- ══ 2. IMAGEN 16:9 ══ -->
      <div class="px-5 pt-4">
        <div
          class="relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer transition-all"
          :class="tierLevel !== 'basic' ? 'group-hover:ring-2 ring-offset-2 ring-slate-300/50' : ''"
          @click="emit('click', category.id)"
        >
          <img
            v-if="category.imagen_url"
            class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            :src="category.imagen_url"
            :alt="category.titulo || 'Curso'"
            loading="lazy"
            width="400"
            height="225"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-slate-300"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>

          <!-- Overlay degradado (advanced+) -->
          <div
            v-if="tierLevel !== 'basic'"
            class="absolute inset-0 bg-gradient-to-t from-black/8 to-transparent pointer-events-none"
          />

          <!-- Badge MEJOR VALOR sobre imagen (premium) -->
          <span
            v-if="isPremium"
            class="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-amber-300/40"
          >
            ★ Mejor Valor
          </span>
        </div>
      </div>

      <!-- ══ 3. TITULO + SUBTITULO ══ -->
      <div class="px-5 pt-4">
        <h3
          class="text-[#0d1b2a] line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          :class="{
            'text-base font-semibold': tierLevel === 'basic',
            'text-lg font-bold': tierLevel === 'advanced',
            'text-xl font-extrabold': tierLevel === 'premium',
          }"
          :title="category.titulo"
          @click="emit('click', category.id)"
        >
          {{ category.titulo }}
        </h3>
        <p
          v-if="category.frase_1"
          class="text-slate-500 mt-1"
          :class="tierLevel === 'basic' ? 'text-xs' : 'text-sm'"
        >
          {{ category.frase_1 }}
        </p>
      </div>

      <!-- ══ 4. FRASE TRANSFORMACIONAL ══ -->
      <p
        v-if="category.frase_2"
        class="mx-5 text-slate-400 italic mt-2 mb-1"
        :class="{
          'text-xs': tierLevel === 'basic',
          'text-sm border-l-2 pl-3': tierLevel === 'advanced',
          'text-sm border-l-2 border-amber-300 pl-3': tierLevel === 'premium',
        }"
        :style="tierLevel === 'advanced' ? `border-color: var(--accent-border)` : ''"
      >
        "{{ category.frase_2 }}"
      </p>

      <!-- ══ 5. METRICAS DE VALOR ══ -->
      <div class="px-5 pt-3 space-y-2.5">

        <!-- Volumen: temas + cursos (siempre) -->
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
            <div class="w-5 h-5" v-html="courseIcons.cursos" />
          </div>
          <span class="text-sm text-slate-700">
            <strong class="text-slate-900">{{ themesCount || 1 }}</strong> Tema{{ themesCount > 1 ? 's' : '' }}
            <span class="text-slate-400 mx-0.5">&middot;</span>
            <strong class="text-slate-900">{{ cursosCount.toLocaleString() }}</strong> cursos
          </span>
        </div>

        <!-- Cupos con barra de progreso (advanced+) -->
        <div v-if="tierLevel !== 'basic'" class="flex flex-col gap-1">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
              <div class="w-5 h-5" v-html="courseIcons.cupos" />
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm text-slate-500">Cupos:</span>
              <span
                class="text-base font-bold"
                :class="isLowStock ? 'text-red-600' : 'text-slate-900'"
              >
                {{ cuposCount }}
              </span>
              <span class="text-xs text-slate-400 font-medium">/ {{ cuposMax }}</span>
              <span v-if="isLowStock" class="cupos-pulse-dot ml-1 w-2 h-2 rounded-full bg-red-500 inline-block" />
            </div>
          </div>
          <!-- Barra de progreso -->
          <div class="ml-10 w-auto h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="isLowStock ? 'bg-red-500' : colors.progressBar"
              :style="{ width: `${cuposPercent}%` }"
            />
          </div>
        </div>

        <!-- Cupos simplificado (basic) -->
        <div v-else class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
            <div class="w-5 h-5" v-html="courseIcons.cupos" />
          </div>
          <span class="text-sm text-slate-700">
            Cupos: <strong :class="isLowStock ? 'text-red-600' : 'text-slate-900'">{{ cuposCount }}</strong>
            <span class="text-xs text-slate-400">/ {{ cuposMax }}</span>
          </span>
        </div>

        <!-- Comentarios (advanced+ y si > 0) -->
        <div v-if="commentsCount > 0 && tierLevel !== 'basic'" class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
            <div class="w-5 h-5" v-html="courseIcons.comments" />
          </div>
          <span class="text-sm text-slate-700">
            <strong class="text-slate-900">{{ commentsCount }}</strong> Comentarios
          </span>
        </div>

        <!-- Certificacion (siempre) -->
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
            <div class="w-5 h-5" v-html="courseIcons.certification" />
          </div>
          <span class="text-sm font-medium text-slate-600">Certificación incluida</span>
        </div>

        <!-- Bonus premium: acceso 3 pilares -->
        <div
          v-if="tierLevel === 'premium'"
          class="flex items-center gap-2.5 bg-amber-50/80 rounded-lg p-2.5 ring-1 ring-inset ring-amber-200/50"
        >
          <span class="text-base">⭐</span>
          <span class="text-sm font-semibold text-amber-800">Acceso a los 3 pilares completos</span>
        </div>
      </div>

      <!-- ══ 6. CTAs ══ -->
      <div class="p-5 pt-4 mt-auto space-y-2.5">

        <!-- Vista previa en Drive -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2.5 rounded-xl border transition-all font-medium"
          :class="tierLevel === 'basic'
            ? 'py-2 px-3 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            : 'py-2.5 px-4 text-sm border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'"
          @click="emit('preview', category)"
        >
          <div class="w-5 h-5 shrink-0" v-html="courseIcons.preview" />
          <span>Vista previa en Drive</span>
        </button>

        <!-- Anclaje de precio con descuento -->
        <div v-if="hasDiscount" class="flex items-center justify-center gap-2 text-sm">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
            {{ discountPercent }}% Dto.
          </span>
          <span class="line-through text-slate-400 font-medium">
            ${{ formatPrice(category.precio_desc) }}{{ currencySuffix }}
          </span>
        </div>

        <!-- ── Opcion actual (siempre) ── -->
        <label
          class="card-option flex items-center gap-2.5 rounded-xl px-3 py-2 cursor-pointer border-2 transition-all"
          :class="selectedOption === 'current'
            ? 'border-emerald-400 bg-emerald-50/50'
            : 'border-slate-200 bg-white hover:border-slate-300'"
        >
          <input type="radio" v-model="selectedOption" value="current" class="sr-only" />
          <div
            class="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
            :class="selectedOption === 'current' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'"
          >
            <div v-if="selectedOption === 'current'" class="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span class="flex-1 text-xs font-semibold text-[#0d1b2a] truncate">Este paquete</span>
          <span class="text-sm font-extrabold text-[#0d1b2a] whitespace-nowrap">
            ${{ formatPrice(category.precio) }}
          </span>
        </label>

        <!-- ── Opcion upsell (si hay) ── -->
        <div v-if="upsellCategory && !isPremium">
          <label
            class="card-option flex flex-col rounded-xl px-3 py-2 cursor-pointer border-2 transition-all"
            :class="selectedOption === 'upsell'
              ? 'border-blue-400 bg-blue-50/50'
              : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <input type="radio" v-model="selectedOption" value="upsell" class="sr-only" />
            <div class="flex items-center gap-2.5 w-full">
              <div
                class="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                :class="selectedOption === 'upsell' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'"
              >
                <div v-if="selectedOption === 'upsell'" class="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="text-[0.6rem] font-bold text-blue-600">{{ upsellTierLabel }}</span>
                  <span class="card-popular-tag">Popular</span>
                </div>
                <p class="text-xs font-semibold text-[#0d1b2a] truncate">{{ upsellCategory.titulo }}</p>
              </div>
              <span class="text-sm font-extrabold text-blue-600 whitespace-nowrap">
                ${{ formatPrice(upsellCategory.precio) }}
              </span>
            </div>

            <!-- Flechita curiosidad -->
            <button
              type="button"
              class="mt-1.5 w-full flex items-center justify-center gap-1 text-[0.6rem] font-semibold transition-colors"
              :class="showUpsellDetails ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'"
              @click.prevent.stop="showUpsellDetails = !showUpsellDetails"
            >
              <span>{{ showUpsellDetails ? 'Ocultar' : '¿Qué incluye?' }}</span>
              <svg
                class="w-2.5 h-2.5 transition-transform duration-200"
                :class="showUpsellDetails ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </label>

          <!-- Panel desplegable -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[32rem]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[32rem]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="showUpsellDetails" class="overflow-hidden">
              <div class="rounded-b-xl bg-blue-50/60 border border-t-0 border-blue-100 px-3 py-2 space-y-1">

                <!-- Primer benefit: clickeable para expandir bloques -->
                <button
                  type="button"
                  class="w-full flex items-center justify-between gap-1.5 text-[0.65rem] text-slate-700 font-semibold hover:text-blue-600 transition-colors"
                  @click.stop="showBlocksList = !showBlocksList"
                >
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ upsellBenefits[0] }}
                  </div>
                  <svg class="w-3 h-3 transition-transform duration-200 text-slate-400 shrink-0" :class="{ 'rotate-180': showBlocksList }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
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
                  <div v-if="showBlocksList && upsellBreakdown.blocks.length" class="overflow-hidden pl-4 pb-1">
                    <p class="text-[0.6rem] text-slate-400 mb-1">
                      {{ upsellBreakdown.blocks.length }} bloques · ~${{ formatPrice(upsellBreakdown.pricePerBlock) }} c/u
                    </p>
                    <ul class="space-y-0.5">
                      <li
                        v-for="block in upsellBreakdown.blocks"
                        :key="block.id"
                        class="flex items-center justify-between gap-2"
                      >
                        <span class="text-[0.62rem] text-slate-600 truncate">· {{ block.titulo }}</span>
                        <span class="text-[0.6rem] text-slate-400 shrink-0 tabular-nums">~${{ formatPrice(upsellBreakdown.pricePerBlock) }}</span>
                      </li>
                    </ul>
                  </div>
                </Transition>

                <!-- Resto de benefits -->
                <li
                  v-for="(benefit, i) in upsellBenefits.slice(1)"
                  :key="i"
                  class="flex items-center gap-1.5 text-[0.65rem] text-slate-600 list-none"
                >
                  <svg class="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ benefit }}
                </li>

                <button
                  type="button"
                  class="text-[0.6rem] font-semibold text-blue-600 hover:underline pt-0.5"
                  @click="emit('upsell-explore', upsellCategory!.id)"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- BOTON ÚNICO DE COMPRA -->
        <!-- Modo current: dos botones (carrito 30% + comprar 70%) -->
        <div v-if="selectedOption === 'current'" class="flex gap-2">
          <!-- Botón Carrito (30%) -->
          <button
            type="button"
            class="w-[30%] rounded-xl font-bold flex justify-center items-center transition-all duration-200"
            :class="ctaCartClasses"
            @click="emit('add-to-cart', category)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </button>

          <!-- Botón Comprar ahora (70%) -->
          <button
            type="button"
            class="w-[70%] rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200"
            :class="ctaBuyClasses"
            @click="emit('buy', category)"
          >
            <span>${{ formatPrice(category.precio) }}{{ currencySuffix }}</span>
          </button>
        </div>

        <!-- Modo upsell: botón único de ancho completo -->
        <button
          v-else
          type="button"
          class="w-full rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200"
          :class="ctaBuyClasses"
          @click="upsellCategory ? emit('upsell-buy', upsellCategory) : emit('add-to-cart', category)"
        >
          <span> ${{ formatPrice(upsellCategory?.precio ?? category.precio) }}{{ currencySuffix }}</span>
        </button>
      </div>

      <!-- ══ 7. AFILIADO ══ -->
      <div class="px-5 pb-5">
        <AffiliatyMessageComponent :id_category="category.id" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Premium card glow ─────────────────────────── */
@keyframes premium-glow {
  0%, 100% {
    box-shadow:
      0 0 12px rgba(245, 158, 11, 0.12),
      0 0 0 1px rgba(245, 158, 11, 0.15),
      0 8px 32px rgba(245, 158, 11, 0.08);
  }
  50% {
    box-shadow:
      0 0 20px rgba(245, 158, 11, 0.2),
      0 0 0 1px rgba(245, 158, 11, 0.3),
      0 12px 40px rgba(245, 158, 11, 0.12);
  }
}
.toda-tienda-card {
  animation: premium-glow 3s ease-in-out infinite;
}

/* ── Premium card shimmer sweep ─────────────────── */
@keyframes card-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.toda-tienda-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.05) 40%, rgba(245, 158, 11, 0.1) 50%, rgba(245, 158, 11, 0.05) 60%, transparent 100%);
  background-size: 200% 100%;
  animation: card-shimmer 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.toda-tienda-card > * {
  position: relative;
  z-index: 1;
}

/* ── Mejor Valor pill shimmer ──────────────────── */
@keyframes pill-shimmer {
  0%   { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
.mejor-valor-pill {
  background-size: 200% 100%;
  animation: pill-shimmer 3s ease-in-out infinite;
}

/* ── Low stock pulse ───────────────────────────── */
@keyframes cupos-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.cupos-pulse-dot {
  animation: cupos-pulse 1.5s ease-in-out infinite;
}

/* ── Popular tag pulse ────────────────────────── */
.card-popular-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.35rem;
  border-radius: 9999px;
  font-size: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #b45309;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  animation: popularPulse 2s ease-in-out infinite;
}
@keyframes popularPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ── Premium CTA button ────────────────────────── */
.cta-premium {
  background: linear-gradient(135deg, #f59e0b 0%, #facc15 50%, #f59e0b 100%);
  color: #451a03;
  background-size: 200% 200%;
  animation: cta-gradient 3s ease infinite;
}
.cta-premium:hover {
  background: linear-gradient(135deg, #d97706 0%, #eab308 50%, #d97706 100%);
  background-size: 200% 200%;
}
@keyframes cta-gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
