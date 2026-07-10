<script lang="ts" setup>
import { computed } from "vue";
import type { NavClickItem } from "../../../services/AnalyticsService";

const props = defineProps<{
  items: NavClickItem[];
  /** Página del detalle; null = ranking global del rango. */
  pagePath?: string | null;
}>();
const emit = defineEmits<{ (e: "clear"): void }>();

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
const pct = (v: number) => ((v ?? 0) * 100).toFixed(1) + "%";

const maxClicks = computed(() => props.items.reduce((m, i) => Math.max(m, i.clicks), 0));
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
      <div class="min-w-0">
        <h3 class="text-sm font-bold text-gray-700">Elementos más clickeados</h3>
        <p class="text-[11px] text-gray-400 truncate">
          <template v-if="pagePath">
            Página: <span class="font-mono text-gray-500">{{ pagePath }}</span>
          </template>
          <template v-else>Todas las páginas del rango</template>
        </p>
      </div>
      <button
        v-if="pagePath"
        type="button"
        class="text-[11px] font-semibold text-blue-500 hover:text-blue-700 whitespace-nowrap"
        @click="emit('clear')"
      >
        ✕ ver todas
      </button>
    </div>

    <div v-if="items.length === 0" class="p-6 text-center text-sm text-gray-400">
      Sin clicks registrados{{ pagePath ? " en esta página" : "" }} en este rango.
      <div class="text-[11px] mt-1">La autocaptura empieza a poblar esto cuando la web pública recibe clicks.</div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm min-w-[560px]">
        <thead>
          <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
            <th class="text-left font-semibold px-4 py-2">Elemento</th>
            <th class="text-right font-semibold px-2 py-2">Clicks</th>
            <th class="text-right font-semibold px-2 py-2">Sesiones</th>
            <th class="text-right font-semibold px-2 py-2" title="clicks / pageviews de la página">CTR</th>
            <th class="text-right font-semibold px-4 py-2" title="Clicks sin ancestro interactivo">% muertos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it, idx) in items" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/60">
            <td class="px-4 py-2.5">
              <div class="font-medium text-gray-700 font-mono text-xs truncate max-w-[260px]" :title="it.key">
                {{ it.key }}
              </div>
              <div v-if="it.example_text" class="text-[11px] text-gray-400 truncate max-w-[260px]">
                "{{ it.example_text }}"
              </div>
            </td>
            <td class="px-2 py-2.5 text-right">
              <div class="flex items-center justify-end gap-2">
                <div class="h-1.5 rounded-full bg-blue-100 overflow-hidden w-14 hidden sm:block">
                  <div class="h-full bg-blue-400" :style="{ width: (maxClicks ? (it.clicks / maxClicks) * 100 : 0) + '%' }"></div>
                </div>
                <span class="font-semibold text-gray-800 tabular-nums">{{ num(it.clicks) }}</span>
              </div>
            </td>
            <td class="px-2 py-2.5 text-right text-gray-600 tabular-nums">{{ num(it.sessions) }}</td>
            <td class="px-2 py-2.5 text-right text-gray-600 tabular-nums">{{ pct(it.ctr) }}</td>
            <td class="px-4 py-2.5 text-right tabular-nums" :class="it.dead_rate > 0.5 ? 'text-rose-500 font-semibold' : 'text-gray-400'">
              {{ pct(it.dead_rate) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
