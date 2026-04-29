<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  title: string;
  value: string | number;
  helper: string;
  icon: string;
  tone?: "blue" | "green" | "amber" | "slate";
}

const props = withDefaults(defineProps<Props>(), {
  tone: "slate",
});

const valueText = computed(() => String(props.value));
const isLongValue = computed(() => valueText.value.length >= 12);

const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  slate: "bg-slate-50 text-slate-600 ring-slate-100",
};
</script>

<template>
  <article class="sales-kpi-card rounded-2xl border border-[#E5EAF0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ title }}
        </p>
        <p
          class="kpi-value mt-3 whitespace-nowrap font-bold leading-none tracking-normal text-[#0F1F3D]"
          :class="isLongValue ? 'kpi-value-long' : 'kpi-value-regular'"
          :title="valueText"
        >
          {{ value }}
        </p>
        <p class="mt-2 text-xs text-slate-500">
          {{ helper }}
        </p>
      </div>

      <span
        class="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 sm:h-11 sm:w-11"
        :class="toneClasses[tone]"
        v-html="icon"
      />
    </div>
  </article>
</template>

<style scoped>
.sales-kpi-card {
  container-type: inline-size;
}

.kpi-value-regular {
  font-size: clamp(1.25rem, 12cqw, 1.5rem);
}

.kpi-value-long {
  font-size: clamp(0.98rem, 9cqw, 1.35rem);
}

@container (max-width: 180px) {
  .kpi-value-regular,
  .kpi-value-long {
    font-size: 0.95rem;
  }
}
</style>
