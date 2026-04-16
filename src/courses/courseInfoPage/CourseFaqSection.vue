<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { FaqCategoria, FaqFile, FaqItem } from "../../types/Faq";
import faqRaw from "../../data/faq.global.json";

const faqData = faqRaw as FaqFile;

const categorias = computed<FaqCategoria[]>(() => {
  const block = faqData.contenido?.[0];
  return block?.preguntas_frecuentes ?? [];
});

const searchTerm = ref("");
const openCategoryIndex = ref<number | null>(null);
const openQuestionKey = ref<string | null>(null);

function itemKey(catIndex: number, qIndex: number) {
  return `${catIndex}-${qIndex}`;
}

/** Normaliza para búsqueda: minúsculas y sin tildes */
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Palabras significativas del término (ignora vacíos y tokens muy cortos opcionales) */
function searchTokens(raw: string): string[] {
  const n = normalizeForSearch(raw.trim());
  if (!n) return [];
  return n
    .split(/[\s,.;:!?¿¡()[\]{}'"«»]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 || /^\d+$/.test(t));
}

function haystackItem(item: FaqItem, cat: FaqCategoria): string {
  const parts = [
    item.pregunta ?? "",
    item.respuesta ?? "",
    ...(item.palabras_clave ?? []),
    ...(cat.palabras_clave ?? []),
    cat.categoria ?? "",
  ];
  return normalizeForSearch(parts.join(" "));
}

/** Búsqueda inteligente: todas las palabras deben aparecer (AND); admite acentos opcionales */
function itemMatchesQuery(item: FaqItem, cat: FaqCategoria, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const hay = haystackItem(item, cat);
  return tokens.every((tok) => hay.includes(tok));
}

function categoryMatchesQuery(cat: FaqCategoria, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const catHay = normalizeForSearch(
    [cat.categoria ?? "", ...(cat.palabras_clave ?? [])].join(" "),
  );
  if (tokens.some((t) => catHay.includes(t))) return true;
  return (cat.preguntas_frecuentes ?? []).some((item) =>
    itemMatchesQuery(item, cat, tokens),
  );
}

const categoriasFiltradas = computed(() => {
  const tokens = searchTokens(searchTerm.value);
  return categorias.value
    .map((cat, index) => ({ cat, index }))
    .filter(({ cat }) => categoryMatchesQuery(cat, tokens))
    .map(({ cat, index }) => {
      const preguntas = (cat.preguntas_frecuentes ?? []).filter((item) =>
        itemMatchesQuery(item, cat, tokens),
      );
      return { cat: { ...cat, preguntas_frecuentes: preguntas }, index };
    })
    .filter(({ cat }) => (cat.preguntas_frecuentes?.length ?? 0) > 0);
});

const totalPreguntasVisibles = computed(() =>
  categoriasFiltradas.value.reduce(
    (n, { cat }) => n + (cat.preguntas_frecuentes?.length ?? 0),
    0,
  ),
);

const busquedaActiva = computed(() => searchTokens(searchTerm.value).length > 0);

const showAll = ref(false);

const categoriasVisibles = computed(() => {
  if (busquedaActiva.value || showAll.value) return categoriasFiltradas.value;
  return categoriasFiltradas.value.slice(0, 3);
});

const hayMas = computed(() =>
  !busquedaActiva.value && !showAll.value && categoriasFiltradas.value.length > 3,
);

watch(searchTerm, () => {
  openCategoryIndex.value = null;
  openQuestionKey.value = null;
});

function toggleCategory(catIndex: number) {
  if (openCategoryIndex.value === catIndex) {
    openCategoryIndex.value = null;
    openQuestionKey.value = null;
  } else {
    openCategoryIndex.value = catIndex;
    openQuestionKey.value = null;
  }
}

function isCategoryOpen(catIndex: number) {
  return openCategoryIndex.value === catIndex;
}

function toggleQuestion(catIndex: number, qIndex: number) {
  const key = itemKey(catIndex, qIndex);
  openQuestionKey.value = openQuestionKey.value === key ? null : key;
}

function isQuestionAnswerOpen(catIndex: number, qIndex: number) {
  return openQuestionKey.value === itemKey(catIndex, qIndex);
}

type TextSegment =
  | { type: "text"; text: string }
  | { type: "link"; href: string; text: string };

function linkifySegments(text: string): TextSegment[] {
  if (!text) return [];
  const re = /(https?:\/\/[^\s<]+[^\s<)\].,;:!?]*)/gi;
  const out: TextSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const s = text;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", text: s.slice(last, m.index) });
    }
    const href = m[1].replace(/[)\].,;:!?]+$/, "");
    out.push({ type: "link", href, text: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    out.push({ type: "text", text: s.slice(last) });
  }
  return out.length ? out : [{ type: "text", text }];
}

const BULLET_RE = /^\s*([✅📱💳🏦💵💡🍏🍎💻]|-|\d+[\.\)])\s*/;

function lineIsBullet(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  return BULLET_RE.test(t) || /^✅/.test(t);
}

type AnswerBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

function parseAnswerBlocks(text: string): AnswerBlock[] {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks: AnswerBlock[] = [];
  let para: string[] = [];
  let listBuf: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const joined = para.join("\n").trim();
      if (joined) blocks.push({ kind: "paragraph", text: joined });
      para = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ kind: "list", items: [...listBuf] });
      listBuf = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flushList();
      flushPara();
      continue;
    }
    if (lineIsBullet(line)) {
      flushPara();
      listBuf.push(line.trim());
    } else {
      flushList();
      para.push(line);
    }
  }
  flushList();
  flushPara();
  return blocks;
}

/** Icono por bloque (título de categoría) */
type IconKey =
  | "drive"
  | "acceso"
  | "tutorial"
  | "problema"
  | "pago"
  | "tecnico"
  | "cert"
  | "reembolso"
  | "cuenta"
  | "archivo"
  | "video"
  | "default";

function iconKeyForCategory(titulo: string): IconKey {
  const u = titulo.toUpperCase();
  if (u.includes("GOOGLE DRIVE") || u.includes("QUÉ ES GOOGLE")) return "drive";
  if (u.includes("TUTORIAL")) return "tutorial";
  if (u.includes("MEDIOS DE PAGO") || u.includes("SEGURIDAD")) return "pago";
  if (u.includes("PROBLEMAS TÉCNICO")) return "tecnico";
  if (u.includes("PROBLEMAS DE ACCESO")) return "problema";
  if (u.includes("CERTIFICADO")) return "cert";
  if (u.includes("REEMBOLSO") || u.includes("GARANTÍA")) return "reembolso";
  if (u.includes("GESTIÓN") || u.includes("CUENTAS")) return "cuenta";
  if (u.includes("ARCHIVO") || u.includes("ZIP") || u.includes("ACTUALIZAC")) return "archivo";
  if (u.includes("REPRODUCCI") || u.includes("PLANTILLA")) return "video";
  if (u.includes("ACCESO A LOS CURSO") || u.includes("COMO ACCEDO")) return "acceso";
  return "default";
}

const palette = [
  { ring: "ring-blue-100/80", iconBg: "bg-blue-600" },
  { ring: "ring-indigo-100/80", iconBg: "bg-indigo-600" },
  { ring: "ring-emerald-100/80", iconBg: "bg-emerald-600" },
  { ring: "ring-amber-100/80", iconBg: "bg-amber-600" },
  { ring: "ring-slate-200/80", iconBg: "bg-slate-700" },
];

function paletteForIndex(i: number) {
  return palette[i % palette.length];
}

