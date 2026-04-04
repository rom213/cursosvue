<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue";
import SalesDateRangeSelector from "./SalesDateRangeSelector.vue";
import MonetizarCalculatorFAB from "./MonetizarCalculatorFAB.vue";
import BalanceService from "../../services/BalanceService";
import type { IBalance } from "../../types/Balance";
import { formatCOP } from "../utils";

interface DateRange {
  start: string;
  end: string;
}

const dateRange = ref<DateRange>({
  start: "",
  end: "",
});

const balance = ref<IBalance | null>(null);
const isLoading = ref(false);

const kpiCards = computed(() => [
  {
    label: "Total de Ventas",
    value: balance.value?.count || 0,
    unit: "ventas",
    icon: "📊",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Monto Total Vendido",
    value: formatCOP(balance.value?.courses_payments_value || 0),
    unit: "",
    icon: "💰",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Reembolsado",
    value: formatCOP(balance.value?.refunded_value || 0),
    unit: "",
    icon: "✓",
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Por Pagar",
    value: formatCOP(balance.value?.non_refunded_value || 0),
    unit: "",
    icon: "⏳",
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Ganancia Neta",
    value: formatCOP(balance.value?.total_value_all_refunds || 0),
    unit: "",
    icon: "🎯",
    color: "bg-purple-50 text-purple-600",
  },
]);

const fetchData = async () => {
  if (!dateRange.value.start || !dateRange.value.end) return;

  isLoading.value = true;

  try {
    const startDate = new Date(dateRange.value.start);
    const endDate = new Date(dateRange.value.end);

    const balanceResponse = await BalanceService.getBalance(startDate, endDate);
    balance.value = balanceResponse || null;
  } catch (error) {
    console.error("Error fetching balance data:", error);
    balance.value = null;
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
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Resumen de Ventas</h1>
        <p class="text-gray-600">
          Visualiza tus KPIs principales y el desempeño general
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
          <p class="text-gray-500">Cargando datos...</p>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          v-for="(card, idx) in kpiCards"
          :key="idx"
          class="rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:shadow-md transition"
          :class="card.color"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide opacity-75">
                {{ card.label }}
              </p>
              <p class="text-2xl font-bold mt-2">{{ card.value }}</p>
              <p v-if="card.unit" class="text-xs opacity-75 mt-1">{{ card.unit }}</p>
            </div>
            <div class="text-4xl">{{ card.icon }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Calculator -->
    <MonetizarCalculatorFAB />
  </main>
</template>
