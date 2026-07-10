<script lang="ts" setup>
import { computed } from "vue";
import type { RetentionResponse, RetentionCell } from "../../../services/AnalyticsService";

const props = defineProps<{ data: RetentionResponse }>();

const weeks = computed(() => props.data.weeks);
const cohorts = computed(() => props.data.grid);
const ftp = computed(() => props.data.free_to_paid);

/** ¿Hay alguna cohorte con usuarios? (si no, mostramos estado vacío guiado). */
const hasData = computed(() => cohorts.value.some((c) => c.size > 0));

function weekLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

/** Color de celda por retención (0–1): azul cada vez más saturado; texto claro cuando es intenso. */
function cellStyle(cell: RetentionCell | null): Record<string, string> {
  if (!cell) return { background: "transparent" };
  const alpha = 0.08 + cell.pct * 0.85;
  return {
    background: `rgba(37, 99, 235, ${alpha.toFixed(3)})`,
    color: cell.pct > 0.55 ? "#fff" : "#374151",
  };
}
function cellText(cell: RetentionCell | null): string {
  if (!cell) return "";
  return (cell.pct * 100).toFixed(0) + "%";
}

const cohortLabel = computed(() =>
  props.data.cohort === "free_view" ? "1ª vista gratis" : "Primer visita"
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Heatmap de cohortes -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 class="text-sm font-bold text-gray-700">
          Retención por cohorte semanal · {{ cohortLabel }}
        </h3>
        <span class="text-[11px] text-gray-400">% de la cohorte activo N semanas después</span>
      </div>

      <div v-if="!hasData" class="p-6 text-center text-sm text-gray-400">
        Aún no hay cohortes con datos suficientes (se necesitan ≥2–4 semanas de historia). Lo alimentan
        F1–F2 acumulando FirstVisit/actividad por anonymous_id.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="text-xs border-separate" style="border-spacing: 2px">
          <thead>
            <tr class="text-gray-400">
              <th class="text-left font-semibold px-2 py-1 whitespace-nowrap">Cohorte</th>
              <th class="text-right font-semibold px-2 py-1">Usuarios</th>
              <th v-for="k in weeks" :key="k" class="text-center font-semibold px-2 py-1 w-12">
                S{{ k - 1 }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cohorts" :key="c.week">
              <td class="text-left text-gray-600 font-medium px-2 py-1 whitespace-nowrap">
                {{ weekLabel(c.week) }}
              </td>
              <td class="text-right text-gray-800 font-bold px-2 py-1 tabular-nums">
                {{ c.size.toLocaleString("es-CO") }}
              </td>
              <td
                v-for="(cell, i) in c.cells"
                :key="i"
                class="text-center rounded-md tabular-nums font-semibold h-8 min-w-[3rem]"
                :style="cellStyle(cell)"
                :title="cell ? `${cell.n} de ${c.size}` : 'Aún no observable'"
              >
                {{ cellText(cell) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Gratis → pago -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-700">Gratis → pago</h3>
        <span class="text-[11px] text-gray-400">excluye compradores previos</span>
      </div>

      <div v-if="ftp.free_users === 0" class="p-4 text-center text-sm text-gray-400">
        Aún no hay usuarios con una primera vista gratis (is_free) en la ventana. Lo alimenta F3.
      </div>

      <template v-else>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <div class="text-[11px] uppercase text-gray-400 font-semibold">Gratis-primero</div>
            <div class="text-lg font-bold text-gray-800 tabular-nums">
              {{ ftp.free_users.toLocaleString("es-CO") }}
            </div>
          </div>
          <div>
            <div class="text-[11px] uppercase text-gray-400 font-semibold">Convierten a pago</div>
            <div class="text-lg font-bold text-gray-800 tabular-nums">
              {{ ftp.converted.toLocaleString("es-CO") }}
            </div>
          </div>
          <div>
            <div class="text-[11px] uppercase text-gray-400 font-semibold">Conversión</div>
            <div class="text-lg font-bold text-emerald-600 tabular-nums">
              {{ (ftp.conversion_rate * 100).toFixed(1) }}%
            </div>
          </div>
          <div>
            <div class="text-[11px] uppercase text-gray-400 font-semibold">Mediana días</div>
            <div class="text-lg font-bold text-gray-800 tabular-nums">
              {{ ftp.median_days === null ? "—" : ftp.median_days }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="text-[11px] uppercase text-gray-400 font-semibold mb-1">
            Tiempo hasta la compra
          </div>
          <div
            v-for="b in ftp.distribution"
            :key="b.bucket"
            class="flex items-center gap-2 text-xs"
          >
            <span class="w-20 text-gray-500 shrink-0">{{ b.label }}</span>
            <div class="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
              <div
                class="h-full bg-blue-500/70 rounded"
                :style="{ width: (ftp.converted ? (b.n / ftp.converted) * 100 : 0) + '%' }"
              ></div>
            </div>
            <span class="w-8 text-right font-semibold text-gray-700 tabular-nums">{{ b.n }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
