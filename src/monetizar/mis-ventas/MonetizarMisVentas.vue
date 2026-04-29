<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import SalesDateRangeSelector from "./SalesDateRangeSelector.vue";
import SalesCharts from "./SalesCharts.vue";
import SalesTable from "./SalesTable.vue";
import SalesKpiCard from "./SalesKpiCard.vue";
import CommissionStatusCard from "./CommissionStatusCard.vue";
import PaymentSummaryCard from "./PaymentSummaryCard.vue";
import MonetizarCalculatorFAB from "./MonetizarCalculatorFAB.vue";
import SailComponentEmergent from "../../components/auth/sales/salesHistory/sail.component.emergent.vue";
import BalanceService from "../../services/BalanceService";
import SailService from "../../services/Sail";
import { authStore } from "../../store/AuthStore";
import type { IBalance } from "../../types/Balance";
import type { ISail } from "../../types/Sail";
import {
  COMMISSION_RATE,
  endOfDay,
  filterSalesByDateRange,
  formatCurrencyCOP,
  parseNumber,
  startOfDay,
  toDateInputValue,
} from "./salesDashboardUtils";

interface DateRange {
  start: string;
  end: string;
}

interface KpiCard {
  title: string;
  value: string;
  helper: string;
  icon: string;
  tone: "blue" | "green" | "amber" | "slate";
}

const route = useRoute();
const storeAuth = authStore();

const today = new Date();
const dateRange = ref<DateRange>({
  start: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
  end: toDateInputValue(today),
});

const balance = ref<IBalance | null>(null);
const sales = ref<ISail[]>([]);
const selectedSail = ref<ISail | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");
const copyMessage = ref("");

const showDashboard = computed(() => route.name === "monetizar-mis-ventas");
const couponCode = computed(() => storeAuth.profile?.user?.codigo_referido?.trim() ?? "");

const filteredSales = computed(() =>
  filterSalesByDateRange(sales.value, dateRange.value.start, dateRange.value.end)
);

const hasInvalidDateRange = computed(() => {
  if (!dateRange.value.start || !dateRange.value.end) return true;
  return startOfDay(dateRange.value.start).getTime() > endOfDay(dateRange.value.end).getTime();
});

const kpiCards = computed<KpiCard[]>(() => {
  const currentBalance = balance.value;
  const salesCount = parseNumber(currentBalance?.count);

  return [
    {
      title: "Ventas atribuidas",
      value: salesCount.toLocaleString("es-CO"),
      helper: "en el periodo seleccionado",
      icon: iconChart,
      tone: "blue",
    },
    {
      title: "Facturación generada",
      value: formatCurrencyCOP(currentBalance?.courses_payments_value),
      helper: "valor total vendido",
      icon: iconWallet,
      tone: "blue",
    },
    {
      title: "Comisiones generadas",
      value: formatCurrencyCOP(currentBalance?.total_value_all_refunds),
      helper: "según ventas atribuidas",
      icon: iconTrending,
      tone: "green",
    },
    {
      title: "Comisiones pendientes",
      value: formatCurrencyCOP(currentBalance?.non_refunded_value),
      helper: "por confirmar o pagar",
      icon: iconClock,
      tone: "amber",
    },
    {
      title: "Comisiones pagadas",
      value: formatCurrencyCOP(currentBalance?.refunded_value),
      helper: "abonadas por administracion",
      icon: iconCheck,
      tone: "green",
    },
    {
      title: "Comisión del programa",
      value: `${Math.round(COMMISSION_RATE * 100)}%`,
      helper: "por cada venta válida",
      icon: iconPercent,
      tone: "slate",
    },
  ];
});

const dateRangeAsDates = computed(() => ({
  start: startOfDay(dateRange.value.start),
  end: endOfDay(dateRange.value.end),
}));

