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
    total_value_all_refunds: 0
};

// --- Refs de estado ---
const balance = ref<IBalance>({ ...initialBalanceState });
const fechaInicio = ref('');
const fechaFin = ref('');
const isLoading = ref(false); // 👈 (2) Añadido estado de carga

// --- Propiedad Computada ---
// (1) Reemplaza a balance_render y handleBalanceRender.
// Se actualiza automáticamente cuando 'balance.value' cambia.
const balanceRender = computed(() => [
    {
        title: "Total cursos vendidos",
        value: balance.value.count,
        prefix: '' // 👈 (4) Lógica de prefijo movida aquí
    },
    {
        title: "Total Ventas del periodo",
        value: balance.value.courses_payments_value,
        prefix: '$'
    },
    {
        title: "Total Reembolsado",
        value: balance.value.refunded_value,
        prefix: '$'
    },
    {
        title: "Total Sin Reembolsar",
        value: balance.value.non_refunded_value,
        prefix: '$'
    },
    {
        title: "Total Ganancias",
        value: balance.value.total_value_all_refunds,
        prefix: '$'
    },
]);

// --- Funciones ---
const fetchBalance = async () => {
    if (!fechaInicio.value || !fechaFin.value) {
        console.warn("Las fechas de inicio y fin deben estar seleccionadas.");
        return;
    }

    isLoading.value = true; // Inicia la carga
    try {
        const dateInicio = new Date(fechaInicio.value);
        const dateFin = new Date(fechaFin.value);
        
        // Se ajusta la fecha final para incluir el día completo en la consulta
        dateFin.setDate(dateFin.getDate() + 1);

        balance.value = await BalanceService.getBalance(dateInicio, dateFin);
    } catch (error) {
        console.error("Error al obtener el balance:", error);
        balance.value = { ...initialBalanceState }; // Resetea el balance en caso de error
    } finally {
        isLoading.value = false; // Finaliza la carga, tanto en éxito como en error
    }
}

// --- Hooks de Ciclo de Vida ---
onMounted(() => {
    const hoy = new Date();
    // (5) Forma más estándar de obtener el primer día del mes
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    fechaInicio.value = primerDiaMes.toISOString().split('T')[0];
    fechaFin.value = hoy.toISOString().split('T')[0];

    // La llamada inicial se hará a través del watcher
});

// El watcher observa los cambios en las fechas y vuelve a llamar a la API
watch([fechaInicio, fechaFin], fetchBalance, { immediate: true });

</script>

<template>
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <p>Cargando datos...</p>
    </div>

    <div class="relative">
        <div class="grid gap-1 mt-3">
            <div>
                <h2 class="text-center text-xl font-bold">Manejo de cuentas</h2>
                <br>
                <h4 class="px-3">Selecciona el periodo</h4>
                <div class="flex gap-4 p-3">
                    <div class="grid">
                        <label for="fecha-inicio" class="text-sm font-medium">Fecha Inicio:</label>
                        <input type="date" id="fecha-inicio" v-model="fechaInicio" class="border rounded-md p-1.5">
                    </div>
                    <div class="grid">
                        <label for="fecha-fin" class="text-sm font-medium">Fecha Fin:</label>
                        <input type="date" id="fecha-fin" v-model="fechaFin" class="border rounded-md p-1.5">
                    </div>
                </div>
            </div>
            
            <div class="p-3 grid gap-1.5">
                <div class="grid gap-2" v-for="item in balanceRender" :key="item.title">
                    <div class="grid grid-cols-2 gap-2">
                        <div class="border border-black rounded-sm p-2 h-10">{{ item.title }}</div>
                        <div class="bg-blue-50 border border-black rounded-sm h-11 flex px-2 items-center justify-end font-bold text-xl">
                            <p>{{ item.prefix }}</p>{{ item.value }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="absolute bottom-0 w-full">
        <FooterComponent />
    </div>
</template>