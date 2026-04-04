<script lang="ts" setup>
import { computed } from "vue";
import type { ISail } from "../../types/Sail";
import { formatCOP } from "../utils";

interface Props {
  sales: ISail[];
  isLoading: boolean;
}

const props = defineProps<Props>();

const formattedSales = computed(() => {
  return props.sales.map((sale) => ({
    ...sale,
    fechaFormato: new Date(sale.created_at).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  }));
});

const isEmpty = computed(() => !props.sales || props.sales.length === 0);
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
    <!-- Loading State -->
    <div v-if="isLoading" class="h-64 flex items-center justify-center">
      <div class="text-center">
        <div class="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
        <p class="text-sm text-gray-500">Cargando ventas...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="h-64 flex items-center justify-center">
      <div class="text-center">
        <svg class="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 font-medium">No hay ventas en este periodo</p>
        <p class="text-sm text-gray-400 mt-1">Selecciona un rango de fechas diferente</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Categoría
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Precio
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tu Comisión
            </th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ref ID
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="sale in formattedSales"
            :key="sale.refer_id"
            class="hover:bg-emerald-50/30 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ sale.fechaFormato }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
              {{ sale.category_bought }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
              {{ formatCOP(Number(sale.category_price)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 text-right">
              {{ formatCOP(Number(sale.refund_price)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  sale.is_refund
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ sale.is_refund ? "Abonado" : "Pendiente" }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500 font-mono">
              {{ sale.refer_id }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer Info -->
    <div v-if="!isEmpty && !isLoading" class="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
      <p>Total de ventas: <span class="font-semibold text-gray-700">{{ props.sales.length }}</span></p>
    </div>
  </div>
</template>
