<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    delta?: number | null;
    format?: "number" | "currency" | "percent";
    /** true cuando bajar es bueno (no usado en P1, previsto para caídas de abandono). */
    invertDelta?: boolean;
  }>(),
  { delta: null, format: "number", invertDelta: false }
);

const formatted = computed(() => {
  const v = props.value ?? 0;
  if (props.format === "currency")
    return "$" + v.toLocaleString("es-CO", { maximumFractionDigits: 0 });
  if (props.format === "percent") return (v * 100).toFixed(1) + "%";
  return v.toLocaleString("es-CO");
});

const hasDelta = computed(() => props.delta !== null && props.delta !== undefined);
const deltaClass = computed(() => {
  if (!hasDelta.value) return "text-gray-400";
  const positive = (props.delta as number) >= 0;
  const good = props.invertDelta ? !positive : positive;
  return good ? "text-emerald-600" : "text-red-500";
});
const deltaText = computed(() => {
  if (!hasDelta.value) return "—";
  const d = props.delta as number;
  return (d >= 0 ? "▲ " : "▼ ") + Math.abs(d).toFixed(1) + "%";
});
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-1">
    <span class="text-xs uppercase tracking-wide text-gray-400 font-semibold truncate">{{ label }}</span>
    <span class="text-2xl font-bold text-gray-800">{{ formatted }}</span>
    <span class="text-xs font-semibold" :class="deltaClass">
      {{ deltaText }}
      <span class="text-gray-400 font-normal">vs. anterior</span>
    </span>
  </div>
</template>
