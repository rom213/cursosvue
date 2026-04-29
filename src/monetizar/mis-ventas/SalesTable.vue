<script lang="ts" setup>
import { computed } from "vue";
import type { ISail } from "../../types/Sail";
import {
  calculateCommission,
  formatCurrencyCOP,
  formatDate,
  getSaleAmount,
  getSaleCategory,
} from "./salesDashboardUtils";

interface Props {
  sales: ISail[];
  isLoading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "select-sale", sale: ISail): void;
}>();

const formattedSales = computed(() =>
  props.sales.map((sale) => ({
    ...sale,
    saleDate: formatDate(sale.created_at),
    categoryName: getSaleCategory(sale),
    saleAmount: getSaleAmount(sale),
    commission: calculateCommission(sale),
    statusLabel: sale.is_refund ? "Abonada" : "Pendiente",
    statusClass: sale.is_refund
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-amber-50 text-amber-700 ring-amber-100",
  }))
);

const isEmpty = computed(() => !props.sales || props.sales.length === 0);
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-sm">
    <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-[#0F1F3D]">Historial de ventas</h2>
          <p class="mt-1 text-sm text-slate-500">Detalle de transacciones atribuidas a tu afiliación.</p>
        </div>
        <span v-if="!isLoading && !isEmpty" class="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {{ sales.length }} registros
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="flex h-72 items-center justify-center">
      <div class="text-center">
        <div class="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p class="text-sm font-medium text-slate-500">Cargando ventas...</p>
      </div>
    </div>

    <div v-else-if="isEmpty" class="flex min-h-[18rem] items-center justify-center px-6 text-center">
      <div class="max-w-md">
        <div class="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 14h6m-6 4h6M6 3h8l4 4v14H6V3Z" />
          </svg>
        </div>
        <p class="text-lg font-bold text-[#0F1F3D]">Aún no tienes ventas en este periodo</p>
        <p class="mt-2 text-sm text-slate-500">
          Comparte tu enlace de afiliado o promociona los paquetes con mejor conversión.
        </p>
      </div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Fecha</th>
            <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Paquete o categoría</th>
            <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Valor de venta</th>
            <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Tu comisión</th>
            <th class="px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Estado</th>
            <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Ref ID</th>
            <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="sale in formattedSales"
            :key="sale.refer_id"
            tabindex="0"
            class="cursor-pointer transition hover:bg-blue-50/40 focus:bg-blue-50/50 focus:outline-none"
            @click="emit('select-sale', sale)"
            @keydown.enter="emit('select-sale', sale)"
            @keydown.space.prevent="emit('select-sale', sale)"
          >
            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
              {{ sale.saleDate }}
            </td>
            <td class="max-w-[18rem] px-5 py-4 text-sm font-medium text-slate-700">
              <span class="block truncate" :title="sale.categoryName">{{ sale.categoryName }}</span>
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600">
              {{ formatCurrencyCOP(sale.saleAmount) }}
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-emerald-700">
              {{ formatCurrencyCOP(sale.commission) }}
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-center">
              <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1" :class="sale.statusClass">
                {{ sale.statusLabel }}
              </span>
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-right font-mono text-xs text-slate-500">
              {{ sale.refer_id || "-" }}
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-right">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                @click.stop="emit('select-sale', sale)"
              >
                Ver detalle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
