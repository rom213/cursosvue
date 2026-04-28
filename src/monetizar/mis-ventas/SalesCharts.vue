<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import BalanceService from "../../services/BalanceService";
import type { ISail } from "../../types/Sail";
import { formatCOP } from "../utils";

interface Props {
  sales: ISail[];
  dateRange: { start: Date; end: Date };
}

const props = defineProps<Props>();

// Area Chart - Sales by Week
const areaChartSeries = ref<{ name: string; data: number[] }[]>([
  { name: "Ventas", data: [] },
]);
const areaChartOptions = ref({
  chart: {
    type: "area" as const,
    height: 300,
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
    animations: { enabled: true },
  },
  colors: ["#059669"], // Emerald
  fill: {
    type: "gradient" as const,
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: 3 },
  xaxis: {
    categories: [] as string[],
    tooltip: { enabled: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#64748B", fontSize: "10px" } },
  },
  yaxis: {
    labels: {
      style: { colors: "#64748B", fontSize: "10px" },
      formatter: (value: number) => formatCOP(value),
    },
  },
  grid: {
    borderColor: "#F1F5F9",
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
  },
  tooltip: {
    theme: "light" as const,
    y: { formatter: (val: number) => formatCOP(val) },
  },
});

// Donut Chart - Sales by Category
const donutChartSeries = ref<number[]>([]);
const donutChartOptions = ref({
  chart: {
    type: "donut" as const,
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
  },
  colors: ["#059669", "#10B981", "#34d399", "#6ee7b7", "#a7f3d0"],
  labels: [] as string[],
  legend: {
    position: "bottom" as const,
    fontSize: "12",
    fontFamily: "Inter, sans-serif",
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${Math.round(val)}%`,
  },
  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "14",
            fontFamily: "Inter, sans-serif",
          },
          value: {
            show: true,
            fontSize: "14",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
    },
  },
});

const isLoadingCharts = ref(false);

// Get weeks between dates
const getWeeksBetweenDates = (start: Date, end: Date) => {
  const weeks = [];
  let current = new Date(start);
  const endTime = end.getTime();

  while (current.getTime() <= endTime) {
    const weekStart = new Date(current);
    const weekEndRaw = new Date(current);
    weekEndRaw.setDate(weekEndRaw.getDate() + 6);

    const weekEnd = weekEndRaw.getTime() > endTime ? new Date(end) : weekEndRaw;

    weeks.push({ start: weekStart, end: weekEnd });

    const nextDay = new Date(weekEnd);
    nextDay.setDate(nextDay.getDate() + 1);
    current = nextDay;
  }
  return weeks;
};

const fetchChartData = async () => {
  if (
    !props.dateRange.start ||
    !props.dateRange.end ||
    props.sales.length === 0
  ) {
    return;
  }

  isLoadingCharts.value = true;

  try {
    // Fetch weekly sales data
    const weeks = getWeeksBetweenDates(props.dateRange.start, props.dateRange.end);
    const requests = weeks.map((week) =>
      BalanceService.getBalance(week.start, week.end)
    );
    const responses = await Promise.all(requests);

    const salesData = responses.map((res) => {
      return res ? res.courses_payments_value : 0;
    });

    const categories = weeks.map((w) => {
      const s = w.start.getDate() + "/" + (w.start.getMonth() + 1);
      const e = w.end.getDate() + "/" + (w.end.getMonth() + 1);
      return `${s} - ${e}`;
    });

    areaChartSeries.value = [{ name: "Ventas", data: salesData }];
    areaChartOptions.value = {
      ...areaChartOptions.value,
      xaxis: { ...areaChartOptions.value.xaxis, categories: categories },
    };

    // Calculate category distribution for donut chart
    const categoryMap: Record<string, number> = {};
    props.sales.forEach((sale) => {
      const category = sale.category_bought || "Sin categoría";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categories_labels = Object.keys(categoryMap);
    const categories_values = Object.values(categoryMap);

    donutChartSeries.value = categories_values;
    donutChartOptions.value = {
      ...donutChartOptions.value,
      labels: categories_labels,
    };
  } catch (error) {
    console.error("Error fetching chart data:", error);
  } finally {
    isLoadingCharts.value = false;
  }
};

onMounted(() => {
  fetchChartData();
});

watch(
  () => [props.sales, props.dateRange],
  () => {
    fetchChartData();
  },
  { deep: true }
);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Area Chart: Sales by Week -->
    <div class="relative bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Ventas por Semana</h3>
      <div v-show="isLoadingCharts" class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
      <VueApexCharts
        type="area"
        height="300"
        :options="areaChartOptions"
        :series="areaChartSeries"
      />
    </div>

    <!-- Donut Chart: Sales by Category -->
    <div class="relative bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Ventas por Categoría</h3>
      <div v-show="isLoadingCharts" class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
      </div>
      <VueApexCharts
        type="donut"
        height="350"
        :options="donutChartOptions"
        :series="donutChartSeries"
      />
    </div>
  </div>
</template>
