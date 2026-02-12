<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import BalanceService from '../../../../services/BalanceService';

const props = defineProps<{
  googleId?: string;
}>();

// State
const isCollapsed = ref(false);
const isLoading = ref(false);
const startDate = ref('');
const endDate = ref('');
const chartSeries = ref<{ name: string; data: number[] }[]>([{ name: 'Ventas', data: [] }]);
const chartOptions = ref({
  chart: {
    type: 'area',
    height: 250,
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
    animations: { enabled: true }
  },
  colors: ['#2563EB'], // Blue-600
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: [] as string[],
    tooltip: { enabled: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748B', fontSize: '10px' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#64748B', fontSize: '10px' },
      formatter: (value: number) => `$${value.toLocaleString()}`
    }
  },
  grid: {
    borderColor: '#F1F5F9',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } }
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (val: number) => `$${val.toLocaleString()}` }
  }
});

// Logic to calculate weeks
const getWeeksBetweenDates = (start: Date, end: Date) => {
  const weeks = [];
  let current = new Date(start);
  const endTime = end.getTime();

  while (current.getTime() <= endTime) {
    const weekStart = new Date(current);
    // End of week is start + 6 days, or endDate if sooner
    const weekEndRaw = new Date(current);
    weekEndRaw.setDate(weekEndRaw.getDate() + 6);
    
    // If weekEnd goes past the customized End Date, clamp it
    const weekEnd = weekEndRaw.getTime() > endTime ? new Date(end) : weekEndRaw;
    
    weeks.push({ start: weekStart, end: weekEnd });
    
    // Advance to next week (start of next week is weekEnd + 1 day? No, usually start + 7 days from previous start)
    // To ensure we cover seamlessly: next start is weekEnd + 1 day?
    // Let's stick to: Next iteration starts at weekEnd + 1 day.
    const nextDay = new Date(weekEnd);
    nextDay.setDate(nextDay.getDate() + 1);
    current = nextDay;
  }
  return weeks;
};

const fetchData = async () => {
    if (!startDate.value || !endDate.value) return;
    
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    
    // Validation
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    isLoading.value = true;
    
    try {
        const weeks = getWeeksBetweenDates(start, end);
        
        // Parallel requests
        const requests = weeks.map(week => {
             if (props.googleId && props.googleId.length > 1) {
                return BalanceService.getBalanceByGoogleId(week.start, week.end, props.googleId);
            }
            return BalanceService.getAllBalance(week.start, week.end);
        });
        const responses = await Promise.all(requests);
        
        const salesData = responses.map((res) => {
            // Check structure of res. Support both IBalance and IApiResponseBalance flow if needed, 
            // but Service returns IApiResponseBalance for getAllBalance.
            // based on previous file view: getAllBalance returns IApiResponseBalance, which has records[0] as IRecordBalance
            const record = res.records && res.records.length > 0 ? res.records[0] : null;
            return record ? record.courses_payments_value : 0;
        });
        
        const categories = weeks.map(w => {
            const s = w.start.getDate() + '/' + (w.start.getMonth() + 1);
            const e = w.end.getDate() + '/' + (w.end.getMonth() + 1);
            return `${s} - ${e}`;
        });
        
        // Update Chart
        chartSeries.value = [{ name: 'Ventas', data: salesData }];
        chartOptions.value = {
            ...chartOptions.value,
            xaxis: { ...chartOptions.value.xaxis, categories: categories }
        };
        
    } catch (e) {
        console.error("Error fetching chart data", e);
    } finally {
        isLoading.value = false;
    }
};

// Toggle
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// Initial Setup
onMounted(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    startDate.value = lastMonth.toISOString().split('T')[0];
    endDate.value = today.toISOString().split('T')[0];
});

watch([startDate, endDate, () => props.googleId], () => {
    fetchData();
});
</script>

<template>
  <div 
    class="fixed bottom-6 right-6 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 transition-all duration-300 ease-in-out font-sans flex flex-col"
    :class="[isCollapsed ? 'w-64 h-14' : 'w-[450px] h-auto']"
  >
    <!-- Header -->
    <div 
        class="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 rounded-t-2xl"
        @click="toggleCollapse"
    >
      <div class="flex items-center gap-2">
        <div class="p-1.5 bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
               <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
        </div>
        <div>
            <h3 class="font-bold text-gray-800 text-sm">Resumen de Ventas</h3>
            <p v-if="isCollapsed" class="text-xs text-gray-400">Click para expandir</p>
        </div>
      </div>
      
      <button class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div v-if="!isCollapsed" class="p-5 bg-white rounded-b-2xl">
      <!-- Date Controls -->
      <div class="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-100">
        <div class="flex-1">
            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Inicio</label>
            <input 
                type="date" 
                v-model="startDate" 
                class="w-full bg-white border border-gray-200 rounded-lg text-xs px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-600"
            >
        </div>
        <div class="text-gray-300 mt-4">→</div>
        <div class="flex-1">
            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Fin</label>
            <input 
                type="date" 
                v-model="endDate" 
                class="w-full bg-white border border-gray-200 rounded-lg text-xs px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-600"
            >
        </div>
      </div>

      <!-- Chart Area -->
      <div class="relative min-h-[250px]">
          <div v-if="isLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl">
             <svg class="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
             </svg>
             <span class="text-xs font-semibold text-gray-500">Actualizando datos...</span>
          </div>
          
          <VueApexCharts
            type="area" 
            height="250" 
            :options="chartOptions" 
            :series="chartSeries"
          ></VueApexCharts>
      </div>
      
      <div class="mt-2 flex justify-between items-center text-xs text-gray-400 px-1">
         <span>Datos actualizados</span>
         <span>Sales Analytics Pro</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth slide animation for collapse */
.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
}
</style>
