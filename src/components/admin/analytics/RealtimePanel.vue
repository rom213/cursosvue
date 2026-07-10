<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import AnalyticsService, { type RealtimeResponse } from "../../../services/AnalyticsService";

const POLL_MS = 30000; // 30 s

const data = ref<RealtimeResponse | null>(null);
const loading = ref(true); // solo el primer render muestra spinner
const error = ref<string | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

const num = (v: number) => (v ?? 0).toLocaleString("es-CO");

const CHANNEL_LABELS: Record<string, string> = {
  paid: "Pago",
  organic: "Orgánico",
  social: "Social",
  referral: "Referido",
  direct: "Directo",
  email: "Email",
};

function shortPage(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname + u.search) || "/";
  } catch {
    return url;
  }
}
function clockTime(iso: string): string {
  // generated_at ya viene en hora Bogotá; solo tomamos HH:MM:SS.
  const t = iso.split("T")[1] ?? iso;
  return t.slice(0, 8);
}

async function poll() {
  try {
    data.value = await AnalyticsService.getRealtime();
    error.value = null;
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar el tiempo real.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  poll();
  timer = setInterval(poll, POLL_MS);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading && !data" class="flex items-center justify-center py-16 text-gray-400">
      <span class="text-sm font-semibold">Cargando tiempo real…</span>
    </div>

    <div v-else-if="error && !data" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
      {{ error }}
    </div>

    <template v-else-if="data">
      <!-- Encabezado con indicador vivo -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="text-sm font-semibold text-gray-600">
            Últimos {{ data.window_minutes }} min · en vivo
          </span>
        </div>
        <span class="text-[11px] text-gray-400">
          Actualizado {{ clockTime(data.generated_at) }} · cada 30 s
        </span>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="text-[11px] uppercase text-gray-400 font-semibold">Visitantes activos</div>
          <div class="text-2xl font-bold text-gray-800 tabular-nums">{{ num(data.active_visitors) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="text-[11px] uppercase text-gray-400 font-semibold">Sesiones activas</div>
          <div class="text-2xl font-bold text-gray-800 tabular-nums">{{ num(data.active_sessions) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="text-[11px] uppercase text-gray-400 font-semibold">Páginas vistas</div>
          <div class="text-2xl font-bold text-gray-800 tabular-nums">{{ num(data.pageviews) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="text-[11px] uppercase text-gray-400 font-semibold">Compras</div>
          <div class="text-2xl font-bold text-emerald-600 tabular-nums">{{ num(data.purchases) }}</div>
        </div>
      </div>

      <div v-if="data.active_visitors === 0" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center text-sm text-gray-400">
        Nadie activo en los últimos {{ data.window_minutes }} minutos. Esta vista se actualiza sola.
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Páginas activas -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-700">Páginas activas</h3>
          </div>
          <div v-if="data.pages.length === 0" class="p-6 text-center text-sm text-gray-400">
            Sin páginas activas.
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
                <th class="text-left font-semibold px-4 py-2">Página</th>
                <th class="text-right font-semibold px-2 py-2">Visit.</th>
                <th class="text-right font-semibold px-4 py-2">Eventos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in data.pages" :key="idx" class="border-t border-gray-50">
                <td class="px-4 py-2 text-gray-700 font-medium truncate max-w-[240px]" :title="p.page">
                  {{ shortPage(p.page) }}
                </td>
                <td class="px-2 py-2 text-right text-gray-800 font-semibold tabular-nums">{{ num(p.visitors) }}</td>
                <td class="px-4 py-2 text-right text-gray-500 tabular-nums">{{ num(p.events) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Origen de sesiones -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-700">Origen de las sesiones activas</h3>
          </div>
          <div v-if="data.sources.length === 0" class="p-6 text-center text-sm text-gray-400">
            Sin sesiones con origen.
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
                <th class="text-left font-semibold px-4 py-2">Canal</th>
                <th class="text-right font-semibold px-4 py-2">Sesiones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, idx) in data.sources" :key="idx" class="border-t border-gray-50">
                <td class="px-4 py-2 text-gray-700 font-medium capitalize">
                  {{ CHANNEL_LABELS[s.channel] ?? s.channel }}
                </td>
                <td class="px-4 py-2 text-right text-gray-800 font-semibold tabular-nums">{{ num(s.sessions) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
