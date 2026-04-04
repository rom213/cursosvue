<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import SalesDateRangeSelector from "./SalesDateRangeSelector.vue";
import SalesCharts from "./SalesCharts.vue";
import MonetizarCalculatorFAB from "./MonetizarCalculatorFAB.vue";
import SailService from "../../services/Sail";
import type { ISail } from "../../types/Sail";

interface DateRange {
  start: string;
  end: string;
}

const dateRange = ref<DateRange>({
  start: "",
  end: "",
});

const sales = ref<ISail[]>([]);
const isLoading = ref(false);

const fetchData = async () => {
  if (!dateRange.value.start || !dateRange.value.end) return;

  isLoading.value = true;

  try {
    const startDate = new Date(dateRange.value.start);
    const endDate = new Date(dateRange.value.end);

    const salesResponse = await SailService.getSailByUserAndDate(startDate, endDate);
    sales.value = salesResponse || [];
  } catch (error) {
    console.error("Error fetching sales data:", error);
    sales.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  dateRange.value = {
    start: firstDayOfMonth.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  };

  fetchData();
});

watch(dateRange, () => {
  fetchData();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gráficos de Ventas</h1>
        <p class="text-gray-600">
          Analiza tus ventas por semana y distribución por categoría
        </p>
      </div>

      <!-- Date Range Selector -->
      <div class="mb-8">
        <SalesDateRangeSelector v-model="dateRange" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
          <p class="text-gray-500">Cargando gráficos...</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-else class="mb-8">
        <SalesCharts
          :sales="sales"
          :dateRange="{
            start: new Date(dateRange.start),
            end: new Date(dateRange.end),
          }"
        />
      </div>
    </div>

    <!-- Floating Calculator -->
    <MonetizarCalculatorFAB />
  </main>
</template>
