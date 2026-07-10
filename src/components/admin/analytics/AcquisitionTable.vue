<script lang="ts" setup>
import { ref, computed } from "vue";
import type { AcquisitionItem } from "../../../services/AnalyticsService";

const props = defineProps<{
  items: AcquisitionItem[];
  by: "channel" | "campaign" | "referral";
  /** P4: mostrar la columna ROAS (solo con by=campaign y ≥1 costo cargado). */
  hasCosts?: boolean;
}>();

const CHANNEL_LABELS: Record<string, string> = {
  paid: "Pago",
  organic: "Orgánico",
  social: "Social",
  referral: "Referido",
  direct: "Directo",
  email: "Email",
};

interface Column {
  key: string;
  label: string;
  align: "left" | "right";
  format?: (it: AcquisitionItem) => string;
  sort: (it: AcquisitionItem) => number | string;
}

const money = (v: number) => "$" + Math.round(v).toLocaleString("es-CO");
const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
const pct = (v: number) => ((v ?? 0) * 100).toFixed(1) + "%";

const columns = computed<Column[]>(() => {
  if (props.by === "referral") {
    return [
      { key: "key", label: "Afiliado", align: "left", format: (i) => i.key, sort: (i) => i.key },
      { key: "sessions", label: "Sesiones", align: "right", format: (i) => num(i.sessions), sort: (i) => i.sessions },
      { key: "clicks", label: "Clics", align: "right", format: (i) => num(i.clicks ?? 0), sort: (i) => i.clicks ?? 0 },
    ];
  }
  const nameCol: Column =
    props.by === "channel"
      ? { key: "key", label: "Canal", align: "left", format: (i) => CHANNEL_LABELS[i.key] ?? i.key, sort: (i) => i.key }
      : { key: "key", label: "Campaña", align: "left", format: (i) => i.campaign ?? i.key, sort: (i) => i.campaign ?? i.key };
  const cols: Column[] = [
    nameCol,
    { key: "sessions", label: "Sesiones", align: "right", format: (i) => num(i.sessions), sort: (i) => i.sessions },
    { key: "purchases", label: "Compras", align: "right", format: (i) => num(i.purchases ?? 0), sort: (i) => i.purchases ?? 0 },
    { key: "revenue", label: "Ingresos", align: "right", format: (i) => money(i.revenue ?? 0), sort: (i) => i.revenue ?? 0 },
    { key: "revenue_per_session", label: "Ing./sesión", align: "right", format: (i) => money(i.revenue_per_session ?? 0), sort: (i) => i.revenue_per_session ?? 0 },
    { key: "conversion_rate", label: "Conv.", align: "right", format: (i) => pct(i.conversion_rate ?? 0), sort: (i) => i.conversion_rate ?? 0 },
  ];
  // P4: ROAS solo por campaña y si hay costos cargados (si no, la columna se oculta).
  if (props.by === "campaign" && props.hasCosts) {
    cols.push(
      { key: "cost", label: "Costo", align: "right", format: (i) => (i.cost == null ? "—" : money(i.cost)), sort: (i) => i.cost ?? -1 },
      { key: "roas", label: "ROAS", align: "right", format: (i) => (i.roas == null ? "—" : i.roas.toFixed(2) + "×"), sort: (i) => i.roas ?? -1 }
    );
  }
  return cols;
});

const sortKey = ref<string>("revenue");
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
  const col = columns.value.find((c) => c.key === sortKey.value) ?? columns.value[1];
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...props.items].sort((a, b) => {
    const va = col.sort(a);
    const vb = col.sort(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
});

const subLabel = (it: AcquisitionItem) =>
  props.by === "campaign" && (it.source || it.medium)
    ? `${it.source ?? "—"} / ${it.medium ?? "—"}`
    : "";
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
    <table v-if="items.length" class="w-full text-sm min-w-[520px]">
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
            ]"
          >
            <template v-if="ci === 0">
              <div class="truncate max-w-[200px]">{{ c.format ? c.format(it) : "" }}</div>
              <div v-if="subLabel(it)" class="text-[11px] text-gray-400 truncate">{{ subLabel(it) }}</div>
            </template>
            <template v-else>{{ c.format ? c.format(it) : "" }}</template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="p-6 text-center text-sm text-gray-400">
      Sin sesiones atribuidas en este rango.
    </div>
  </div>
</template>
