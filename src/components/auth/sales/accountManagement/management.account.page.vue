<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';
import type { IBalance } from '../../../../types/Balance';
import BalanceService from '../../../../services/BalanceService';
import FooterComponent from '../../../footer/footer.component.vue';

// Estado inicial centralizado para reutilizarlo
const initialBalanceState: IBalance = {
  count: 0,
  courses_payments_value: 0,
  non_refunded_value: 0,
  refunded_value: 0,
  total_value_all_refunds: 0,
  list_ids_refers: []
};

// --- Refs de estado ---
const balance = ref<IBalance>({ ...initialBalanceState });
const fechaInicio = ref('');
const fechaFin = ref('');
const isLoading = ref(false);

// --- Propiedad Computada ---
const balanceRender = computed(() => [
  { title: 'Total cursos vendidos', value: balance.value.count, prefix: '' },
  { title: 'Ventas del periodo', value: balance.value.courses_payments_value, prefix: '$' },
  { title: 'Reembolsado', value: balance.value.refunded_value, prefix: '$' },
  { title: 'Sin reembolsar', value: balance.value.non_refunded_value, prefix: '$' },
  { title: 'Ganancias netas', value: balance.value.total_value_all_refunds, prefix: '$' }
]);

// --- Funciones ---
const fetchBalance = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  isLoading.value = true;
  try {
    const dateInicio = new Date(fechaInicio.value);
    const dateFinObj = new Date(fechaFin.value);
    dateFinObj.setDate(dateFinObj.getDate() + 1);
    balance.value = await BalanceService.getBalance(dateInicio, dateFinObj);
  } catch (error) {
    console.error('Error al obtener el balance:', error);
    balance.value = { ...initialBalanceState };
  } finally {
    isLoading.value = false;
  }
};

// --- Hooks de Ciclo de Vida ---
onMounted(() => {
  const hoy = new Date();
  fechaInicio.value = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  fechaFin.value = hoy.toISOString().split('T')[0];
});

watch([fechaInicio, fechaFin], fetchBalance, { immediate: true });
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-md">
      <h1 class="text-3xl font-semibold text-white text-center">Manejo de Cuentas</h1>
    </header>

    <!-- Loader Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
      <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
    </div>

    <!-- Content -->
    <main class="flex-grow container mx-auto p-6">
      <!-- Date Filters -->
      <section class="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 class="text-xl font-medium mb-4">Selecciona el periodo</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="fecha-inicio" class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              id="fecha-inicio"
              v-model="fechaInicio"
              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            />
          </div>
          <div>
            <label for="fecha-fin" class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              id="fecha-fin"
              v-model="fechaFin"
              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            />
          </div>
        </div>
      </section>

      <!-- Balance Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="item in balanceRender"
          :key="item.title"
          class="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200"
        >
          <p class="text-gray-500 uppercase tracking-wide text-sm">{{ item.title }}</p>
          <div class="mt-4 flex items-baseline space-x-1">
            <span class="text-2xl font-bold">{{ item.prefix }}</span>
            <span class="text-4xl font-extrabold text-blue-600">{{ item.value }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
      <FooterComponent />
  </div>
</template>
