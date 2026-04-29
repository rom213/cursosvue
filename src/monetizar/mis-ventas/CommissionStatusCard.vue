<script lang="ts" setup>
import { computed } from "vue";
import {
  formatCurrencyCOP,
  getCommissionStatusTotals,
} from "./salesDashboardUtils";
import type { ISail } from "../../types/Sail";

interface Props {
  sales: ISail[];
}

const props = defineProps<Props>();

const totals = computed(() => getCommissionStatusTotals(props.sales));

const paidPercent = computed(() => {
  if (totals.value.total <= 0) return 0;
  return Math.round((totals.value.paid / totals.value.total) * 100);
});

const pendingPercent = computed(() => {
  if (totals.value.total <= 0) return 0;
  return 100 - paidPercent.value;
});
</script>

<template>
  <section class="rounded-2xl border border-[#E5EAF0] bg-white p-6 shadow-sm">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-[#0F1F3D]">Estado de tus comisiones</h2>
        <p class="mt-1 text-sm text-slate-500">Pagos abonados y comisiones pendientes del periodo.</p>
      </div>
      <span class="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
        {{ sales.length }} ventas
      </span>
    </div>

    <div v-if="totals.total > 0" class="mb-5 h-3 overflow-hidden rounded-full bg-slate-100">
      <div class="flex h-full">
        <div class="bg-emerald-500" :style="{ width: `${paidPercent}%` }" />
        <div class="bg-amber-400" :style="{ width: `${pendingPercent}%` }" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Pagadas</p>
        <p class="mt-2 text-xl font-bold text-emerald-700">{{ formatCurrencyCOP(totals.paid) }}</p>
        <p class="mt-1 text-xs text-emerald-700/80">{{ totals.paidCount }} ventas abonadas</p>
      </div>

      <div class="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Pendientes</p>
        <p class="mt-2 text-xl font-bold text-amber-700">{{ formatCurrencyCOP(totals.pending) }}</p>
        <p class="mt-1 text-xs text-amber-700/80">{{ totals.pendingCount }} ventas por pagar</p>
      </div>
    </div>
  </section>
</template>
