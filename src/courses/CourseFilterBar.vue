<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  PILARES,
  COMBOS,
  type FilterType,
  type PilarDefinition,
} from './courseFilterData'
import type { ICategory } from '../types/Categorie'

withDefaults(defineProps<{
  categories: ICategory[]
  search?: string
}>(), {
  search: '',
})

const emit = defineEmits<{
  (e: 'reorder', filterType: FilterType): void
  (e: 'scrollTo', categoryId: number): void
  (e: 'update:search', value: string): void
}>()

const openDropdown = ref<string | null>(null)
const activeFilter = ref<FilterType>('all')
const filterBarRef = ref<HTMLElement | null>(null)

const bloquesBtnRef = ref<HTMLElement | null>(null)
const pilaresBtnRef = ref<HTMLElement | null>(null)
const combosBtnRef = ref<HTMLElement | null>(null)

const dropdownPos = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

const calcDropdownPos = (btnRef: HTMLElement | null) => {
  if (!btnRef) return
  const rect = btnRef.getBoundingClientRect()
  dropdownPos.value = {
    top: `${rect.bottom + 6}px`,
    left: `${Math.max(8, rect.left)}px`,
  }
}

const toggleDropdown = (key: string) => {
  if (openDropdown.value === key) {
    openDropdown.value = null
    return
  }
  const refMap: Record<string, HTMLElement | null> = {
    bloques: bloquesBtnRef.value,
    pilares: pilaresBtnRef.value,
    combos: combosBtnRef.value,
  }
  calcDropdownPos(refMap[key] ?? null)
  openDropdown.value = key
}

const handleTextClick = (filterType: FilterType) => {
  activeFilter.value = activeFilter.value === filterType ? 'all' : filterType
  emit('reorder', activeFilter.value === 'all' ? 'all' : filterType)
  openDropdown.value = null
}

const handleTodaTiendaClick = () => {
  activeFilter.value = 'toda-la-tienda'
  emit('reorder', 'toda-la-tienda')
  openDropdown.value = null
}

const handleItemClick = (categoryId: number) => {
  emit('scrollTo', categoryId)
  openDropdown.value = null
}

