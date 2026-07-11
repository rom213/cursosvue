<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import AnalyticsService, { type EventBatch } from "../../../services/AnalyticsService";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "apply-range", range: {
    date_from: string; date_to: string; ts_from: string; ts_to: string | null; name: string;
  }): void;
  (e: "reset-done"): void;
}>();

const CONFIRM_WORD = "BORRAR";

// --- Lotes ---
const batches = ref<EventBatch[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const form = ref<{ name: string; note: string }>({ name: "", note: "" });
const startAt = ref("");

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await AnalyticsService.getBatches();
    batches.value = res.items;
  } catch (e) {
    console.error(e);
    error.value = "No se pudieron cargar los lotes.";
  } finally {
    loading.value = false;
  }
}

async function createBatch() {
  error.value = null;
  const name = form.value.name.trim();
  if (!name) {
    error.value = "Indica el nombre del lote.";
    return;
  }
  saving.value = true;
  try {
    const created = await AnalyticsService.createBatch({
      name,
      note: form.value.note.trim() || undefined,
      started_at: startAt.value || undefined,
    });
    const scheduled = !!startAt.value;
    form.value = { name: "", note: "" };
    startAt.value = "";
    await load();
    if (!scheduled) {
      // Lote iniciado "ahora": aplicarlo ya → todos los tabs en 0 contando desde este instante.
      const b = batches.value.find((x) => x.id === created.id);
      if (b) applyBatch(b);
    }
  } catch (e) {
    console.error(e);
    error.value = "No se pudo crear el lote.";
  } finally {
    saving.value = false;
  }
}

async function removeBatch(b: EventBatch) {
  if (!confirm(`¿Eliminar el marcador del lote "${b.name}"? (no borra eventos)`)) return;
  try {
    await AnalyticsService.deleteBatch(b.id);
    await load();
  } catch (e) {
    console.error(e);
    error.value = "No se pudo eliminar el lote.";
  }
}

function applyBatch(b: EventBatch) {
  emit("apply-range", {
    date_from: b.date_from,
    date_to: b.date_to,
    ts_from: b.ts_from,
    ts_to: b.ts_to,
    name: b.name,
  });
  emit("close");
}

// --- Zona de peligro (reset) ---
const confirmText = ref("");
const resetting = ref(false);
const resetResult = ref<string | null>(null);
const canReset = computed(() => confirmText.value === CONFIRM_WORD && !resetting.value);

async function resetEvents() {
  if (!canReset.value) return;
  resetting.value = true;
  error.value = null;
  resetResult.value = null;
  try {
    const res = await AnalyticsService.resetEvents(confirmText.value);
    resetResult.value =
      `Borrados ${res.deleted_user_events.toLocaleString("es-CO")} eventos y ` +
      `${res.deleted_navigation_events.toLocaleString("es-CO")} clicks de navegación.`;
    confirmText.value = "";
    emit("reset-done");
  } catch (e) {
    console.error(e);
    error.value = "No se pudo completar el borrado.";
  } finally {
    resetting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
      <!-- Cabecera -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-gray-800">Gestión de datos</h3>
          <p class="text-xs text-gray-400">Lotes de campaña y borrado del historial</p>
        </div>
        <button type="button" class="text-gray-400 hover:text-gray-700 text-xl leading-none" @click="emit('close')">✕</button>
      </div>

      <div class="overflow-y-auto p-5 flex flex-col gap-6">
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <!-- ── Lotes de campaña ── -->
        <section class="flex flex-col gap-3">
          <div>
            <h4 class="text-sm font-bold text-gray-700">Lotes de campaña</h4>
            <p class="text-xs text-gray-400">
              Un lote marca un punto de corte (p. ej. el lanzamiento de una campaña). "Ver este
              lote" filtra el panel a ese periodo sin borrar nada.
            </p>
          </div>

          <form class="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end" @submit.prevent="createBatch">
            <div class="sm:col-span-2 flex flex-col gap-1">
              <label class="text-[11px] uppercase font-semibold text-gray-400">Nombre</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="p. ej. Campaña julio 2026"
                class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div class="sm:col-span-2 flex flex-col gap-1">
              <label class="text-[11px] uppercase font-semibold text-gray-400">Nota (opcional)</label>
              <input
                v-model="form.note"
                type="text"
                placeholder="objetivo, presupuesto…"
                class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div class="sm:col-span-2 flex flex-col gap-1">
              <label class="text-[11px] uppercase font-semibold text-gray-400">Programar inicio (opcional)</label>
              <input
                v-model="startAt"
                type="datetime-local"
                class="text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              :disabled="saving"
              class="text-sm font-semibold bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ saving ? "Creando…" : "Iniciar lote" }}
            </button>
          </form>

          <div v-if="loading" class="text-sm text-gray-400">Cargando…</div>
          <div v-else-if="batches.length === 0" class="text-sm text-gray-400">
            Aún no hay lotes. Inicia uno al lanzar la campaña para leerla limpia desde ese día.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm min-w-[420px]">
              <thead>
                <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
                  <th class="text-left font-semibold px-2 py-1.5">Lote</th>
                  <th class="text-left font-semibold px-2 py-1.5">Periodo</th>
                  <th class="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in batches" :key="b.id" class="border-t border-gray-50">
                  <td class="px-2 py-1.5">
                    <div class="text-gray-700 font-medium truncate max-w-[180px]">
                      {{ b.name }}
                      <span v-if="b.scheduled" class="ml-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 align-middle">Programado</span>
                    </div>
                    <div class="text-[11px] text-gray-400 truncate max-w-[180px]">
                      inicia {{ b.ts_from.slice(0, 16).replace("T", " ") }}<span v-if="b.note"> · {{ b.note }}</span>
                    </div>
                  </td>
                  <td class="px-2 py-1.5 text-gray-500 tabular-nums whitespace-nowrap">
                    {{ b.date_from }} → {{ b.date_to }}
                  </td>
                  <td class="px-2 py-1.5 text-right whitespace-nowrap">
                    <button type="button" class="text-xs text-blue-500 hover:text-blue-700 font-semibold mr-3" @click="applyBatch(b)">
                      Ver este lote
                    </button>
                    <button type="button" class="text-xs text-rose-400 hover:text-rose-600 font-semibold" @click="removeBatch(b)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── Zona de peligro ── -->
        <section class="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex flex-col gap-3">
          <div>
            <h4 class="text-sm font-bold text-rose-700">Borrar todos los eventos</h4>
            <p class="text-xs text-rose-600/80">
              Elimina permanentemente TODO el historial (<code>user_events</code> +
              <code>navigation_events</code>). Irreversible. Los lotes y los costos de campaña se
              conservan.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              v-model="confirmText"
              type="text"
              :placeholder="`Escribe ${CONFIRM_WORD} para habilitar`"
              class="text-sm rounded-lg border border-rose-200 px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="button"
              :disabled="!canReset"
              class="text-sm font-semibold bg-rose-600 text-white rounded-lg px-3 py-1.5 hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="resetEvents"
            >
              {{ resetting ? "Borrando…" : "Borrar todo" }}
            </button>
          </div>
          <p v-if="resetResult" class="text-xs text-emerald-600 font-medium">{{ resetResult }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
