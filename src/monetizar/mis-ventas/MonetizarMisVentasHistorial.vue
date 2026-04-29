<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import SalesDateRangeSelector from "./SalesDateRangeSelector.vue";
import SalesTable from "./SalesTable.vue";
import MonetizarCalculatorFAB from "./MonetizarCalculatorFAB.vue";
import SailComponentEmergent from "../../components/auth/sales/salesHistory/sail.component.emergent.vue";
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
const selectedSail = ref<ISail | null>(null);
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

const openSail = (sale: ISail) => {
  selectedSail.value = sale;
};

const closeSail = () => {
  selectedSail.value = null;
};
</script>

<template>
  <main class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Historial de Ventas</h1>
        <p class="text-gray-600">
          Revisa el detalle completo de todas tus transacciones y comisiones
        </p>
      </div>

      <!-- Date Range Selector -->
      <div class="mb-8">
        <SalesDateRangeSelector v-model="dateRange" />
      </div>

      <!-- Sales Table -->
      <div class="mb-8">
        <SalesTable :sales="sales" :isLoading="isLoading" @select-sale="openSail" />
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="selectedSail"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
      >
        <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Detalle Venta</h3>
            <button
              type="button"
              class="text-2xl leading-none text-gray-500 hover:text-gray-700"
              aria-label="Cerrar detalle de venta"
              @click="closeSail"
            >
              &times;
            </button>
          </div>
          <SailComponentEmergent :item="selectedSail" />
        </div>
      </div>
    </transition>

    <!-- Floating Calculator -->
    <MonetizarCalculatorFAB />
  </main>
</template>
