<script lang="ts" setup>
import { computed } from "vue";

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
    start: firstDay.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  });
};

const setLastMonth = () => {
  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  emit("update:modelValue", {
    start: firstDayLastMonth.toISOString().split("T")[0],
    end: lastDayLastMonth.toISOString().split("T")[0],
  });
};

const setLast3Months = () => {
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  emit("update:modelValue", {
    start: threeMonthsAgo.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  });
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Date Range Inputs -->
      <div class="sm:col-span-2 lg:col-span-2 flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            Desde
          </label>
          <input
            v-model="localStart"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          />
        </div>
        <div class="text-gray-400">→</div>
        <div class="flex-1">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            Hasta
          </label>
          <input
            v-model="localEnd"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      <!-- Quick Select Buttons -->
      <div class="sm:col-span-2 lg:col-span-2 flex gap-2 flex-wrap">
        <button
          @click="setThisMonth"
          class="flex-1 min-w-max px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
        >
          Este mes
        </button>
        <button
          @click="setLastMonth"
          class="flex-1 min-w-max px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
        >
          Mes anterior
        </button>
        <button
          @click="setLast3Months"
          class="flex-1 min-w-max px-3 py-2 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
        >
          3 meses
        </button>
      </div>
    </div>
  </div>
</template>
