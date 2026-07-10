<script lang="ts" setup>
import type { ActivityItem } from "../../../services/AnalyticsService";

defineProps<{ items: ActivityItem[]; total: number }>();
const emit = defineEmits<{ (e: "view-session", sessionId: string): void }>();

const CHANNEL_LABELS: Record<string, string> = {
  paid: "Pago",
  organic: "Orgánico",
  social: "Social",
  referral: "Referido",
  direct: "Directo",
  email: "Email",
};

const EVENT_LABELS: Record<string, string> = {
  ViewContent: "Vio curso",
  Purchase: "Compró",
  AddToCart: "Al carrito",
  InitiateCheckout: "Checkout",
  PageView: "Vio página",
  Search: "Buscó",
  Lead: "Lead",
  Contact: "WhatsApp",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtMoney(v: number | null): string {
  if (v == null) return "";
  return "$" + Math.round(v).toLocaleString("es-CO");
}
function shortUrl(url: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return (u.pathname + u.search) || "/";
  } catch {
    return url;
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-sm font-bold text-gray-700">Registro de eventos</h3>
      <span class="text-xs text-gray-400">{{ total.toLocaleString("es-CO") }} en el rango</span>
    </div>

    <div v-if="items.length === 0" class="p-6 text-center text-sm text-gray-400">
      Sin eventos en este rango con los filtros actuales.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm min-w-[720px]">
        <thead>
          <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
            <th class="text-left font-semibold px-4 py-2">Cuándo</th>
            <th class="text-left font-semibold px-2 py-2">Persona</th>
            <th class="text-left font-semibold px-2 py-2">Evento</th>
            <th class="text-left font-semibold px-2 py-2">Curso / contenido</th>
            <th class="text-left font-semibold px-2 py-2">Canal</th>
            <th class="text-right font-semibold px-2 py-2">Valor</th>
            <th class="text-left font-semibold px-2 py-2">Página</th>
            <th class="text-right font-semibold px-4 py-2">Recorrido</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(it, idx) in items"
            :key="idx"
            class="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
          >
            <td class="px-4 py-2.5 text-gray-500 whitespace-nowrap">{{ fmtDate(it.event_time) }}</td>
            <td class="px-2 py-2.5">
              <div class="font-medium text-gray-700 truncate max-w-[150px]">{{ it.person_label }}</div>
              <div v-if="it.contact?.email" class="text-[11px] text-gray-400 truncate max-w-[150px]">
                {{ it.contact.email }}
              </div>
            </td>
            <td class="px-2 py-2.5">
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {{ EVENT_LABELS[it.event_name] ?? it.event_name }}
              </span>
            </td>
            <td class="px-2 py-2.5 text-gray-700 truncate max-w-[220px]" :title="it.content_name ?? ''">
              {{ it.content_name || (it.content_id != null ? "Curso #" + it.content_id : "—") }}
            </td>
            <td class="px-2 py-2.5">
              <span class="text-xs text-gray-500 capitalize">{{ CHANNEL_LABELS[it.channel] ?? it.channel }}</span>
            </td>
            <td class="px-2 py-2.5 text-right text-gray-700 tabular-nums whitespace-nowrap">{{ fmtMoney(it.value) }}</td>
            <td class="px-2 py-2.5">
              <a
                v-if="it.event_source_url"
                :href="it.event_source_url"
                target="_blank"
                rel="noopener"
                class="text-blue-500 hover:underline truncate inline-block max-w-[160px]"
                :title="it.event_source_url"
              >
                {{ shortUrl(it.event_source_url) }}
              </a>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-2.5 text-right whitespace-nowrap">
              <button
                v-if="it.session_id"
                type="button"
                class="text-[11px] font-semibold text-blue-500 hover:text-blue-700"
                title="Ver el recorrido completo de esta sesión"
                @click="emit('view-session', it.session_id)"
              >
                Ver recorrido →
              </button>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