const fetchDashboard = async () => {
  if (!showDashboard.value) return;

  if (hasInvalidDateRange.value) {
    errorMessage.value = "Selecciona un rango de fechas válido para consultar tus ventas.";
    balance.value = null;
    sales.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const startDate = startOfDay(dateRange.value.start);
    const endDate = endOfDay(dateRange.value.end);
    const [balanceResponse, salesResponse] = await Promise.all([
      BalanceService.getBalance(startDate, endDate),
      SailService.getSailByUserAndDate(startDate, endDate),
    ]);

    balance.value = balanceResponse;
    sales.value = salesResponse || [];
  } catch {
    balance.value = null;
    sales.value = [];
    errorMessage.value = "No pudimos cargar tus ventas en este momento. Intenta nuevamente.";
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [dateRange.value.start, dateRange.value.end, route.name],
  () => {
    fetchDashboard();
  },
  { immediate: true }
);

const openSail = (sale: ISail) => {
  selectedSail.value = sale;
};

const closeSail = () => {
  selectedSail.value = null;
};

const copyCoupon = async () => {
  if (!couponCode.value) return;

  try {
    await navigator.clipboard.writeText(couponCode.value);
    copyMessage.value = "Cupón copiado al portapapeles";
  } catch {
    copyMessage.value = "No pudimos copiar el cupón. Intenta de nuevo.";
  }

  window.setTimeout(() => {
    copyMessage.value = "";
  }, 2400);
};

const iconChart = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3" /></svg>`;
const iconWallet = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19v14H5.5A2.5 2.5 0 0 1 3 16.5v-9Zm14 6h2" /></svg>`;
const iconTrending = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m4 16 5-5 4 4 7-7m0 0v5m0-5h-5" /></svg>`;
const iconClock = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
const iconCheck = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
const iconPercent = `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m19 5-14 14M8.5 8.5h.01M15.5 15.5h.01M10 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm7 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>`;
</script>

<template>
  <router-view v-if="!showDashboard" />

  <main v-else class="min-h-screen bg-[#F6F9FC] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl space-y-7">
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">Programa de afiliados</p>
          <h1 class="text-3xl font-bold tracking-tight text-[#0F1F3D] sm:text-4xl">
            Mis ventas y comisiones
          </h1>
          <p class="mt-3 text-base leading-7 text-slate-600">
            Monitorea tu desempeño como afiliado, consulta tus comisiones y analiza qué paquetes te generan más ingresos.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-if="couponCode"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100"
            @click="copyCoupon"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8M8 11h8m-8 4h5M5 3h14v18H5V3Z" />
            </svg>
            Copiar cupón
          </button>

          <RouterLink
            :to="{ name: 'monetizar-catalogo' }"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            Ver catálogo de paquetes
          </RouterLink>
        </div>
      </header>

      <transition name="fade">
        <div
          v-if="copyMessage"
          class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"
        >
          {{ copyMessage }}
        </div>
      </transition>

      <SalesDateRangeSelector v-model="dateRange" />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
      >
        {{ errorMessage }}
      </div>

      <section v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div
          v-for="item in 6"
          :key="item"
          class="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      </section>

      <section v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <SalesKpiCard
          v-for="card in kpiCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :helper="card.helper"
          :icon="card.icon"
          :tone="card.tone"
        />
      </section>

      <SalesCharts :sales="filteredSales" :date-range="dateRangeAsDates" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CommissionStatusCard :sales="filteredSales" />
        <PaymentSummaryCard :balance="balance" />
      </div>

      <SalesTable :sales="filteredSales" :is-loading="isLoading" @select-sale="openSail" />
    </div>

    <transition name="fade">
      <div
        v-if="selectedSail"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
      >
        <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between gap-4">
            <h3 class="text-lg font-bold text-[#0F1F3D]">Detalle de venta</h3>
            <button
              type="button"
              class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar detalle de venta"
              @click="closeSail"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SailComponentEmergent :item="selectedSail" />
        </div>
      </div>
    </transition>

    <MonetizarCalculatorFAB />
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
