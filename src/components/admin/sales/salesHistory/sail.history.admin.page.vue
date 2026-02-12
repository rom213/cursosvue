<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';
import type { ISail } from '../../../../types/Sail';
import SailService from '../../../../services/Sail';
import SailComponentEmergent from './sail.admin.component.emergent.vue';

const sails = ref<ISail[]>([]);
const selectedSail = ref<ISail | null>(null);
const fechaInicio = ref('');
const fechaFin = ref('');
const isLoading = ref(false);
const periodLabel = computed(() => `${fechaInicio.value} → ${fechaFin.value}`);

const fetchSails = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  isLoading.value = true;
  try {
    const start = new Date(fechaInicio.value);
    const end = new Date(fechaFin.value);
    end.setDate(end.getDate() + 1);
    sails.value = await SailService.getSailByUserAndDate(start, end);
  } catch (e) {
    console.error('Error fetching sales:', e);
    sails.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const today = new Date();
  fechaInicio.value = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
  fechaFin.value = today.toISOString().split('T')[0];
  fetchSails();
});
watch([fechaInicio, fechaFin], fetchSails);

const openSail = (s: ISail) => selectedSail.value = s;
const closeSail = () => selectedSail.value = null;
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-green-600 text-white p-5 shadow">
      <h1 class="text-2xl font-bold text-center">Historial de Ventas</h1>
    </header>
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
      <svg class="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
    <main class="flex-grow container mx-auto p-6">
      <section class="bg-white rounded-xl shadow p-6 mb-8">
        <h2 class="text-lg font-medium text-gray-700 mb-2">Selecciona periodo</h2>
        <p class="text-sm text-gray-500 mb-4">{{ periodLabel }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600">Fecha Inicio</label>
            <input type="date" v-model="fechaInicio" class="mt-1 w-full border-gray-300 rounded p-2 focus:ring-green-500 focus:border-green-500"/>
          </div>
          <div>
            <label class="block text-sm text-gray-600">Fecha Fin</label>
            <input type="date" v-model="fechaFin" class="mt-1 w-full border-gray-300 rounded p-2 focus:ring-green-500 focus:border-green-500"/>
          </div>
        </div>
      </section>
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-if="!isLoading && sails.length === 0" class="col-span-full text-center text-gray-500">
          No hay ventas en este periodo.
        </div>
        <div v-for="sale in sails" :key="sale.refer_id" @click="openSail(sale)"
             class="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer">
          <p class="text-sm text-gray-500">Venta #{{ sale.refer_id }}</p>
          <p class="text-lg font-bold text-green-600 mt-1">{{ sale.refund_price }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ new Date(sale.created_at).toLocaleDateString() }}</p>
        </div>
      </section>
    </main>
    <transition name="fade">
      <div v-if="selectedSail" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Detalle Venta</h3>
            <button @click="closeSail" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <SailComponentEmergent :item="selectedSail" />
        </div>
      </div>
    </transition>
    <footer class="bg-gray-100 p-4 text-center">
      <!-- FooterComponent aquí -->
    </footer>
  </div>
</template>
