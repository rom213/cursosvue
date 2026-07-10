<script lang="ts" setup>
import { computed } from "vue";
import type { FunnelResponse, FunnelStage } from "../../../services/AnalyticsService";

const props = defineProps<{ data: FunnelResponse }>();

// Etiquetas de canal en español (espejan SegmentBar). `todos` = sin filtro.
const CHANNEL_LABELS: Record<string, string> = {
  todos: "Todos",
  paid: "Pago",
  organic: "Orgánico",
  social: "Social",
  referral: "Referido",
  direct: "Directo",
  email: "Email",
};
function segLabel(label: string): string {
  return CHANNEL_LABELS[label] ?? label;
}

const hasComparison = computed(() => props.data.comparison != null);

/** Ancho de barra relativo a la primera etapa del segmento (0–100). */
function widthPct(stages: FunnelStage[], i: number): number {
  const base = stages[0]?.sessions ?? 0;
  if (!base) return 0;
  return Math.max((stages[i].sessions / base) * 100, stages[i].sessions > 0 ? 2 : 0);
}
function pct(v: number): string {
  return (v * 100).toFixed(1) + "%";
}

const primary = computed(() => props.data.primary);
const comparison = computed(() => props.data.comparison);
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h3 class="text-sm font-bold text-gray-700">Embudo de conversión (por sesión)</h3>
      <div v-if="hasComparison" class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
          <span class="text-gray-500">{{ segLabel(primary.label) }}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-amber-400 inline-block"></span>
          <span class="text-gray-500">{{ segLabel(comparison!.label) }}</span>
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div v-for="(st, i) in primary.stages" :key="st.event" class="flex flex-col gap-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-600">{{ st.label }}</span>
          <span class="text-gray-400 tabular-nums">
            <template v-if="i > 0">paso {{ pct(st.step_pct) }} · caída {{ pct(st.drop_pct) }}</template>
            <template v-else>inicio del embudo</template>
          </span>
        </div>

        <!-- Segmento principal -->
        <div class="flex items-center gap-2">
          <div class="flex-1 h-6 rounded-md bg-gray-100 overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-md transition-all flex items-center"
              :style="{ width: widthPct(primary.stages, i) + '%' }"
            ></div>
          </div>
          <span class="w-16 text-right text-sm font-bold text-gray-800 tabular-nums">
            {{ st.sessions.toLocaleString("es-CO") }}
          </span>
        </div>

        <!-- Segmento comparado -->
        <div v-if="hasComparison && comparison" class="flex items-center gap-2">
          <div class="flex-1 h-4 rounded-md bg-gray-50 overflow-hidden">
            <div
              class="h-full bg-amber-400 rounded-md transition-all"
              :style="{ width: widthPct(comparison.stages, i) + '%' }"
            ></div>
          </div>
          <span class="w-16 text-right text-xs font-semibold text-amber-600 tabular-nums">
            {{ (comparison.stages[i]?.sessions ?? 0).toLocaleString("es-CO") }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="primary.stages[0]?.sessions === 0" class="mt-4 text-sm text-gray-400 text-center">
      Aún no hay eventos de embudo (ViewContent→…→Purchase) en este rango. Los alimenta F3.
    </p>
  </div>
</template>
