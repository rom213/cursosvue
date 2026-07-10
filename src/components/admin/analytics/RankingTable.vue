<script lang="ts" setup>
import { computed } from "vue";
import type { ContentItem } from "../../../services/AnalyticsService";

const props = withDefaults(
  defineProps<{
    title: string;
    items: ContentItem[];
    /** Campo de etiqueta: 'title' (cursos) o 'key' (categorías/filtros). */
    labelField?: "title" | "key";
    /** Campo de valor: 'views' (cursos) o 'count' (categorías/filtros). */
    valueField?: "views" | "count";
    valueLabel?: string;
    /** Mostrar columna vistos→comprados (solo cursos). */
    showConversion?: boolean;
    emptyHint?: string;
  }>(),
  {
    labelField: "title",
    valueField: "views",
    valueLabel: "Vistas",
    showConversion: false,
    emptyHint: "Aún no hay datos para este rango.",
  }
);

function label(it: ContentItem): string {
  const v = props.labelField === "title" ? it.title : it.key;
  return v ?? "—";
}
function value(it: ContentItem): number {
  return (props.valueField === "views" ? it.views : it.count) ?? 0;
}

const maxShare = computed(() => Math.max(0.0001, ...props.items.map((i) => i.share ?? 0)));

function trendClass(t: number | null): string {
  if (t === null || t === 0) return "text-gray-400";
  return t > 0 ? "text-emerald-600" : "text-red-500";
}
function trendText(t: number | null): string {
  if (t === null) return "—";
  if (t === 0) return "0%";
  return (t > 0 ? "▲ " : "▼ ") + Math.abs(t).toFixed(0) + "%";
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-700">{{ title }}</h3>
    </div>

    <div v-if="items.length === 0" class="p-6 text-center text-sm text-gray-400">
      {{ emptyHint }}
    </div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
          <th class="text-left font-semibold px-4 py-2 w-6">#</th>
          <th class="text-left font-semibold px-2 py-2">Nombre</th>
          <th class="text-right font-semibold px-2 py-2">{{ valueLabel }}</th>
          <th v-if="showConversion" class="text-right font-semibold px-2 py-2">Conv.</th>
          <th class="text-right font-semibold px-4 py-2 w-16">Tend.</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(it, idx) in items"
          :key="idx"
          class="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
        >
          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
          <td class="px-2 py-2">
            <div class="text-gray-700 font-medium truncate max-w-[220px]">{{ label(it) }}</div>
            <div class="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                class="h-full bg-blue-500/70 rounded-full"
                :style="{ width: ((it.share ?? 0) / maxShare) * 100 + '%' }"
              ></div>
            </div>
          </td>
          <td class="px-2 py-2 text-right font-semibold text-gray-800 tabular-nums">
            {{ value(it).toLocaleString("es-CO") }}
          </td>
          <td v-if="showConversion" class="px-2 py-2 text-right text-gray-600 tabular-nums">
            {{ ((it.conversion_rate ?? 0) * 100).toFixed(1) }}%
          </td>
          <td class="px-4 py-2 text-right text-xs font-semibold tabular-nums" :class="trendClass(it.trend_pct)">
            {{ trendText(it.trend_pct) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
