<script lang="ts" setup>
import type { IRefund } from '../../../../types/Refund';

const props = defineProps<{ item: IRefund | null }>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Datos Cuenta Emisora</h3>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Tipo de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.type_acc_em || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Numero de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.number_acc_em || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Titular</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.titular_acc_em || '-' }}</p>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Datos Cuenta Destino</h3>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Tipo de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.type_acc_re || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Numero de Cuenta</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.number_acc_res || '-' }}</p>
      </div>
      <div class="flex flex-col space-y-2">
        <label class="text-sm text-gray-500">Titular</label>
        <p class="text-base font-medium text-gray-800">{{ props.item?.titular_acc_res || '-' }}</p>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Detalles del Reembolso</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-500">Valor</label>
          <p class="text-base font-medium text-gray-800">{{ props.item?.value || '-' }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Fecha</label>
          <p class="text-base font-medium text-gray-800">
            {{ props.item?.created_at ? new Date(props.item.created_at).toLocaleDateString() : '-' }}
          </p>
        </div>
        <div>
          <label class="text-sm text-gray-500">Codigo Pago</label>
          <p class="text-base font-medium text-gray-800 break-words">{{ props.item?.code_reference || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Referido</h3>
      <div class="text-sm text-gray-500">
        Referido #{{ props.item?.refer_id || '-' }} - {{ props.item?.porcetage_refund || '-' }}%
      </div>
    </div>

    <div class="space-y-2 col-span-full">
      <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Voucher</h3>
      <div class="flex justify-center">
        <a
          v-if="props.item?.image"
          :href="props.item.image"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow"
        >
          Ver Voucher
        </a>
        <span v-else class="text-gray-500">Sin voucher disponible</span>
      </div>
    </div>
  </div>
</template>