const sugerenciasBusqueda = [
  "Drive",
  "VLC",
  "reembolso",
  "PSE",
  "Nequi",
  "certificado",
  "ZIP",
  "PayU",
  "no tengo espacio",
  "no puedo ver",
  "seguridad",
  "link de acceso",
  "Celular",
  "Computadora",
  "iPhone",


];
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div
      class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 shadow-md shadow-slate-200/40 ring-1 ring-white/60"
    >
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" aria-hidden="true" />
      <div class="relative flex gap-4">
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25"
          aria-hidden="true"
        >
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Preguntas frecuentes</h2>
          <p class="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-600">
            Respuestas sobre acceso, pagos y soporte. Un bloque y una respuesta abiertos a la vez.
          </p>
        </div>
      </div>

      <!-- Buscador -->
      <div class="relative mt-6">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          v-model="searchTerm"
          type="search"
          autocomplete="off"
          placeholder="Busca por varias palabras (ej. drive vlc pago)…"
          class="w-full rounded-xl border border-slate-200 bg-white/90 py-3.5 pl-12 pr-24 text-sm shadow-sm backdrop-blur-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
        />
        <div
          class="pointer-events-none absolute inset-y-0 right-12 flex items-center pr-1"
          aria-hidden="true"
        >
          <span
            class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500"
            >Inteligente</span
          >
        </div>
        <button
          v-if="searchTerm"
          type="button"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600"
          aria-label="Limpiar búsqueda"
          @click="searchTerm = ''"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span v-if="busquedaActiva" class="inline-flex items-center gap-1.5 font-medium text-slate-700">
          <svg class="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ totalPreguntasVisibles }} resultado{{ totalPreguntasVisibles === 1 ? "" : "s" }} en
          {{ categoriasFiltradas.length }} bloque{{ categoriasFiltradas.length === 1 ? "" : "s" }}
        </span>
        <span v-else> Coincide con tildes o sin ellas. Varias palabras = todas deben aparecer. </span>
      </p>

      <p class="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs text-slate-500">
        <span class="font-medium text-slate-600">Sugerencias:</span>
        <template v-for="(kw) in sugerenciasBusqueda" :key="kw">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
            @click="searchTerm = kw"
          >
            {{ kw }}
          </button>
        </template>
      </p>
    </div>

    <!-- Vacío -->
    <div
      v-if="!categoriasFiltradas.length"
      class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 py-16 text-center"
    >
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500"
      >
        <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-800">Sin coincidencias</p>
      <p class="mt-1 text-sm text-slate-500">Prueba sin tildes, menos palabras o otra sugerencia.</p>
    </div>

    <!-- Lista de bloques -->
    <div v-else class="space-y-3">
      <div
        v-for="{ cat, index: catIndex } in categoriasVisibles"
        :key="cat.categoria + catIndex"
        class="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition hover:shadow-md"
        :class="paletteForIndex(catIndex).ring"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50/90 sm:gap-4 sm:px-5"
          @click="toggleCategory(catIndex)"
        >
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-12 sm:w-12"
            :class="paletteForIndex(catIndex).iconBg"
          >
            <!-- Drive / Nube -->
            <svg
              v-if="iconKeyForCategory(cat.categoria) === 'drive'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            <!-- Acceso -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'acceso'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <!-- Tutorial / dispositivos -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'tutorial'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <!-- Problema -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'problema'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <!-- Pago -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'pago'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <!-- Técnico -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'tecnico'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <!-- Certificado -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'cert'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <!-- Reembolso -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'reembolso'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <!-- Cuenta -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'cuenta'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <!-- Archivo -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'archivo'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <!-- Video -->
            <svg
              v-else-if="iconKeyForCategory(cat.categoria) === 'video'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <!-- Default -->
            <svg
              v-else
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <span
              class="block text-sm font-bold uppercase leading-snug tracking-wide text-slate-900 sm:text-[0.95rem]"
              >{{ cat.categoria }}</span
            >
            <span class="mt-0.5 block text-xs font-medium text-slate-500">
              {{ cat.preguntas_frecuentes?.length ?? 0 }} pregunta{{
                (cat.preguntas_frecuentes?.length ?? 0) === 1 ? "" : "s"
              }}
            </span>
          </div>
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition group-hover:border-slate-300"
          >
            <svg
              class="h-5 w-5 transition-transform duration-200"
              :class="{ 'rotate-180': isCategoryOpen(catIndex) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <div
          v-show="isCategoryOpen(catIndex)"
          class="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white"
        >
          <div
            v-for="(item, qIndex) in cat.preguntas_frecuentes || []"
            :key="qIndex"
            class="border-b border-slate-100/90 last:border-b-0"
          >
            <button
              type="button"
              class="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white sm:px-5"
              @click.stop="toggleQuestion(catIndex, qIndex)"
            >
              <span
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <span class="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">{{
                item.pregunta
              }}</span>
              <span
                class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition"
                :class="
                  isQuestionAnswerOpen(catIndex, qIndex) ? 'bg-blue-100 text-blue-600' : ''
                "
              >
                <svg
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isQuestionAnswerOpen(catIndex, qIndex) }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <div
              v-show="isQuestionAnswerOpen(catIndex, qIndex)"
              class="border-t border-slate-100/80 bg-white px-4 pb-5 pt-1 sm:px-5"
            >
              <div
                class="ml-0 space-y-4 border-l-2 border-blue-200/80 pl-4 text-sm leading-relaxed text-slate-700 sm:ml-2 sm:pl-5"
              >
                <template v-for="(block, bi) in parseAnswerBlocks(item.respuesta || '')" :key="bi">
                  <template v-if="block.kind === 'paragraph'">
                    <p class="whitespace-pre-wrap text-[15px] leading-relaxed">
                      <template v-for="(seg, si) in linkifySegments(block.text)" :key="si">
                        <a
                          v-if="seg.type === 'link'"
                          :href="seg.href"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="break-all font-medium text-blue-600 underline decoration-blue-200 underline-offset-[3px] transition hover:text-blue-800"
                          >{{ seg.text }}</a
                        >
                        <span v-else>{{ seg.text }}</span>
                      </template>
                    </p>
                  </template>
                  <ul v-else class="space-y-3">
                    <li
                      v-for="(li, lii) in block.items"
                      :key="lii"
                      class="flex gap-3 text-[15px] leading-relaxed"
                    >
                      <span
                        class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm ring-2 ring-blue-100"
                        aria-hidden="true"
                      />
                      <span class="min-w-0 flex-1">
                        <template v-for="(seg, si) in linkifySegments(li)" :key="si">
                          <a
                            v-if="seg.type === 'link'"
                            :href="seg.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="break-all font-medium text-blue-600 underline decoration-blue-200 underline-offset-[3px] transition hover:text-blue-800"
                            >{{ seg.text }}</a
                          >
                          <span v-else>{{ seg.text }}</span>
                        </template>
                      </span>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón ver más / ver menos -->
      <div v-if="hayMas || showAll" class="flex justify-center pt-1">
        <button
          type="button"
          class="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          @click="showAll = !showAll"
        >
          <span>{{ showAll ? 'Ver menos' : `Ver ${categoriasFiltradas.length - 3} bloques más` }}</span>
          <svg
            class="h-4 w-4 transition-transform duration-300"
            :class="{ 'rotate-180': showAll }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
