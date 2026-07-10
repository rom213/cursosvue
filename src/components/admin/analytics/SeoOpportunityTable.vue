<script lang="ts" setup>
import type { SeoItem } from "../../../services/AnalyticsService";

const props = defineProps<{
  kind: "queries" | "pages" | "opportunities";
  items: SeoItem[];
  emptyHint?: string;
}>();

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
const pct = (v: number) => ((v ?? 0) * 100).toFixed(2) + "%";
const pos = (v: number) => (v ?? 0).toFixed(1);

const REASON_LABELS: Record<string, string> = {
  striking_distance: "2ª página (5–15)",
  low_ctr: "CTR bajo",
};

const keyHeader =
  props.kind === "pages" ? "Página" : "Query";
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div v-if="items.length === 0" class="p-6 text-center text-sm text-gray-400">
      {{ emptyHint ?? "Sin datos de Search Console en este rango." }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm min-w-[560px]">
        <thead>
          <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
            <th class="text-left font-semibold px-4 py-2">{{ keyHeader }}</th>
            <th v-if="kind === 'opportunities'" class="text-left font-semibold px-2 py-2">Página</th>
            <th class="text-right font-semibold px-2 py-2">Clics</th>
            <th class="text-right font-semibold px-2 py-2">Impr.</th>
            <th class="text-right font-semibold px-2 py-2">CTR</th>
            <th class="text-right font-semibold px-2 py-2">Pos.</th>
            <th v-if="kind === 'opportunities'" class="text-left font-semibold px-4 py-2">Motivo</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(it, idx) in items"
            :key="idx"
            class="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
          >
            <td class="px-4 py-2 text-gray-700 font-medium">
              <div class="flex items-center gap-2">
                <span class="truncate max-w-[220px]">{{ it.key }}</span>
                <span
                  v-if="it.branded"
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500 font-semibold shrink-0"
                >
                  marca
                </span>
              </div>
            </td>
            <td v-if="kind === 'opportunities'" class="px-2 py-2 text-gray-500 truncate max-w-[220px]">
              {{ it.page }}
            </td>
            <td class="px-2 py-2 text-right text-gray-800 font-semibold tabular-nums">{{ num(it.clicks) }}</td>
            <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ num(it.impressions) }}</td>
            <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ pct(it.ctr) }}</td>
            <td class="px-2 py-2 text-right font-semibold text-gray-700 tabular-nums">{{ pos(it.position) }}</td>
            <td v-if="kind === 'opportunities'" class="px-4 py-2">
              <span
                class="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                :class="it.reason === 'striking_distance' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'"
              >
                {{ REASON_LABELS[it.reason ?? ""] ?? it.reason }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
