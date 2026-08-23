<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ICategory } from '../types/Categorie';
import { courseIcons } from './courseIcons';
import { getBloquesCountForCategory } from './courseFilterData';
import { useTracking } from '../composables/useTracking';

const { trackWhatsAppIntent } = useTracking();

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
  currencySuffix: ' COP',
  isBlurred: false,
  isPremium: false,
  cardClasses: '',
  upsellCategory: null,
});

const emit = defineEmits<{
  (e: 'click', id: number): void
  (e: 'add-to-cart', category: ICategory): void
  (e: 'buy', category: ICategory): void
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
    return 'bg-green-600 hover:bg-green-700 text-white py-3 px-4 text-base shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5'
  return 'bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 text-sm shadow-md shadow-green-600/15 hover:shadow-lg hover:-translate-y-0.5'
});

// ── Upsell helpers ──
const selectedOption = ref<'current' | 'upsell'>('current');


const whatsappUrl = computed(() => {
  const phone = '57320 9971514';
  const msg = encodeURIComponent(
    `Hola, quiero obtener acceso a *${props.category.titulo}* por $${formatPrice(props.category.precio)} COP. ¿Me pueden ayudar?`
  );
  return `https://wa.me/${phone}?text=${msg}`;
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
          🎟️ 50% Dto. en toda la tienda
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
      <div @click="emit('click', category.id)" class="px-5 pt-4">
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
        @click="emit('click', category.id)"
        v-if="category.frase_2"
        class="mx-5 text-slate-700 italic mt-2 mb-1"
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
      <div @click="emit('click', category.id)" class="px-5 pt-3 space-y-2.5">

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
            <div class="w-5 h-5" v-html="courseIcons.download" />
          </div>
          <span class="text-sm font-medium text-slate-600">Todos los cursos se pueden descargar</span>
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

        <!-- Anclaje de precio con descuento -->
        <div v-if="hasDiscount" class="flex items-center justify-center gap-2 text-sm">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">
            {{ discountPercent }}% Dto.
          </span>
          <span class="line-through text-slate-400 font-medium">
            ${{ formatPrice(category.precio_desc) }}
            <!-- {{ currencySuffix }} -->
          </span>
        </div>

        <!-- ── Opcion actual (siempre) ── -->
        <label
          class="card-option flex items-center gap-2.5 rounded-xl px-3 py-2 cursor-pointer border-2 transition-all"
          :class="selectedOption === 'current'
            ? 'border-gray-700 bg-white'
            : 'border-slate-200 bg-white hover:border-slate-300'"
        >
          <input type="radio" v-model="selectedOption" value="current" class="sr-only" />
          <div
            class="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
            :class="selectedOption === 'current' ? 'border-gray-700 bg-gray-700' : 'border-slate-300'"
          >
            <div v-if="selectedOption === 'current'" class="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span class="flex-1 text-xs font-semibold truncate" :class="selectedOption === 'current' ? 'text-gray-700' : 'text-[#0d1b2a]'">Este paquete tiene valor de</span>
          <span class="text-sm font-extrabold whitespace-nowrap" :class="selectedOption === 'current' ? 'text-gray-700' : 'text-[#0d1b2a]'">
            ${{ formatPrice(category.precio) }}
          </span>
        </label>


        <!-- BOTON ÚNICO DE COMPRA -->
        <div v-if="selectedOption === 'current'" class="space-y-2">

          <!-- Encabezado de elección -->
          <p class="text-center text-[0.68rem] font-semibold text-black uppercase tracking-widest cta-label-pulse">
            ¿Cómo quieres obtener el paquete?
          </p>

          <div class="flex gap-2">
            <!-- Botón WhatsApp (30%) -->
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-[50%] rounded-xl font-bold flex  justify-center items-center gap-0.5 transition-all duration-200 no-underline bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:-translate-y-0.5"
              @click="trackWhatsAppIntent(category, { source: 'catalog', contentCategory: 'product' })"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.855L.057 23.486a.5.5 0 0 0 .611.611l5.632-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.524-5.2-1.433l-.373-.223-3.865 1.006 1.006-3.865-.223-.373A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              <span class="text-[0.65rem] gap-2 font-bold leading-tight text-center">Comprar por chat</span>
            </a>

            <!-- Botón Acceso web (70%) -->
            <button
              type="button"
              class="w-[50%] h-11 rounded-xl font-bold flex  justify-center items-center gap-2 transition-all duration-200 text-white shadow-md hover:-translate-y-0.5"
              style="background-color: #5d48f7;"
              @click="emit('buy', category)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 shrink-0 opacity-80">
                <path fill-rule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.678ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.061 0Z" clip-rule="evenodd" />
              </svg>
              <span class="text-[0.7rem] font-extrabold leading-tight text-center">Comprar desde la web</span>
            </button>
          </div>
        </div>

        <!-- Modo upsell: botón único de ancho completo -->
        <button
          v-else
          type="button"
          class="w-full rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-200"
          :class="ctaBuyClasses"
          @click="upsellCategory ? emit('upsell-buy', upsellCategory) : emit('add-to-cart', category)"
        >
          <span>Desbloquear paquete — ${{ formatPrice(upsellCategory?.precio ?? category.precio) }}</span>
        </button>
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

/* ── CTA label pulse scale ─────────────────────── */
@keyframes cta-label-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.06); opacity: 0.75; }
}
.cta-label-pulse {
  display: block;
  text-align: center;
  color: #0d1b2a;
  animation: cta-label-pulse 2s ease-in-out infinite;
}
</style>
