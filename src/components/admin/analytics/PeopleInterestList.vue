<script lang="ts" setup>
import type { PersonInterest } from "../../../services/AnalyticsService";

defineProps<{ items: PersonInterest[]; total: number }>();

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function personName(it: PersonInterest): string {
  return it.contact?.name || it.label || "Visitante";
}

/** WhatsApp con un mensaje prellenado sobre los cursos que la persona miró. */
function whatsappLink(it: PersonInterest): string | null {
  const raw = it.contact?.whatsapp;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const first = it.courses[0]?.title;
  const asunto = first
    ? `el curso "${first}"${it.courses.length > 1 ? ` y ${it.courses.length - 1} más` : ""}`
    : "nuestros cursos";
  const msg = `¡Hola${it.contact?.name ? " " + it.contact.name : ""}! Vimos que te interesó ${asunto}. ¿Te ayudamos con la inscripción?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-sm font-bold text-gray-700">Personas interesadas</h3>
      <span class="text-xs text-gray-400">{{ total.toLocaleString("es-CO") }} en el rango</span>
    </div>

    <div v-if="items.length === 0" class="p-6 text-center text-sm text-gray-400">
      Nadie vio cursos individuales en este rango.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm min-w-[680px]">
        <thead>
          <tr class="text-[11px] uppercase text-gray-400 tracking-wide border-b border-gray-100">
            <th class="text-left font-semibold px-4 py-2">Persona</th>
            <th class="text-left font-semibold px-2 py-2">Cursos de interés</th>
            <th class="text-right font-semibold px-2 py-2">#</th>
            <th class="text-left font-semibold px-2 py-2">Última vista</th>
            <th class="text-left font-semibold px-2 py-2">Estado</th>
            <th class="text-right font-semibold px-4 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(it, idx) in items"
            :key="idx"
            class="border-t border-gray-50 hover:bg-gray-50/60 transition-colors align-top"
          >
            <td class="px-4 py-2.5">
              <div class="font-medium text-gray-700 truncate max-w-[160px]">{{ personName(it) }}</div>
              <div v-if="it.contact?.email" class="text-[11px] text-gray-400 truncate max-w-[160px]">
                {{ it.contact.email }}
              </div>
              <span v-else class="text-[11px] text-gray-300 italic">anónimo</span>
            </td>
            <td class="px-2 py-2.5 text-gray-600">
              <div class="flex flex-wrap gap-1 max-w-[280px]">
                <span
                  v-for="(c, ci) in it.courses.slice(0, 4)"
                  :key="ci"
                  class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 truncate max-w-[160px]"
                  :title="c.title"
                >
                  {{ c.title }}
                </span>
                <span v-if="it.courses.length > 4" class="text-[11px] text-gray-400 px-1 py-0.5">
                  +{{ it.courses.length - 4 }}
                </span>
              </div>
            </td>
            <td class="px-2 py-2.5 text-right font-semibold text-gray-800 tabular-nums">{{ it.total_courses }}</td>
            <td class="px-2 py-2.5 text-gray-500 whitespace-nowrap">{{ fmtDate(it.last_activity) }}</td>
            <td class="px-2 py-2.5">
              <span
                v-if="it.has_purchase"
                class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold"
              >
                Ya compró
              </span>
              <span v-else class="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold">
                Sin comprar
              </span>
            </td>
            <td class="px-4 py-2.5 text-right whitespace-nowrap">
              <a
                v-if="whatsappLink(it)"
                :href="whatsappLink(it)!"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.14-.18-1.12-1.49-1.12-2.84 0-1.35.71-2.02.96-2.29.25-.27.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.55.82 1.9.89 2.04.07.14.12.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.95 1.95 1.24 2.23 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.89.27.14.45.2.52.32.07.11.07.66-.17 1.34Z" />
                </svg>
                WhatsApp
              </a>
              <a
                v-else-if="it.contact?.email"
                :href="`mailto:${it.contact.email}`"
                class="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
              >
                Email
              </a>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
