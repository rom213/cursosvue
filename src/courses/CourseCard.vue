<script lang="ts" setup>
import { computed } from 'vue';
import type { ICategory } from '../types/Categorie';
import { courseIcons } from './courseIcons';
import AffiliatyMessageComponent from '../components/auth/affiliaty.message.component.vue';

export type PillarColor = 'blue' | 'emerald' | 'orange' | 'purple' | 'amber'

interface CourseCardProps {
  category: ICategory
  pillarColor: PillarColor
  pillarLabel: string
  typeLabel?: string
  hasResale?: boolean
  currencySuffix?: string
  isBlurred?: boolean
  isPremium?: boolean
  cardClasses?: string
}

const props = withDefaults(defineProps<CourseCardProps>(), {
  typeLabel: '',
  hasResale: false,
  currencySuffix: ' USD',
  isBlurred: false,
  isPremium: false,
  cardClasses: '',
});

const emit = defineEmits<{
  (e: 'click', id: number): void
  (e: 'add-to-cart', category: ICategory): void
  (e: 'buy', category: ICategory): void
  (e: 'preview', category: ICategory): void
}>();

const COLOR_MAP: Record<PillarColor, {
  borderTop: string
  pillBg: string
  pillText: string
  iconBg: string
  iconText: string
}> = {
  blue:    { borderTop: 'border-t-blue-500',    pillBg: 'bg-blue-100',    pillText: 'text-blue-700',    iconBg: 'bg-blue-50',    iconText: 'text-blue-500' },
  emerald: { borderTop: 'border-t-emerald-500', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
  orange:  { borderTop: 'border-t-orange-500',  pillBg: 'bg-orange-100',  pillText: 'text-orange-700',  iconBg: 'bg-orange-50',  iconText: 'text-orange-500' },
  purple:  { borderTop: 'border-t-purple-500',  pillBg: 'bg-purple-100',  pillText: 'text-purple-700',  iconBg: 'bg-purple-50',  iconText: 'text-purple-500' },
  amber:   { borderTop: 'border-t-amber-500',   pillBg: 'bg-amber-100',   pillText: 'text-amber-700',   iconBg: 'bg-amber-50',   iconText: 'text-amber-500' },
};

const colors = computed(() => COLOR_MAP[props.pillarColor]);

const cuposCount = computed(() => props.category.num_per || 23);
const isLowStock = computed(() => cuposCount.value < 30);
const cursosCount = computed(() => props.category.cantidad_cursos || 122);
</script>

<template>
  <div :class="{ 'blur-[2px]': isBlurred }">
    <div
      class="group bg-white rounded-b-2xl shadow-xl shadow-slate-200/50 border-t-4 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50"
      :class="[colors.borderTop, cardClasses, isPremium ? 'toda-tienda-card' : '']"
    >
      <!-- 1. Zona de etiquetas -->
      <div class="flex flex-wrap gap-2 p-5 pb-0">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="[colors.pillBg, colors.pillText]"
        >
          {{ pillarLabel }}
        </span>
        <span
          v-if="typeLabel"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"
        >
          {{ typeLabel }}
        </span>
        <span
          v-if="hasResale"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
        >
          🤝 Incluye Reventa
        </span>
      </div>

      <!-- 2. Imagen destacada -->
      <div class="px-5 pt-4">
        <div
          class="aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer group-hover:ring-2 ring-offset-2 ring-slate-300/50 transition-all"
          @click="emit('click', category.id)"
        >
          <img
            v-if="category.imagen_url"
            class="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            :src="category.imagen_url"
            :alt="category.titulo || 'Curso'"
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
        </div>
      </div>

      <!-- 3. Título y subtítulo -->
      <div class="px-5 pt-4">
        <h3
          class="font-bold text-lg text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          :title="category.titulo"
          @click="emit('click', category.id)"
        >
          {{ category.titulo }}
        </h3>
        <p
          v-if="category.frase_1"
          class="text-slate-500 text-sm mt-1 truncate"
        >
          {{ category.frase_1 }}
        </p>
      </div>

      <!-- 4. Frase de transformación -->
      <p
        v-if="category.frase_2"
        class="px-5 text-slate-400 italic text-sm mt-2 mb-1 line-clamp-2"
      >
        {{ category.frase_2 }}
      </p>

      <!-- 5. Métricas clave -->
      <div class="px-5 pt-3 grid grid-cols-2 gap-3">
        <!-- Cupos -->
        <div class="flex items-center gap-2.5 group/item">
          <div
            class="p-1.5 rounded-lg transition-colors"
            :class="[colors.iconBg, colors.iconText]"
          >
            <div class="w-5 h-5" v-html="courseIcons.cupos" />
          </div>
          <div class="flex items-baseline gap-1">
            <span
              class="text-base font-bold"
              :class="isLowStock ? 'text-red-600' : 'text-slate-900'"
            >
              {{ cuposCount }}
            </span>
            <span class="text-xs text-slate-400 font-medium">/ 200</span>
          </div>
        </div>

        <!-- Cursos incluidos -->
        <div class="flex items-center gap-2.5 group/item">
          <div
            class="p-1.5 rounded-lg transition-colors"
            :class="[colors.iconBg, colors.iconText]"
          >
            <div class="w-5 h-5" v-html="courseIcons.cursos" />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-bold text-slate-900">{{ cursosCount }}</span>
            <span class="text-xs text-slate-400 font-medium">cursos</span>
          </div>
        </div>

        <!-- Certificación -->
        <div class="flex items-center gap-2.5 col-span-2 group/item">
          <div
            class="p-1.5 rounded-lg transition-colors"
            :class="[colors.iconBg, colors.iconText]"
          >
            <div class="w-5 h-5" v-html="courseIcons.certification" />
          </div>
          <span class="text-sm font-medium text-slate-600">Certificación incluida</span>
        </div>
      </div>

      <!-- 6. CTAs -->
      <div class="p-5 pt-4 mt-auto space-y-3">
        <div class="flex gap-3">
          <button
            type="button"
            title="Vista previa en Drive"
            class="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            @click="emit('preview', category)"
          >
            <div class="w-5 h-5" v-html="courseIcons.preview" />
          </button>

          <button
            type="button"
            class="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex justify-center items-center gap-2"
            @click="emit('add-to-cart', category)"
          >
            Agregar al carro
          </button>
        </div>

        <p
          v-if="category.pregunta_respuesta?.[0]?.pregunta"
          class="text-sm text-slate-700 font-medium"
        >
          {{ category.pregunta_respuesta[0].pregunta }}
        </p>

        <button
          type="button"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-base font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
          @click="emit('buy', category)"
        >
          <span>Agregar al carrito — ${{ category.precio }}{{ currencySuffix }}</span>
        </button>
      </div>

      <!-- 7. Mensaje de afiliado -->
      <div class="px-5 pb-5">
        <AffiliatyMessageComponent :id_category="category.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes premium-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.2); }
  50% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.35); }
}
.toda-tienda-card {
  animation: premium-glow 3s ease-in-out infinite;
}
</style>
