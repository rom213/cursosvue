<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import type { ISail } from '../../../../types/Sail';
import SailService from '../../../../services/Sail';

import SailComponentEmergent from './sail.component.emergent.vue';

const refunds = ref<ISail[] | []>([])
const selectRefund = ref<ISail | null>(null)


const fechaInicio = ref('');
const fechaFin = ref('');

const fetchRefunds = async () => {

    if (!fechaInicio.value || !fechaFin.value) {
        console.warn("Las fechas de inicio y fin deben estar seleccionadas.");
        return;
    }

    const dateInicio = new Date(fechaInicio.value);
    const dateFin = new Date(fechaFin.value);

    dateFin.setDate(dateFin.getDate() + 1);


    try {
        const res = await SailService.getSailByUserAndDate(dateInicio, dateFin);
        refunds.value = res;
    } catch (error) {
        console.error("Error al obtener los reembolsos:", error);
        refunds.value = []; // Limpiar los reembolsos en caso de error
    }
}

onMounted(() => {

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);


    fechaInicio.value = primerDiaMes.toISOString().split('T')[0];
    fechaFin.value = hoy.toISOString().split('T')[0];

    fetchRefunds();
})

watch([fechaInicio, fechaFin], () => {

    fetchRefunds();
});



const onSelectRefund = (refund: ISail) => {
    selectRefund.value = refund
}
const onUnSelectRefund = () => {
    selectRefund.value = null
}

</script>

<template>
    <div class="relative">
        <div class="grid gap-1 mt-3">
            <div>
                <h2 class="px-3 text-xl font-bold">Historial de ventas</h2>
                <br>
                <h4 class="px-3">Selecciona el perido</h4>
                <div class="flex  gap-4 p-3">
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
                <div v-if="refunds.length === 0" class="text-center text-gray-500">
                    No se encontraron reembolsos en las fechas seleccionadas.
                </div>
                <div v-else v-for="(item, index) in refunds" :key="index" @click="onSelectRefund(item)"
                    class="bg-blue-400 text-white h-9 flex items-center justify-center font-bold rounded-sm cursor-pointer hover:bg-blue-500">
                    venta #{{ item.refer_id }}
                </div>
            </div>
        </div>
        <div v-if="selectRefund !== null" class="absolute h-screen w-screen top-0 flex justify-center bg-[#0000007a]">
            <div class="bg-white rounded-sm px-4 pb-4 w-[350px] h-fit mt-10">
                <div v-on:click="onUnSelectRefund()"
                    class="flex justify-end text-red-400 hover:scale-110 font-bold cursor-pointer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                            fill="black" />
                    </svg>
                </div>
                <SailComponentEmergent :item="selectRefund" />
            </div>
        </div>
    </div>
</template>