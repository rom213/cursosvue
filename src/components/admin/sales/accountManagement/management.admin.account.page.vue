<script lang="ts" setup>
import { onMounted, ref, watch, computed } from "vue";
import BalanceService from "../../../../services/BalanceService";
import FooterComponent from "../../../footer/footer.component.vue";
import type { IRecordBalance, IPendingRefund } from "../../../../types/admin/ReferAdmin";
import ManagementAdminRefundFormComponent from "./management.admin.refund.form.component.vue";
import { AdminRefundService } from "../../../../services/AdminService";
import SalesStatisticsWidget from "../widgets/SalesStatisticsWidget.vue";

const initialBalanceState: IRecordBalance = {
  count: 0,
  courses_payments_value: 0,
  non_refunded_value: 0,
  refunded_value: 0,
  total_value_all_refunds: 0,
  list_ids_refers: [],
};

const balance = ref<IRecordBalance>({ ...initialBalanceState });
const fechaInicio = ref("");
const fechaFin = ref("");
const isLoading = ref(false);
const searchTerm = ref("");
const isSearchByGoogleId = ref(false);
const formRefund = ref(false);
const pendingRefunds = ref<IPendingRefund[]>([]);
const pendingRefundsPage = ref(1);
const pendingRefundsTotalPages = ref(1);
const loadingPending = ref(false);

// --- Propiedad Computada ---
const balanceRender = computed(() => [
  { title: "Total cursos vendidos", value: balance.value.count, prefix: "" },
  {
    title: "Ventas del periodo",
    value: balance.value.courses_payments_value,
    prefix: "$",
  },
  { title: "Reembolsado", value: balance.value.refunded_value, prefix: "$" },
  {
    title: "Sin reembolsar",
    value: balance.value.non_refunded_value,
    prefix: "$",
  },
  {
    title: "Ganancias netas",
    value: balance.value.total_value_all_refunds,
    prefix: "$",
  },
  {
    title: "Cant. Reembolsos",
    value: balance.value.list_ids_refers?.length || 0,
    prefix: "",
  },
]);

const usersWithOutPay = async (page = 1) => {
  loadingPending.value = true;
  try {
    const res = await AdminRefundService.getUsersWithOutPay(page);
    if (res.status === "success" || res.records) {
      pendingRefunds.value = res.records[0];
      pendingRefundsPage.value = res.pagination?.current_page || 1;
      pendingRefundsTotalPages.value = res.pagination?.pages || 1;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingPending.value = false;
  }
};

const selectUser = (user: any) => {
  isSearchByGoogleId.value = true;
  searchTerm.value = user.google_id;
  // Trigger search logic if needed, watching searchTerm usually handles it
};

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > pendingRefundsTotalPages.value) return;
  usersWithOutPay(newPage);
};