const handleClickOutside = (event: MouseEvent) => {
  if (filterBarRef.value && !filterBarRef.value.contains(event.target as Node)) {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const getPilarTotalCourses = (pilar: PilarDefinition): number => {
  return pilar.themes.reduce((sum, t) => sum + t.courseCount, 0)
}

const allThemesTotal = computed(() =>
  PILARES.reduce((sum, p) => sum + getPilarTotalCourses(p), 0)
)
</script>

<template>
  <div
    ref="filterBarRef"
    class="filter-bar sticky top-[3.5rem] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
  >
    <div class="filter-scroll overflow-x-auto">
      <div class="flex items-center gap-2 justify-center whitespace-nowrap py-2.5 px-4 min-w-max mx-auto">

        <!-- BUSCADOR DE CURSOS -->
        <div class="relative flex-shrink-0">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            :value="search"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Buscar curso..."
            class="w-44 md:w-56 pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white placeholder:text-gray-400"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-0"
            @click="emit('update:search', '')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Separador visual -->
        <div class="w-px h-6 bg-gray-200 mx-1" />

        <!-- BLOQUES INDIVIDUALES (Split Button) -->
        <div ref="bloquesBtnRef" class="relative">
          <div class="flex items-center rounded-xl border overflow-hidden transition-all"
               :class="activeFilter === 'bloques'
                 ? 'ring-2 ring-gray-300 border-gray-400 bg-gray-50'
                 : 'border-gray-200 hover:border-gray-300'">
            <button
              type="button"
              class="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              @click="handleTextClick('bloques')"
            >
              Bloques Individuales
            </button>
            <div class="w-px h-6 bg-gray-200" />
            <button
              type="button"
              class="px-2.5 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              @click="toggleDropdown('bloques')"
            >
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': openDropdown === 'bloques' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- PILARES PRINCIPALES (Split Button) -->
        <div ref="pilaresBtnRef" class="relative">
          <div class="flex items-center rounded-xl border overflow-hidden transition-all"
               :class="activeFilter === 'pilares'
                 ? 'ring-2 ring-gray-300 border-gray-400 bg-gray-50'
                 : 'border-gray-200 hover:border-gray-300'">
            <button
              type="button"
              class="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              @click="handleTextClick('pilares')"
            >
              Pilares Principales
            </button>
            <div class="w-px h-6 bg-gray-200" />
            <button
              type="button"
              class="px-2.5 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              @click="toggleDropdown('pilares')"
            >
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': openDropdown === 'pilares' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- COMBINACIONES (Split Button con gradiente) -->
        <div ref="combosBtnRef" class="relative">
          <div class="flex items-center rounded-xl border overflow-hidden transition-all"
               :class="activeFilter === 'combos'
                 ? 'ring-2 ring-purple-200 border-purple-300 bg-purple-50'
                 : 'border-gray-200 hover:border-purple-200'">
            <button
              type="button"
              class="px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-purple-50"
              @click="handleTextClick('combos')"
            >
              <span class="bg-gradient-to-r from-blue-600 to-emerald-500 text-transparent bg-clip-text">Combinaciones</span>
            </button>
            <div class="w-px h-6 bg-gray-200" />
            <button
              type="button"
              class="px-2.5 py-2 text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              @click="toggleDropdown('combos')"
            >
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': openDropdown === 'combos' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- TODA LA TIENDA 2026 (Botón premium con shimmer) -->
        <button
          type="button"
          class="toda-tienda-btn relative px-4 py-2 rounded-xl border-2 transition-all overflow-hidden"
          :class="activeFilter === 'toda-la-tienda'
            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50'
            : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'"
          @click="handleTodaTiendaClick"
        >
          <span class="toda-tienda-text relative z-10 text-sm font-bold text-amber-600">
            Toda la Tienda 2026
          </span>
          <div class="shimmer-overlay absolute inset-0 z-0" />
        </button>

      </div>
    </div>

    <!-- ═══ DROPDOWNS (fixed, fuera del overflow) ═══ -->

    <!-- Dropdown: 23 bloques agrupados por pilar -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="openDropdown === 'bloques'"
          class="fixed w-80 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[24rem] overflow-y-auto z-[9999] dropdown-scroll"
          :style="{ top: dropdownPos.top, left: dropdownPos.left }"
        >
          <div class="px-3.5 py-2 border-b border-gray-100 bg-gray-50/80 rounded-t-xl">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">23 Bloques</span>
            <span class="text-[10px] text-gray-400 ml-2">{{ allThemesTotal.toLocaleString() }} cursos en total</span>
          </div>

          <div v-for="pilar in PILARES" :key="pilar.key" class="py-1">
            <!-- Header del pilar -->
            <div class="flex items-center gap-2 px-3.5 py-2 bg-gray-50/50">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="pilar.dotColor" />
              <span class="text-xs font-bold uppercase tracking-wider" :class="pilar.textColor">
                {{ pilar.shortLabel }}
              </span>
              <span class="text-[10px] text-gray-400 ml-auto">
                {{ getPilarTotalCourses(pilar).toLocaleString() }} cursos
              </span>
            </div>

            <!-- Items del pilar -->
            <button
              v-for="theme in pilar.themes"
              :key="theme.id"
              type="button"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-gray-50"
              @click="handleItemClick(theme.id)"
            >
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="pilar.dotColor" />
              <span class="text-sm truncate flex-1 font-medium" :class="pilar.textColor">
                {{ theme.name }}
              </span>
              <span class="text-xs text-gray-400 flex-shrink-0 tabular-nums">
                {{ theme.courseCount.toLocaleString() }} cursos
              </span>
            </button>

            <!-- Separador entre pilares -->
            <div v-if="pilar.key !== 'creativa'" class="mx-3 border-b border-gray-100" />
          </div>
        </div>
      </Transition>

      <!-- Dropdown: 3 pilares -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="openDropdown === 'pilares'"
          class="fixed w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
          :style="{ top: dropdownPos.top, left: dropdownPos.left }"
        >
          <div class="px-3.5 py-2 border-b border-gray-100 bg-gray-50/80 rounded-t-xl">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Los 3 Gigantes</span>
          </div>
          <div class="py-1">
            <button
              v-for="pilar in PILARES"
              :key="pilar.pilarId"
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              @click="handleItemClick(pilar.pilarId)"
            >
              <span class="w-3.5 h-3.5 rounded-full flex-shrink-0" :class="pilar.dotColor" />
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block" :class="pilar.textColor">
                  {{ pilar.label }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ pilar.themes.length }} bloques &middot; {{ getPilarTotalCourses(pilar).toLocaleString() }} cursos
                </span>
              </div>
              <span class="text-xs font-bold text-gray-500">$50k</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Dropdown: 3 combinaciones -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95"
      >
        <div
          v-if="openDropdown === 'combos'"
          class="fixed w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]"
          :style="{ top: dropdownPos.top, left: dropdownPos.left }"
        >
          <div class="px-3.5 py-2 border-b border-gray-100 bg-gray-50/80 rounded-t-xl">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Combinación de 2 Gigantes</span>
          </div>
          <div class="py-1">
            <button
              v-for="combo in COMBOS"
              :key="combo.id"
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              @click="handleItemClick(combo.id)"
            >
              <div class="flex -space-x-1 flex-shrink-0">
                <span
                  class="w-3 h-3 rounded-full border-2 border-white"
                  :class="PILARES.find(p => p.key === combo.pilarKeys[0])?.dotColor"
                />
                <span
                  class="w-3 h-3 rounded-full border-2 border-white"
                  :class="PILARES.find(p => p.key === combo.pilarKeys[1])?.dotColor"
                />
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold block bg-gradient-to-r from-blue-600 to-emerald-500 text-transparent bg-clip-text">
                  {{ combo.name }}
                </span>
                <span class="text-xs text-gray-400">{{ combo.shortName }}</span>
              </div>
              <span class="text-xs font-bold text-gray-500">{{ combo.price }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Scrollbar oculto en la barra ──────────────────── */
.filter-scroll::-webkit-scrollbar {
  display: none;
}
.filter-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* ── Shimmer para Toda la Tienda ───────────────────── */
@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.shimmer-overlay {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(245, 158, 11, 0.08) 40%,
    rgba(245, 158, 11, 0.15) 50%,
    rgba(245, 158, 11, 0.08) 60%,
    transparent 100%
  );
  animation: shimmer-sweep 3s ease-in-out infinite;
}

.toda-tienda-btn:hover .shimmer-overlay {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(245, 158, 11, 0.15) 40%,
    rgba(245, 158, 11, 0.25) 50%,
    rgba(245, 158, 11, 0.15) 60%,
    transparent 100%
  );
}

/* ── Responsive: mobile header es 7rem ─────────────── */
@media (max-width: 767px) {
  .filter-bar {
    top: 7rem;
  }
}
</style>

<style>
/* ── Dropdown scrollbar (global porque usa Teleport) ── */
.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}
.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}
.dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
