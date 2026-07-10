<script lang="ts" setup>
import { ref, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import type { TimeSeries } from "../../../services/AnalyticsService";

const props = withDefaults(
  defineProps<{
    current: TimeSeries;
    previous: TimeSeries;
    compare?: boolean;
  }>(),
  { compare: true }
);

type Metric = "visitors" | "sessions" | "revenue";
const metric = ref<Metric>("visitors");
const metrics: { value: Metric; label: string }[] = [
  { value: "visitors", label: "Visitantes" },
  { value: "sessions", label: "Sesiones" },
  { value: "revenue", label: "Ingresos" },
];

const isCurrency = computed(() => metric.value === "revenue");

const series = computed(() => {
  const out = [{ name: "Periodo actual", data: props.current[metric.value] ?? [] }];
  if (props.compare) {
    out.push({ name: "Periodo anterior", data: props.previous[metric.value] ?? [] });
  }
  return out;
});

const options = computed(() => ({
  chart: {
    type: "line" as const,
    height: 300,
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#2563EB", "#CBD5E1"],
  stroke: { curve: "smooth" as const, width: [3, 2], dashArray: [0, 5] },
  dataLabels: { enabled: false },
  legend: { position: "top" as const, horizontalAlign: "right" as const, fontSize: "12px" },
  xaxis: {
    categories: props.current.labels ?? [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#94A3B8", fontSize: "10px" }, rotate: -45, hideOverlappingLabels: true },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      style: { colors: "#94A3B8", fontSize: "10px" },
      formatter: (v: number) =>
        isCurrency.value ? "$" + Math.round(v).toLocaleString("es-CO") : Math.round(v).toString(),
    },
  },
  grid: { borderColor: "#F1F5F9", strokeDashArray: 4 },
  tooltip: {
    theme: "light",
    y: {
      formatter: (v: number) =>
        isCurrency.value ? "$" + v.toLocaleString("es-CO") : v.toLocaleString("es-CO"),
    },
  },
}));
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-bold text-gray-700">Tendencia</h3>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          v-for="m in metrics"
          :key="m.value"
          class="px-3 py-1 text-xs font-semibold transition-colors"
          :class="metric === m.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
          @click="metric = m.value"
        >
          {{ m.label }}
        </button>
      </div>
    </div>
    <VueApexCharts type="line" height="300" :options="options" :series="series" />
  </div>
</template>
