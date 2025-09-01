<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';
import RefundService from '../../../../services/Refund';
import type { IRefund } from '../../../../types/Refund';
import RefundComponentEmergent from './refund.component.emergent.vue';

// --- Estado ---
const refunds = ref<IRefund[]>([]);
const selectedRefund = ref<IRefund | null>(null);
const fechaInicio = ref('');
const fechaFin = ref('');
const isLoading = ref(false);

// --- Computed para mostrar texto de fechas ---
const periodText = computed(() => `From ${fechaInicio.value} to ${fechaFin.value}`);

// --- Fetch ---
const fetchRefunds = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  isLoading.value = true;
  try {
    const dateInicio = new Date(fechaInicio.value);
    const dateFinObj = new Date(fechaFin.value);
    dateFinObj.setDate(dateFinObj.getDate() + 1);
    refunds.value = await RefundService.getRefundsByUserAndDate(dateInicio, dateFinObj);
  } catch (err) {
    console.error('Error al obtener reembolsos:', err);
    refunds.value = [];
  } finally {
    isLoading.value = false;
  }
};

// --- Ciclo de vida ---
onMounted(() => {
  const today = new Date();
  fechaInicio.value = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
  fechaFin.value = today.toISOString().split('T')[0];
  fetchRefunds();
});

watch([fechaInicio, fechaFin], fetchRefunds);

// --- Handlers ---
const openRefund = (refund: IRefund) => selectedRefund.value = refund;
const closeRefund = () => selectedRefund.value = null;
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-indigo-600 p-6 shadow-md">
      <h1 class="text-3xl font-bold text-white text-center">Historial de Reembolsos</h1>
    </header>

    <!-- Loader -->
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>

    <!-- Content -->
    <main class="container mx-auto flex-grow p-6">
      <!-- Fechas -->
      <section class="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 class="text-xl font-medium mb-2 text-gray-700">Selecciona el periodo</h2>
        <p class="text-sm text-gray-500 mb-4">{{ periodText }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600">Fecha Inicio</label>
            <input type="date" v-model="fechaInicio"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Fecha Fin</label>
            <input type="date" v-model="fechaFin"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2" />
          </div>
        </div>
      </section>

      <!-- Lista de Reembolsos -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-if="refunds.length === 0" class="col-span-full text-center text-gray-500">
          No se encontraron reembolsos en las fechas seleccionadas.
        </div>
        <div v-for="refund in refunds" :key="refund.refund_id"
             @click="openRefund(refund)"
             class="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <p class="text-gray-500 text-sm">Reembolso #{{ refund.refund_id }}</p>
          <p class="text-gray-800 font-semibold mt-2">{{ refund.value }}</p>
          <p class="text-gray-400 text-xs mt-1">{{ new Date(refund.created_at).toLocaleDateString() }}</p>
        </div>
      </section>
    </main>

    <!-- Modal Emergent -->
    <transition name="fade">
      <div v-if="selectedRefund" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-700">Detalle de Reembolso</h3>
            <button @click="closeRefund" class="text-red-500 hover:text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <RefundComponentEmergent :item="selectedRefund" />
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <footer class="bg-gray-100 p-4">
      <!-- Puedes mantener tu FooterComponent aquí -->
      <FooterComponent />
    </footer>
  </div>
</template>
