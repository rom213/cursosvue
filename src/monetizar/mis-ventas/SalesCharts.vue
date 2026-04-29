<script lang="ts" setup>
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import type { ISail } from "../../types/Sail";
import {
  formatCurrencyCOP,
  groupSalesByCategory,
  groupSalesByWeek,
} from "./salesDashboardUtils";

interface Props {
  sales: ISail[];
  dateRange: { start: Date; end: Date };
}

const props = defineProps<Props>();

const trendPoints = computed(() =>
  groupSalesByWeek(props.sales, props.dateRange.start, props.dateRange.end)
);

const hasTrendData = computed(() =>
  trendPoints.value.some((point) => point.sales > 0 || point.billing > 0 || point.commission > 0)
);

const trendSeries = computed(() => [
  {
    name: "Facturación",
    data: trendPoints.value.map((point) => point.billing),
  },
  {
    name: "Comisiones",
    data: trendPoints.value.map((point) => point.commission),
  },
  {
    name: "Ventas",
    data: trendPoints.value.map((point) => point.sales),
  },
]);

const trendOptions = computed(() => ({
  chart: {
    type: "area" as const,
    height: 360,
    fontFamily: "Inter, system-ui, sans-serif",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#2563EB", "#00A86B", "#64748B"],
  dataLabels: { enabled: false },
  stroke: {
    curve: "smooth" as const,
    width: [3, 3, 2],
  },
  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.24,
      opacityTo: 0.03,
      stops: [0, 95],
    },
  },
  grid: {
    borderColor: "#E5EAF0",
    strokeDashArray: 4,
  },
  legend: {
    position: "top" as const,
    horizontalAlign: "left" as const,
    fontSize: "12px",
    labels: { colors: "#475569" },
    markers: { size: 5 },
  },
  xaxis: {
    categories: trendPoints.value.map((point) =>
      point.isCurrentPeriod ? `${point.label} (Periodo en curso)` : point.label
    ),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: "#64748B", fontSize: "11px" },
      rotate: -15,
    },
    tooltip: { enabled: false },
  },
  yaxis: [
    {
      seriesName: "Facturación",
      labels: {
        style: { colors: "#64748B", fontSize: "11px" },
        formatter: (value: number) => formatCurrencyCOP(value),
      },
    },
    {
      seriesName: "Comisiones",
      show: false,
      labels: {
        formatter: (value: number) => formatCurrencyCOP(value),
      },
    },
    {
      seriesName: "Ventas",
      opposite: true,
      labels: {
        style: { colors: "#64748B", fontSize: "11px" },
        formatter: (value: number) => `${Math.round(value)} ventas`,
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
    theme: "light",
    y: [
      { formatter: (value: number) => formatCurrencyCOP(value) },
      { formatter: (value: number) => formatCurrencyCOP(value) },
      { formatter: (value: number) => `${Math.round(value)} ventas` },
    ],
  },
}));

const topCategories = computed(() => groupSalesByCategory(props.sales, 6));

const maxCategoryCommission = computed(() => {
  return Math.max(...topCategories.value.map((item) => item.commission), 0);
});

const getCategoryWidth = (commission: number): string => {
  if (maxCategoryCommission.value <= 0) return "0%";
  return `${Math.max(8, Math.round((commission / maxCategoryCommission.value) * 100))}%`;
};
</script>

<template>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
    <section class="rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-[#0F1F3D]">Rendimiento en el periodo</h2>
          <p class="mt-1 text-sm text-slate-500">
            Ventas, facturación y comisiones generadas en el rango seleccionado.
          </p>
        </div>
        <span class="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {{ sales.length }} ventas
        </span>
      </div>

      <div v-if="hasTrendData" class="min-h-[320px]">
        <VueApexCharts
          type="area"
          height="360"
          :options="trendOptions"
          :series="trendSeries"
        />
      </div>

      <div v-else class="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
        <div>
          <p class="font-semibold text-slate-700">Aún no hay datos suficientes para graficar.</p>
          <p class="mt-1 text-sm text-slate-500">Cuando tengas ventas en este periodo, verás tu tendencia aquí.</p>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-5">
        <h2 class="text-lg font-bold text-[#0F1F3D]">Top categorías por comisión</h2>
        <p class="mt-1 text-sm text-slate-500">
          Paquetes que más dinero generaron para ti.
        </p>
      </div>

      <div v-if="topCategories.length > 0" class="space-y-4">
        <div v-for="category in topCategories" :key="category.name" class="space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-700" :title="category.name">
                {{ category.name }}
              </p>
              <p class="text-xs text-slate-500">{{ category.salesCount }} ventas</p>
            </div>
            <p class="shrink-0 text-sm font-bold text-emerald-700">
              {{ formatCurrencyCOP(category.commission) }}
            </p>
          </div>
          <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" :style="{ width: getCategoryWidth(category.commission) }" />
          </div>
        </div>
      </div>

      <div v-else class="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
        <div>
          <p class="font-semibold text-slate-700">Sin categorías para mostrar</p>
          <p class="mt-1 text-sm text-slate-500">El ranking aparecerá cuando existan ventas en el periodo.</p>
        </div>
      </div>
    </section>
  </div>
</template>
