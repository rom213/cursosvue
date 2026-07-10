<script lang="ts" setup>
import { computed } from "vue";
import type { NavigationSessionResponse } from "../../../services/AnalyticsService";

const props = defineProps<{
  session: NavigationSessionResponse | null;
  loading: boolean;
  error: string | null;
}>();
const emit = defineEmits<{ (e: "close"): void }>();

function clock(iso: string): string {
  const t = (iso.split("T")[1] ?? "").slice(0, 8);
  return t || iso;
}

/** Tiempo relativo al primer evento del recorrido (+0s, +12s, +1m 05s). */
const relative = computed<Record<number, string>>(() => {
  const out: Record<number, string> = {};
  const items = props.session?.timeline ?? [];
  if (items.length === 0) return out;
  const t0 = new Date(items[0].at).getTime();
  items.forEach((it, i) => {
    const secs = Math.max(0, Math.round((new Date(it.at).getTime() - t0) / 1000));
    out[i] = secs < 60 ? `+${secs}s` : `+${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`;
  });
  return out;
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/40" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
      <!-- Cabecera -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-base font-bold text-gray-800">Recorrido de la sesión</h3>
          <p v-if="session" class="text-[11px] text-gray-400 font-mono truncate">{{ session.session_id }}</p>
          <p v-if="session?.contact" class="text-xs text-gray-500 mt-0.5 truncate">
            {{ session.contact.name || session.contact.email }}
            <span v-if="session.contact.email" class="text-gray-400">· {{ session.contact.email }}</span>
          </p>
        </div>
        <button type="button" class="text-gray-400 hover:text-gray-700 text-xl leading-none" @click="emit('close')">✕</button>
      </div>

      <!-- Cuerpo -->
      <div class="overflow-y-auto p-5">
        <div v-if="loading" class="py-12 text-center text-sm text-gray-400">Cargando recorrido…</div>
        <div v-else-if="error" class="py-8 text-center text-sm text-red-500">{{ error }}</div>
        <div v-else-if="!session || session.timeline.length === 0" class="py-12 text-center text-sm text-gray-400">
          Sin recorrido para esta sesión.
          <div class="text-[11px] mt-1">Los clicks aparecen aquí cuando la autocaptura acumula datos de la sesión.</div>
        </div>

        <ol v-else class="relative border-l-2 border-gray-100 ml-2">
          <li v-for="(it, idx) in session.timeline" :key="idx" class="ml-4 pb-4 last:pb-0 relative">
            <span
              class="absolute -left-[1.42rem] top-0.5 w-3 h-3 rounded-full ring-4 ring-white"
              :class="it.kind === 'pageview' ? 'bg-blue-500' : (it.dead ? 'bg-rose-400' : 'bg-emerald-500')"
            ></span>
            <div class="flex items-baseline gap-2">
              <span class="text-[10px] font-mono text-gray-400 tabular-nums w-14 shrink-0">{{ relative[idx] }}</span>
              <div class="min-w-0">
                <template v-if="it.kind === 'pageview'">
                  <span class="text-[10px] uppercase font-bold text-blue-500">Página</span>
                  <div class="text-sm font-mono text-gray-700 truncate" :title="it.page ?? ''">{{ it.page }}</div>
                </template>
                <template v-else>
                  <span class="text-[10px] uppercase font-bold" :class="it.dead ? 'text-rose-500' : 'text-emerald-600'">
                    Click<span v-if="it.dead"> muerto</span>
                  </span>
                  <div class="text-sm text-gray-700 truncate font-mono" :title="it.label ?? ''">{{ it.label }}</div>
                  <div v-if="it.text" class="text-[11px] text-gray-400 truncate">"{{ it.text }}"</div>
                  <div class="text-[10px] text-gray-300 font-mono truncate">{{ it.page }}</div>
                </template>
              </div>
              <span class="ml-auto text-[10px] text-gray-300 font-mono shrink-0" :title="it.at">{{ clock(it.at) }}</span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
