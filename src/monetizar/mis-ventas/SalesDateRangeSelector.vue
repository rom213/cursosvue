<script lang="ts" setup>
import { computed } from "vue";
import { toDateInputValue } from "./salesDashboardUtils";

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  modelValue: DateRange;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: DateRange];
}>();

const localStart = computed({
  get: () => props.modelValue.start,
  set: (value: string) => {
    emit("update:modelValue", { ...props.modelValue, start: value });
  },
});

const localEnd = computed({
  get: () => props.modelValue.end,
  set: (value: string) => {
    emit("update:modelValue", { ...props.modelValue, end: value });
  },
});

const setThisMonth = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  emit("update:modelValue", {
    start: toDateInputValue(firstDay),
    end: toDateInputValue(today),
  });
};

const setLastMonth = () => {
  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  emit("update:modelValue", {
    start: toDateInputValue(firstDayLastMonth),
    end: toDateInputValue(lastDayLastMonth),
  });
};

const setLast3Months = () => {
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  emit("update:modelValue", {
    start: toDateInputValue(threeMonthsAgo),
    end: toDateInputValue(today),
  });
};
</script>

<template>
  <div class="rounded-2xl border border-[#E5EAF0] bg-white p-4 shadow-sm sm:p-5">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Desde
          </label>
          <input
            v-model="localStart"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div class="hidden pb-2 text-slate-300 sm:block">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hasta
          </label>
          <input
            v-model="localEnd"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          class="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 sm:text-sm"
          @click="setThisMonth"
        >
          Este mes
        </button>
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 sm:text-sm"
          @click="setLastMonth"
        >
          Mes anterior
        </button>
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 sm:text-sm"
          @click="setLast3Months"
        >
          3 meses
        </button>
      </div>
    </div>
  </div>
</template>
