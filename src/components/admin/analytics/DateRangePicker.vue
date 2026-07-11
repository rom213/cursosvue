<script lang="ts" setup>
import { reactive, watch } from "vue";

export interface RangeValue {
  date_from: string;
  date_to: string;
  compare: boolean;
  /** Vista de lote: instantes exactos (hora Bogotá). Cualquier cambio manual los limpia. */
  ts_from?: string | null;
  ts_to?: string | null;
}

const props = defineProps<{ modelValue: RangeValue }>();
const emit = defineEmits<{ (e: "update:modelValue", v: RangeValue): void }>();

const state = reactive<RangeValue>({ ...props.modelValue });

// Sincroniza si el padre cambia el rango (p. ej. reset).
watch(
  () => props.modelValue,
  (v) => Object.assign(state, v),
  { deep: true }
);

function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // fecha local del navegador (= día comercial Bogotá para el admin)
}

function emitChange() {
  emit("update:modelValue", {
    date_from: state.date_from,
    date_to: state.date_to,
    compare: state.compare,
  });
}

function applyQuick(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  state.date_from = localISO(from);
  state.date_to = localISO(to);
  emitChange();
}

const quickRanges = [
  { label: "Hoy", days: 1 },
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
];

function isActive(days: number): boolean {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return state.date_from === localISO(from) && state.date_to === localISO(to);
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        v-for="q in quickRanges"
        :key="q.days"
        class="px-3 py-1.5 text-xs font-semibold transition-colors"
        :class="isActive(q.days) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
        @click="applyQuick(q.days)"
      >
        {{ q.label }}
      </button>
    </div>

    <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
      <input
        type="date"
        v-model="state.date_from"
        class="text-xs text-gray-600 bg-transparent outline-none"
        @change="emitChange"
      />
      <span class="text-gray-300 text-xs">→</span>
      <input
        type="date"
        v-model="state.date_to"
        class="text-xs text-gray-600 bg-transparent outline-none"
        @change="emitChange"
      />
    </div>

    <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 cursor-pointer select-none">
      <input type="checkbox" v-model="state.compare" class="accent-blue-600" @change="emitChange" />
      Comparar
    </label>
  </div>
</template>
