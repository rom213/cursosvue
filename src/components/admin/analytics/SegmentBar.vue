<script lang="ts" setup>
import { reactive, watch } from "vue";

export interface SegmentValue {
  channel: string | null;
  device: string | null;
}

const props = defineProps<{ modelValue: SegmentValue }>();
const emit = defineEmits<{ (e: "update:modelValue", v: SegmentValue): void }>();

const state = reactive<SegmentValue>({ ...props.modelValue });
watch(() => props.modelValue, (v) => Object.assign(state, v), { deep: true });

// `null` = "Todos". Los canales espejan `derive_channel` del backend.
const channels = [
  { value: null, label: "Todos" },
  { value: "paid", label: "Pago" },
  { value: "organic", label: "Orgánico" },
  { value: "social", label: "Social" },
  { value: "referral", label: "Referido" },
  { value: "direct", label: "Directo" },
  { value: "email", label: "Email" },
];
const devices = [
  { value: null, label: "Todos" },
  { value: "mobile", label: "Móvil" },
  { value: "desktop", label: "Escritorio" },
];

function setChannel(v: string | null) {
  state.channel = v;
  emit("update:modelValue", { ...state });
}
function setDevice(v: string | null) {
  state.device = v;
  emit("update:modelValue", { ...state });
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
    <div class="flex items-center gap-1.5">
      <span class="text-[11px] uppercase font-bold text-gray-400">Canal</span>
      <button
        v-for="c in channels"
        :key="c.label"
        class="px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors"
        :class="state.channel === c.value
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'"
        @click="setChannel(c.value)"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="flex items-center gap-1.5">
      <span class="text-[11px] uppercase font-bold text-gray-400">Dispositivo</span>
      <button
        v-for="d in devices"
        :key="d.label"
        class="px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors"
        :class="state.device === d.value
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'"
        @click="setDevice(d.value)"
      >
        {{ d.label }}
      </button>
    </div>
  </div>
</template>
