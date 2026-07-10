<script lang="ts" setup>
import { downloadCsv } from "../../../utils/csv";

const props = withDefaults(
  defineProps<{
    filename: string;
    /** Filas planas ya cargadas (se exportan tal cual). Se acepta cualquier objeto plano. */
    rows: unknown[];
    /** Texto del botón (por defecto "CSV"). */
    label?: string;
  }>(),
  { label: "CSV" }
);

function go() {
  downloadCsv(props.filename, props.rows as Record<string, unknown>[]);
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    :disabled="!rows || rows.length === 0"
    title="Exportar a CSV"
    @click="go"
  >
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    {{ label }}
  </button>
</template>
