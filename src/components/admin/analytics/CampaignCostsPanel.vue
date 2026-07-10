<script lang="ts" setup>
import { ref, onMounted } from "vue";
import AnalyticsService, { type CampaignCost } from "../../../services/AnalyticsService";

const props = defineProps<{
  /** Campañas vistas en la tabla actual (autocompletado del formulario). */
  campaigns?: string[];
}>();
const emit = defineEmits<{ (e: "changed"): void }>();

const open = ref(false);
const items = ref<CampaignCost[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

// Formulario
function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const form = ref<{ utm_campaign: string; month: string; cost: number | null; currency: string }>({
  utm_campaign: "",
  month: thisMonth(),
  cost: null,
  currency: "COP",
});

const money = (v: number) => "$" + Math.round(v).toLocaleString("es-CO");

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await AnalyticsService.getCampaignCosts();
    items.value = res.items;
  } catch (e) {
    console.error(e);
    error.value = "No se pudieron cargar los costos.";
  } finally {
    loading.value = false;
  }
}

async function save() {
  error.value = null;
  const campaign = form.value.utm_campaign.trim();
  if (!campaign) {
    error.value = "Indica la campaña (utm_campaign).";
    return;
  }
  if (form.value.cost == null || form.value.cost < 0) {
    error.value = "Indica un costo válido (≥ 0).";
    return;
  }
  saving.value = true;
  try {
    await AnalyticsService.upsertCampaignCost({
      utm_campaign: campaign,
      month: form.value.month,
      cost: form.value.cost,
      currency: form.value.currency || "COP",
    });
    form.value.cost = null;
    await load();
    emit("changed"); // refresca el ROAS de la tabla
  } catch (e: unknown) {
    console.error(e);
    error.value = "No se pudo guardar el costo.";
  } finally {
    saving.value = false;
  }
}

async function remove(item: CampaignCost) {
  if (!confirm(`¿Eliminar el costo de "${item.utm_campaign}" (${item.month})?`)) return;
  try {
    await AnalyticsService.deleteCampaignCost(item.id);
    await load();
    emit("changed");
  } catch (e) {
    console.error(e);
    error.value = "No se pudo eliminar.";
  }
}

onMounted(load);
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 text-left"
      @click="open = !open"
    >
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-gray-700">Costos de campaña (ROAS)</h3>
        <span class="text-[11px] text-gray-400">carga manual mensual</span>
      </div>
      <span class="text-gray-400 text-xs">{{ open ? "▲ ocultar" : "▼ gestionar" }}</span>
    </button>

    <div v-if="open" class="border-t border-gray-100 p-4 flex flex-col gap-4">
      <!-- Formulario -->
      <form class="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end" @submit.prevent="save">
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-[11px] uppercase font-semibold text-gray-400">Campaña (utm_campaign)</label>
          <input
            v-model="form.utm_campaign"
            list="campaign-suggestions"
            type="text"
            placeholder="p. ej. black_friday_2026"
            class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <datalist id="campaign-suggestions">
            <option v-for="c in props.campaigns ?? []" :key="c" :value="c" />
          </datalist>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-semibold text-gray-400">Mes</label>
          <input
            v-model="form.month"
            type="month"
            class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] uppercase font-semibold text-gray-400">Costo</label>
          <input
            v-model.number="form.cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          :disabled="saving"
          class="text-sm font-semibold bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ saving ? "Guardando…" : "Guardar" }}
        </button>
      </form>

      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

      <!-- Lista de costos cargados -->
      <div v-if="loading" class="text-sm text-gray-400">Cargando…</div>
      <div v-else-if="items.length === 0" class="text-sm text-gray-400">
        Aún no hay costos cargados. Sin costos, la columna ROAS no aparece.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[420px]">
          <thead>
            <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
              <th class="text-left font-semibold px-2 py-1.5">Campaña</th>
              <th class="text-left font-semibold px-2 py-1.5">Mes</th>
              <th class="text-right font-semibold px-2 py-1.5">Costo</th>
              <th class="px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id" class="border-t border-gray-50">
              <td class="px-2 py-1.5 text-gray-700 font-medium truncate max-w-[220px]">{{ it.utm_campaign }}</td>
              <td class="px-2 py-1.5 text-gray-500 tabular-nums">{{ it.month }}</td>
              <td class="px-2 py-1.5 text-right text-gray-700 tabular-nums">
                {{ money(it.cost) }} <span class="text-[10px] text-gray-400">{{ it.currency }}</span>
              </td>
              <td class="px-2 py-1.5 text-right">
                <button
                  type="button"
                  class="text-xs text-rose-400 hover:text-rose-600 font-semibold"
                  @click="remove(it)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
