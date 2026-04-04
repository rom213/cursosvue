<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ICategory } from '../types/Categorie';

import {  getBloquesCountForCategory } from '../courses/courseFilterData';
import AffiliatyMessageComponent from '../components/auth/affiliaty.message.component.vue';
import { courseIcons } from '../courses/courseIcons';
//import { emergentBuyStore } from '../store/EmergentBuyStore';
import { authStore } from '../store/AuthStore';
const authStoreInstance = authStore();

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
const bloquesCount = computed(() => getBloquesCountForCategory(props.category.id));
const cursosCount = computed(() => props.category.cantidad_cursos ?? 200);


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


// ── Upsell helpers ──
const selectedOption = ref<'current' | 'upsell'>('current');

// ── Preview copy state ──
const previewCopied = ref(false);
const copyPreviewLink = async () => {
  const link = props.category.url;
  if (!link) {
    console.warn('No Google Drive link available');
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    previewCopied.value = true;
    setTimeout(() => {
      previewCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

// ── Coupon copy state ──
const couponCopied = ref(false);
const couponCode = computed(() => authStoreInstance.getProfile()?.user?.codigo_referido);
const hasCoupon = computed(() => !!couponCode.value);
const copyDiscount = async () => {
  const coupon = couponCode.value;
  if (!coupon) {
    console.warn('No coupon code available');
    return;
  }
  try {
    await navigator.clipboard.writeText(coupon);
    couponCopied.value = true;
    setTimeout(() => {
      couponCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar cupón:', err);
  }
};



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
      </div>

      <!-- ══ 4. FRASE TRANSFORMACIONAL ══ -->

      <!-- ══ 5. METRICAS DE VALOR ══ -->
      <div class="px-5 pt-3 space-y-2.5">

        <!-- Volumen: bloques + cursos (siempre) -->
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg shrink-0" :class="[colors.iconBg, colors.iconText]">
            <div class="w-5 h-5" v-html="courseIcons.cursos" />
          </div>
          <span class="text-sm text-slate-700">
            <template v-if="bloquesCount !== null">
              <strong class="text-slate-900">{{ bloquesCount }}</strong> Bloque{{ bloquesCount > 1 ? 's' : '' }}
              <span class="text-slate-400 mx-0.5">&middot;</span>
            </template>
            <strong class="text-slate-900">{{ cursosCount.toLocaleString() }}</strong> cursos
          </span>
        </div>  
 


      </div>

      <!-- ══ 6. CTAs ══ -->
      <div class="p-5 pt-4 mt-auto space-y-2.5">

        <!-- Vista previa en Drive - Copiar link -->
        <button
          type="button"
          class="w-full rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200"
          :class="previewCopied
            ? 'bg-emerald-500 text-white py-2.5 px-4 text-sm shadow-lg shadow-emerald-500/30'
            : tierLevel === 'basic'
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 text-xs'
            : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-2.5 px-4 text-sm'"
          @click="copyPreviewLink"
        >
          <span v-if="!previewCopied" class="w-5 h-5 shrink-0" v-html="courseIcons.preview" />
          <span v-if="previewCopied" class="w-5 h-5 shrink-0">✓</span>
          <span>{{ previewCopied ? '¡Copiado!' : 'Copiar link' }}</span>
        </button>

        <!-- Copiar cupón de descuento (si existe) -->
        <button
          v-if="hasCoupon"
          type="button"
          class="w-full rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200"
          :class="couponCopied
            ? 'bg-emerald-500 text-white py-2.5 px-4 text-sm shadow-lg shadow-emerald-500/30'
            : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 py-2.5 px-4 text-sm'"
          @click="copyDiscount"
        >
          <span v-if="!couponCopied" class="w-5 h-5 shrink-0">🎟️</span>
          <span v-if="couponCopied" class="w-5 h-5 shrink-0">✓</span>
          <span>{{ couponCopied ? '¡Cupón copiado!' : `Copiar cupón: ${couponCode}` }}</span>
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



        <!-- BOTON ÚNICO DE COMPRA -->
        <!-- Modo current: dos botones (carrito 30% + comprar 70%) -->
        <div v-if="selectedOption === 'current'" class="flex gap-2">
          <!-- Botón Carrito (30%) -->


          <!-- Botón Comprar ahora (70%) -->
          <button
            type="button"
            class="w-[100%] rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 py-2.5 px-4 text-sm"
            @click="()=>{emit('buy', category)}"
          >
            <span class="text-lg">🤝</span>
            <span>Venta a tercero ${{ formatPrice(category.precio) }}{{ currencySuffix }}</span>
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