// --- Funciones ---
const fetchBalance = async () => {
  if (!fechaInicio.value || !fechaFin.value) return;
  isLoading.value = true;
  try {
    const dateInicio = new Date(fechaInicio.value);
    const dateFinObj = new Date(fechaFin.value);
    dateFinObj.setDate(dateFinObj.getDate() + 1);
    const dt = await BalanceService.getAllBalance(dateInicio, dateFinObj);
    balance.value = dt.records[0];
  } catch (error) {
    console.error("Error al obtener el balance:", error);
    balance.value = { ...initialBalanceState };
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async (
  google_id: string,
  dateInit: Date,
  dateEnd: Date
) => {
  try {
    if (google_id.length > 1) {
      let dt = await BalanceService.getBalanceByGoogleId(
        dateInit,
        dateEnd,
        google_id
      );
      console.log(dt);
      balance.value = dt.records[0];
    }
  } catch (error) {}
};

const openFormPayment = () => {
    formRefund.value = true;
}

const closeFormPayment = () => {
    formRefund.value = false;
}

const handleRefundSaved = () => {
    // Refresh data
    fetchBalance();
    usersWithOutPay(pendingRefundsPage.value);
    
    // Also refresh specific search if active
    if (isSearchByGoogleId.value && searchTerm.value.length > 1) {
       const dateInicio = new Date(fechaInicio.value);
       const dateFinObj = new Date(fechaFin.value);
       handleSearch(searchTerm.value, dateInicio, dateFinObj);
    }
}

// --- Hooks de Ciclo de Vida ---
onMounted(() => {
  const hoy = new Date();
  fechaInicio.value = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  fechaFin.value = hoy.toISOString().split("T")[0];
});

watch([fechaInicio, fechaFin], ()=>{
  if (isSearchByGoogleId.value) {
    handleSearch(searchTerm.value, new Date(fechaInicio.value), new Date(fechaFin.value));
    return;
  }
  fetchBalance()

}, { immediate: true });

watch(searchTerm, (newValue) => {
  const dateInicio = new Date(fechaInicio.value);
  const dateFinObj = new Date(fechaFin.value);
  handleSearch(newValue, dateInicio, dateFinObj);
});

watch(isSearchByGoogleId,(val)=>{
  if (!val) {
      fetchBalance()
  }
})

onMounted(()=>{
  usersWithOutPay();
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Gestión de Cuentas
        </h1>
        <p class="text-sm text-gray-500 mt-1">Administra los pagos y reembolsos de la plataforma</p>
      </div>
    </header>

    <!-- Loader Overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50"
    >
      <svg
        class="animate-spin h-12 w-12 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
    </div>

    <!-- Content -->
    <div class="flex flex-grow overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-[300px] bg-white shadow-md flex flex-col border-r z-10">
        <div class="p-4 border-b bg-gray-50">
          <h2 class="font-semibold text-gray-700">Pendientes de Reembolso</h2>
        </div>
        
        <div class="flex-grow overflow-y-auto p-2 space-y-2">
          <div v-if="loadingPending" class="flex justify-center p-4">
            <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
          
          <template v-else>
            <div 
              v-for="(item, index) in pendingRefunds" 
              :key="index"
              @click="selectUser(item.user)"
              class="p-3 rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors group"
            >
              <div class="flex items-start gap-3 relative">
                <div class="absolute -top-3 right-0 text-xs">
                    {{item.user.google_id}}
                </div>
                <img 
                  :src="item.user.picture || 'https://via.placeholder.com/40'" 
                  alt="User" 
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.user.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ item.user.email }}</p>
                  <div class="flex justify-between mt-2 text-xs">
                    <span class="text-gray-600">Debe: <span class="font-bold text-red-600">${{ item.total_owed }}</span></span>
                    <span class="bg-blue-100 text-blue-800 px-2 rounded-full">{{ item.refers_count }} ref</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="pendingRefunds.length === 0" class="text-center py-8 text-gray-500 text-sm">
              No hay usuarios pendientes
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t bg-gray-50 flex justify-between items-center text-sm">
          <button 
            @click="changePage(pendingRefundsPage - 1)" 
            :disabled="pendingRefundsPage <= 1"
            class="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          <span class="text-gray-600">Pag {{ pendingRefundsPage }} de {{ pendingRefundsTotalPages }}</span>
          <button 
            @click="changePage(pendingRefundsPage + 1)" 
            :disabled="pendingRefundsPage >= pendingRefundsTotalPages"
            class="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      </aside>

      <main class="flex-grow container mx-auto p-6 overflow-y-auto">
        <!-- Date Filters -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div class="flex flex-col lg:flex-row lg:items-end gap-6">
            <div class="w-full lg:w-auto">
              <label
                for="fecha-inicio"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Fecha Inicio</label
              >
              <input
                type="date"
                id="fecha-inicio"
                v-model="fechaInicio"
                class="w-full lg:w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
              />
            </div>
            <div class="w-full lg:w-auto">
              <label
                for="fecha-fin"
                class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >Fecha Fin</label
              >
              <input
                type="date"
                id="fecha-fin"
                v-model="fechaFin"
                class="w-full lg:w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
              />
            </div>
            
            <div class="flex-1 w-full lg:w-auto flex flex-col justify-end">
               <div class="flex items-center gap-3 mb-2" >
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="buscarId" v-model="isSearchByGoogleId" class="peer absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"/>
                    <label for="buscarId" class="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-blue-600"></label>
                </div>
                <label for="buscarId" class="text-sm font-medium text-gray-600 cursor-pointer">Buscar por ID</label>
              </div>

              <div class="relative w-full" v-if="isSearchByGoogleId">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="searchTerm"
                  class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Buscar usuario..."
                />
                 <button 
                  @click="openFormPayment()" 
                  v-if="searchTerm.length > 1" 
                  class="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-xs px-3 transition-colors shadow-sm"
                >
                  PAGAR
                </button>
              </div>
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
            <p class="text-gray-500 uppercase tracking-wide text-sm">
              {{ item.title }}
            </p>
            <div class="mt-4 flex items-baseline space-x-1">
              <span class="text-2xl font-bold">{{ item.prefix }}</span>
              <span class="text-4xl font-extrabold text-blue-600">{{
                item.value
              }}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Footer -->
    <FooterComponent />
  </div>
  <div class="absolute top-0 bg-white" v-if="formRefund">
    <ManagementAdminRefundFormComponent 
      @close="closeFormPayment" 
      @saved="handleRefundSaved"
      :date_init="fechaInicio" 
      :date_end="fechaFin" 
      :google_id="searchTerm" 
      :list_ids_refers="balance.list_ids_refers" 
      :amount_to_pay="balance.non_refunded_value" 
    />
  </div>
  
  <!-- Sales Statistics Widget (Fixed Bottom Right) -->
  <SalesStatisticsWidget 
    :google-id="isSearchByGoogleId ? searchTerm : undefined"
  />
</template>
