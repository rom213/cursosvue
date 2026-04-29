<script lang="ts" setup>
import type { IBalance } from "../../types/Balance";
import { formatCurrencyCOP, parseNumber } from "./salesDashboardUtils";

interface Props {
  balance: IBalance | null;
}

const props = defineProps<Props>();

const getValue = (key: keyof IBalance): number => {
  return parseNumber(props.balance?.[key]);
};
</script>

<template>
  <section class="rounded-2xl border border-[#E5EAF0] bg-white p-6 shadow-sm">
    <div class="mb-5">
      <h2 class="text-lg font-bold text-[#0F1F3D]">Resumen de pago</h2>
      <p class="mt-1 text-sm text-slate-500">Detalle de liquidación disponible según tus ventas.</p>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <span class="text-sm font-medium text-slate-600">Disponible para pago</span>
        <span class="text-sm font-bold text-amber-700">{{ formatCurrencyCOP(getValue("non_refunded_value")) }}</span>
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <span class="text-sm font-medium text-slate-600">Pendiente por confirmar</span>
        <span class="text-sm font-bold text-amber-700">{{ formatCurrencyCOP(getValue("non_refunded_value")) }}</span>
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <span class="text-sm font-medium text-slate-600">Ya pagado</span>
        <span class="text-sm font-bold text-emerald-700">{{ formatCurrencyCOP(getValue("refunded_value")) }}</span>
      </div>
    </div>

    <div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
      <p class="text-sm font-medium text-blue-800">Próximo corte</p>
      <p class="mt-1 text-sm text-blue-700">
        Las fechas de pago serán informadas por el equipo administrativo.
      </p>
    </div>
  </section>
</template>
