<script lang="ts" setup>
import type { ISail } from '../../../../types/Sail';
const props = defineProps<{ item: ISail | null }>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
    <!-- Afiliación -->
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Datos de Afiliación</h3>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Tipo Afiliación</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.affiliaty || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Categoría Comprada</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.category_bought || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Precio Categoría</label>
        <p class="text-base font-medium text-gray-800">${{ props.item?.category_price || '0' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Ganancia Vendedor</label>
        <p class="text-base font-medium text-gray-800">${{ props.item?.refund_price || '0' }}</p>
      </div>
    </div>

    <!-- Detalles -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Detalles de Venta</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-500">Fecha Venta</label>
          <p class="text-base font-medium text-gray-800">
            {{ props.item ? new Date(props.item.created_at).toLocaleDateString() : '-' }}
          </p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Referencia</label>
          <p class="text-base font-medium text-gray-800">{{ props.item?.refer_id || '-' }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Porcentaje Desembolso</label>
          <p class="text-base font-medium text-gray-800">{{ props.item?.porcetage_refund || 0 }}%</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Estado</label>
          <p :class="['text-base font-medium', props.item?.is_refund ? 'text-green-500' : 'text-red-500']">
            {{ props.item?.is_refund ? 'COMPLETADA' : 'PENDIENTE' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Voucher -->
    <div class="space-y-2 col-span-full">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Voucher</h3>
      <div class="flex justify-center">
        <a
          v-if="props.item?.baucher_image"
          :href="`http://127.0.0.1:5002/api/${props.item.baucher_image}`"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 100-18 9 9 0 000 18z" />
          </svg>
          Ver Voucher
        </a>
        <span v-else class="text-gray-500">Sin voucher disponible</span>
      </div>
    </div>
  </div>
</template>
