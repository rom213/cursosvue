<script lang="ts" setup>
import { ref, computed } from "vue";
import type { CourseInterestItem } from "../../../services/AnalyticsService";

const props = defineProps<{ items: CourseInterestItem[] }>();

interface Column {
  key: string;
  label: string;
  align: "left" | "right";
  format: (it: CourseInterestItem) => string;
  sort: (it: CourseInterestItem) => number | string;
}

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
const pct = (v: number) => ((v ?? 0) * 100).toFixed(1) + "%";
const trend = (v: number | null) =>
  v == null ? "—" : (v >= 0 ? "▲ " : "▼ ") + Math.abs(v).toFixed(1) + "%";

const columns: Column[] = [
  { key: "title", label: "Curso", align: "left", format: (i) => i.title, sort: (i) => i.title },
  { key: "viewers", label: "Interesados", align: "right", format: (i) => num(i.viewers), sort: (i) => i.viewers },
  { key: "views", label: "Vistas", align: "right", format: (i) => num(i.views), sort: (i) => i.views },
  { key: "purchases", label: "Compras", align: "right", format: (i) => num(i.purchases), sort: (i) => i.purchases },
  { key: "conversion_rate", label: "Conv.", align: "right", format: (i) => pct(i.conversion_rate), sort: (i) => i.conversion_rate },
  { key: "share", label: "Share", align: "right", format: (i) => pct(i.share), sort: (i) => i.share },
  { key: "trend_pct", label: "Tendencia", align: "right", format: (i) => trend(i.trend_pct), sort: (i) => i.trend_pct ?? -Infinity },
];

const sortKey = ref<string>("views");
const sortDir = ref<"asc" | "desc">("desc");

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "desc";
  }
}

const sorted = computed(() => {
  const col = columns.find((c) => c.key === sortKey.value) ?? columns[2];
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...props.items].sort((a, b) => {
    const va = col.sort(a);
    const vb = col.sort(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
});

function trendClass(v: number | null): string {
  if (v == null) return "text-gray-300";
  return v >= 0 ? "text-emerald-600" : "text-rose-500";
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
    <table v-if="items.length" class="w-full text-sm min-w-[560px]">
      <thead>
        <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
          <th
            v-for="c in columns"
            :key="c.key"
            class="font-semibold px-3 py-2.5 cursor-pointer select-none hover:text-gray-600"
            :class="c.align === 'right' ? 'text-right' : 'text-left'"
            @click="toggleSort(c.key)"
          >
            {{ c.label }}
            <span v-if="sortKey === c.key" class="text-blue-500">{{ sortDir === "asc" ? "▲" : "▼" }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(it, idx) in sorted"
          :key="idx"
          class="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
        >
          <td
            v-for="(c, ci) in columns"
            :key="c.key"
            class="px-3 py-2.5"
            :class="[
              c.align === 'right' ? 'text-right tabular-nums' : 'text-left',
              ci === 0 ? 'font-medium text-gray-700' : 'text-gray-600',
              c.key === 'trend_pct' ? trendClass(it.trend_pct) : '',
            ]"
          >
            <div v-if="ci === 0" class="truncate max-w-[240px]" :title="it.title">{{ c.format(it) }}</div>
            <template v-else>{{ c.format(it) }}</template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="p-6 text-center text-sm text-gray-400">
      Nadie ha mostrado interés en cursos individuales en este rango (ViewContent de curso).
    </div>
  </div>
</template>
