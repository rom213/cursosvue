<script lang="ts" setup>
import type { IRecordItemRefund } from '../../../../types/admin/ReferAdmin';

const props = defineProps<{ item: IRecordItemRefund | null }>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
    <!-- Emitente -->
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Datos Cuenta Emisora</h3>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Tipo de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.type_acc_em || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Número de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.number_acc_em || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Titular</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.titular_acc_em || '-' }}</p>
      </div>
    </div>

    <!-- Destino -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Datos Cuenta Destino</h3>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Tipo de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.type_acc_re }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Número de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.number_acc_res || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Titular</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.titular_acc_res || '-' }}</p>
      </div>
    </div>

    <!-- Detalles de Reembolso -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Detalles del Reembolso</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-500">Valor</label>
          <p class="text-base font-medium text-gray-800">{{ props.item?.value }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Fecha</label>
          <p class="text-base font-medium text-gray-800">{{ new Date(props.item?.created_at || '').toLocaleDateString() }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Código Pago</label>
          <p class="text-base font-medium text-gray-800 break-words">{{ props.item?.code_reference || '-' }}</p>
        </div>
      </div>
    </div>
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Referidos</h3>
      <div v-if="props.item?.refers" class="overflow-x-auto max-h-[300px] overflow-y-auto border rounded-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Referido</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor reembolso</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor curso</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="it in props.item?.refers" :key="it.refer_id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it?.refer_id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it?.value }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it?.valor_curso }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it?.porcentage }}%</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(it?.created_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-sm text-gray-500">
        No hay información de referidos disponible.
      </div>
    </div>
    <!-- Voucher -->
    <div class="space-y-2 col-span-full">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Voucher</h3>
      <div class="flex justify-center">
        <a
          v-if="props.item?.image"
          :href="`http://127.0.0.1:5002/api/managment/${props.item.image}`"
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
