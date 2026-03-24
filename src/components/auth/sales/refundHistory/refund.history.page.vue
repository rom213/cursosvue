<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';
import RefundComponentEmergent from './refund.component.emergent.vue';
import { AdminRefundService } from '../../../../services/AdminService';
import type { IRecordItemRefund } from '../../../../types/admin/ReferAdmin';
import { authStore } from '../../../../store/AuthStore';

// --- Estado ---
const recordsRefund = ref<IRecordItemRefund[]>([]);
const selectedRefund = ref<IRecordItemRefund | null>(null);
const fechaInicio = ref('');
const fechaFin = ref('');
const isLoading = ref(false);
const searchTerm = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const totalRecords = ref(0);
const totalPages = ref(0);
const authstore = authStore();

// Debounce timer para la búsqueda
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// --- Computed ---
const periodText = computed(() => `From ${fechaInicio.value} to ${fechaFin.value}`);

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * perPage.value + 1;
  const end = Math.min(currentPage.value * perPage.value, totalRecords.value);
  return {
    start,
    end,
    total: totalRecords.value
  };
});

// Calcular páginas visibles para la paginación
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

// --- Fetch ---
const fetchRefunds = async (resetPage = false) => {
  if (!fechaInicio.value || !fechaFin.value) return;
  
  if (resetPage) {
    currentPage.value = 1;
  }
  
  isLoading.value = true;
  try {
    const dateInicio = new Date(fechaInicio.value);
    const dateFinObj = new Date(fechaFin.value);
    const google_id = authstore.getProfile()?.user?.google_id;
    const response = await AdminRefundService.getSearchRefunds(
      dateInicio,
      dateFinObj,
      google_id,
      currentPage.value,
      perPage.value
    );

    if (response.status === 'success') {
      recordsRefund.value = response.records.filter(dt=>{
        return dt.user.google_id==google_id
      });
      if (response.pagination) {
        totalRecords.value = response.pagination.total;
        totalPages.value = response.pagination.pages;
        currentPage.value = response.pagination.current_page;
      }
    } else {
      console.error('Error:', response.message);
      recordsRefund.value = [];
      totalRecords.value = 0;
      totalPages.value = 0;
    }
  } catch (err) {
    console.error('Error al obtener reembolsos:', err);
    recordsRefund.value = [];
    totalRecords.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// --- Búsqueda con debounce ---
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    fetchRefunds(true); // Reset a página 1 al buscar
  }, 500); // Espera 500ms después de que el usuario deje de escribir
};

// --- Paginación handlers ---
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    fetchRefunds();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchRefunds();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchRefunds();
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

// Watch para fechas (resetear a página 1)
watch([fechaInicio, fechaFin], () => fetchRefunds(true));

// Watch para búsqueda con debounce
watch(searchTerm, handleSearch);

// --- Handlers ---
const openRefund = (refund: IRecordItemRefund) => selectedRefund.value = refund;

const closeRefund = () => selectedRefund.value = null;

watch(()=>authstore.profile, (value) => {
  if (value?.user?.google_id) {
    fetchRefunds();
  }
});
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



      <!-- Tabla de Reembolsos -->
      <section class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Google ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="recordsRefund.length === 0">
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                  {{ searchTerm ? 'No se encontraron reembolsos que coincidan con la búsqueda' : 'No se encontraron reembolsos en las fechas seleccionadas' }}
                </td>
              </tr>
              <tr 
                v-for="refund in recordsRefund" 
                :key="refund.refund_id"
                @click="openRefund(refund)"
                class="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ refund.refund_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ refund.google_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ refund?.user?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ refund?.user?.email || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ refund?.value || refund.value }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(refund?.created_at || refund.created_at).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalRecords > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Info -->
            <div class="text-sm text-gray-600">
              Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ paginationInfo.total }} reembolsos
            </div>
            
            <!-- Pagination Controls -->
            <div class="flex items-center gap-2">
              <!-- First Page -->
              <button 
                @click="goToPage(1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                ««
              </button>
              
              <!-- Previous -->
              <button 
                @click="prevPage"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                ‹
              </button>
              
              <!-- Page Numbers -->
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
              
              <!-- Next -->
              <button 
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                ›
              </button>
              
              <!-- Last Page -->
              <button 
                @click="goToPage(totalPages)"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal Emergent -->
    <transition name="fade">
      <div v-if="selectedRefund" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-[800px] mx-4">
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

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>