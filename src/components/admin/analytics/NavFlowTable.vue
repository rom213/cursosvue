<script lang="ts" setup>
import { computed } from "vue";
import type { NavEdge } from "../../../services/AnalyticsService";

const props = defineProps<{
  edges: NavEdge[];
  /** Página seleccionada (resaltada) para el drill-down. */
  selectedPage?: string | null;
}>();
const emit = defineEmits<{ (e: "select-page", path: string): void }>();

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");

const rows = computed(() => [...props.edges].sort((a, b) => b.sessions - a.sessions));
const maxSessions = computed(() => rows.value.reduce((m, e) => Math.max(m, e.sessions), 0));
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-700">Flujo entre páginas (De → A)</h3>
      <p class="text-[11px] text-gray-400">Click en una página para ver sus elementos más clickeados.</p>
    </div>

    <div v-if="rows.length === 0" class="p-6 text-center text-sm text-gray-400">
      Sin transiciones internas en este rango.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm min-w-[560px]">
        <thead>
          <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
            <th class="text-left font-semibold px-4 py-2">Desde</th>
            <th class="text-center font-semibold px-2 py-2"></th>
            <th class="text-left font-semibold px-2 py-2">Hacia</th>
            <th class="text-right font-semibold px-4 py-2">Sesiones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, idx) in rows" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/60">
            <td class="px-4 py-2">
              <button
                type="button"
                class="font-mono text-xs px-1.5 py-0.5 rounded truncate max-w-[200px] inline-block align-bottom transition-colors"
                :class="selectedPage === e.from ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'"
                :title="e.from"
                @click="emit('select-page', e.from)"
              >
                {{ e.from }}
              </button>
            </td>
            <td class="px-2 py-2 text-center text-gray-300">→</td>
            <td class="px-2 py-2">
              <button
                type="button"
                class="font-mono text-xs px-1.5 py-0.5 rounded truncate max-w-[200px] inline-block align-bottom transition-colors"
                :class="selectedPage === e.to ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'"
                :title="e.to"
                @click="emit('select-page', e.to)"
              >
                {{ e.to }}
              </button>
            </td>
            <td class="px-4 py-2 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-2">
                <div class="h-1.5 rounded-full bg-blue-100 overflow-hidden w-16 hidden sm:block">
                  <div
                    class="h-full bg-blue-400"
                    :style="{ width: (maxSessions ? (e.sessions / maxSessions) * 100 : 0) + '%' }"
                  ></div>
                </div>
                <span class="font-semibold text-gray-800 tabular-nums">{{ num(e.sessions) }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
