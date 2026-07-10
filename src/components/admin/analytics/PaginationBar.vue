<script lang="ts" setup>
import { computed } from "vue";

/**
 * Barra de paginación reutilizable ("← Anterior | X–Y de N | Siguiente →").
 * Se oculta sola cuando todo cabe en una página (`total <= limit`).
 * Emite `page(1)` / `page(-1)`; el padre mueve su offset y recarga.
 */
const props = defineProps<{ offset: number; limit: number; total: number }>();
const emit = defineEmits<{ (e: "page", dir: 1 | -1): void }>();

const from = computed(() => (props.total === 0 ? 0 : props.offset + 1));
const to = computed(() => Math.min(props.offset + props.limit, props.total));
const canPrev = computed(() => props.offset > 0);
const canNext = computed(() => props.offset + props.limit < props.total);
</script>

<template>
  <div v-if="total > limit" class="flex items-center justify-end gap-2">
    <button
      class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      :disabled="!canPrev"
      @click="emit('page', -1)"
    >
      ← Anterior
    </button>
    <span class="text-xs text-gray-400 tabular-nums">
      {{ from }}–{{ to }} de {{ total.toLocaleString("es-CO") }}
    </span>
    <button
      class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      :disabled="!canNext"
      @click="emit('page', 1)"
    >
      Siguiente →
    </button>
  </div>
</template>
