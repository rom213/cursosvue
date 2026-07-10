<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue";
import AnalyticsService, {
  type OverviewResponse,
  type ContentItem,
  type AcquisitionResponse,
  type FunnelResponse,
  type PaymentMethodItem,
  type AbandonedResponse,
  type SearchInternalItem,
  type SearchPaidTermItem,
  type RetentionResponse,
  type SeoItem,
  type CoursesInterestResponse,
  type PeopleInterestResponse,
  type ActivityResponse,
  type NavigationMapResponse,
  type NavigationClicksResponse,
  type NavigationSessionResponse,
} from "../../../services/AnalyticsService";
import KpiTile from "./KpiTile.vue";
import TimeSeriesChart from "./TimeSeriesChart.vue";
import RankingTable from "./RankingTable.vue";
import DateRangePicker, { type RangeValue } from "./DateRangePicker.vue";
import SegmentBar, { type SegmentValue } from "./SegmentBar.vue";
import FunnelChart from "./FunnelChart.vue";
import AcquisitionTable from "./AcquisitionTable.vue";
import AbandonedList from "./AbandonedList.vue";
import CohortGrid from "./CohortGrid.vue";
import SeoOpportunityTable from "./SeoOpportunityTable.vue";
import ExportCsvButton from "./ExportCsvButton.vue";
import CampaignCostsPanel from "./CampaignCostsPanel.vue";
import RealtimePanel from "./RealtimePanel.vue";
import CoursesInterestTable from "./CoursesInterestTable.vue";
import PeopleInterestList from "./PeopleInterestList.vue";
import ActivityLog from "./ActivityLog.vue";
import NavFlowTable from "./NavFlowTable.vue";
import NavFlowSankey from "./NavFlowSankey.vue";
import PageClicksRanking from "./PageClicksRanking.vue";
import SessionTimeline from "./SessionTimeline.vue";

// --- Estado compartido entre tabs (vive en la página, no en cada componente) ---
function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 6);

const range = ref<RangeValue>({
  date_from: localISO(weekAgo),
  date_to: localISO(today),
  compare: true,
});
const segments = ref<SegmentValue>({ channel: null, device: null });
const granularity = ref<"day" | "week">("day");

type Tab =
  | "overview"
  | "content"
  | "courses_interest"
  | "acquisition"
  | "funnel"
  | "search"
  | "retention"
  | "seo"
  | "activity"
  | "navigation"
  | "realtime";
const activeTab = ref<Tab>("overview");
// Fuerza el remonte de RealtimePanel al refrescar (dispara su fetch inmediato).
const realtimeKey = ref(0);
const tabs: { value: Tab; label: string }[] = [
  { value: "overview", label: "Resumen" },
  { value: "content", label: "Contenido" },
  { value: "courses_interest", label: "Cursos de interés" },
  { value: "acquisition", label: "Adquisición" },
  { value: "funnel", label: "Embudo" },
  { value: "search", label: "Búsqueda" },
  { value: "retention", label: "Retención" },
  { value: "seo", label: "SEO" },
  { value: "activity", label: "Actividad" },
  { value: "navigation", label: "Navegación" },
  { value: "realtime", label: "Tiempo real" },
];

const overview = ref<OverviewResponse | null>(null);
const content = ref<{ courses: ContentItem[]; categories: ContentItem[]; filters: ContentItem[] }>({
  courses: [],
  categories: [],
  filters: [],
});

// P2
const acqBy = ref<"channel" | "campaign" | "referral">("channel");
const acqByTabs: { value: "channel" | "campaign" | "referral"; label: string }[] = [
  { value: "channel", label: "Por canal" },
  { value: "campaign", label: "Por campaña" },
  { value: "referral", label: "Referidos" },
];
const acquisition = ref<AcquisitionResponse | null>(null);
const funnelCompare = ref<string | null>(null);
const compareChannels = [
  { value: null, label: "Sin comparar" },
  { value: "paid", label: "Pago" },
  { value: "organic", label: "Orgánico" },
  { value: "social", label: "Social" },
  { value: "referral", label: "Referido" },
  { value: "direct", label: "Directo" },
  { value: "email", label: "Email" },
];
const funnel = ref<FunnelResponse | null>(null);
const paymentMethods = ref<PaymentMethodItem[]>([]);
const abandoned = ref<AbandonedResponse | null>(null);
const searchInternal = ref<SearchInternalItem[]>([]);
const searchPaid = ref<SearchPaidTermItem[]>([]);

// P3
const retentionWeeks = ref<number>(8);
const retentionCohort = ref<"first_visit" | "free_view">("first_visit");
const retention = ref<RetentionResponse | null>(null);
const retentionCohortTabs: { value: "first_visit" | "free_view"; label: string }[] = [
  { value: "first_visit", label: "Primera visita" },
  { value: "free_view", label: "1ª vista gratis" },
];
const seoKind = ref<"queries" | "pages" | "opportunities">("queries");
const seoKindTabs: { value: "queries" | "pages" | "opportunities"; label: string }[] = [
  { value: "queries", label: "Queries" },
  { value: "pages", label: "Páginas" },
  { value: "opportunities", label: "Oportunidades" },
];
const seo = ref<SeoItem[]>([]);

// Cursos de interés + bitácora
const PAGE_SIZE = 50;
const coursesInterest = ref<CoursesInterestResponse | null>(null);
const peopleInterest = ref<PeopleInterestResponse | null>(null);
const peopleOffset = ref(0);
const activity = ref<ActivityResponse | null>(null);
const activityOffset = ref(0);
const activityEventName = ref<string | null>(null);
const activityContentId = ref<number | null>(null);
const activityEventTabs: { value: string | null; label: string }[] = [
  { value: null, label: "Interés (curso)" },
  { value: "Purchase", label: "Compras" },
  { value: "AddToCart", label: "Carrito" },
  { value: "InitiateCheckout", label: "Checkout" },
  { value: "Search", label: "Búsquedas" },
];

// Navegación (F4)
const navMap = ref<NavigationMapResponse | null>(null);
const navClicks = ref<NavigationClicksResponse | null>(null);
const navSelectedPage = ref<string | null>(null);
const navFlowView = ref<"table" | "sankey">("table"); // F5.2: dos vistas del mismo dataset
// Recorrido de sesión (modal compartido: se abre desde Actividad y Navegación)
const sessionId = ref<string | null>(null);
const sessionData = ref<NavigationSessionResponse | null>(null);
const sessionLoading = ref(false);
const sessionError = ref<string | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);

function commonParams() {
  return {
    date_from: range.value.date_from,
    date_to: range.value.date_to,
    channel: segments.value.channel,
    device: segments.value.device,
  };
}

const pct = (v: number) => ((v ?? 0) * 100).toFixed(1) + "%";
const num = (v: number) => (v ?? 0).toLocaleString("es-CO");
const money = (v: number) => "$" + Math.round(v ?? 0).toLocaleString("es-CO");

// --- Filas para export CSV desde estructuras anidadas ---
function abandonedCsvRows(): Record<string, unknown>[] {
  return (abandoned.value?.items ?? []).map((it) => ({
    fecha: it.last_activity,
    carrito: it.cart,
    valor: it.value ?? "",
    moneda: it.currency ?? "",
    canal: it.channel,
    nombre: it.contact?.name ?? "",
    email: it.contact?.email ?? "",
    whatsapp: it.contact?.whatsapp ?? "",
  }));
}
function retentionCsvRows(): Record<string, unknown>[] {
  if (!retention.value) return [];
  return retention.value.grid.map((c) => {
    const row: Record<string, unknown> = { cohorte: c.week, usuarios: c.size };
    c.cells.forEach((cell, i) => {
      row[`S${i}`] = cell ? +(cell.pct * 100).toFixed(1) : "";
    });
    return row;
  });
}
function peopleCsvRows(): Record<string, unknown>[] {
  return (peopleInterest.value?.items ?? []).map((it) => ({
    persona: it.contact?.name ?? it.label ?? "Visitante",
    email: it.contact?.email ?? "", // solo hay contacto si estaba logueado (privacidad)
    whatsapp: it.contact?.whatsapp ?? "",
    cursos: it.courses.map((c) => c.title).join(" | "),
    total_cursos: it.total_courses,
    ultima_vista: it.last_activity,
    ya_compro: it.has_purchase ? "sí" : "no",
  }));
}
function activityCsvRows(): Record<string, unknown>[] {
  return (activity.value?.items ?? []).map((it) => ({
    fecha: it.event_time,
    persona: it.person_label,
    email: it.contact?.email ?? "", // solo si logueado (privacidad)
    evento: it.event_name,
    curso: it.content_name ?? "",
    content_id: it.content_id ?? "",
    canal: it.channel,
    valor: it.value ?? "",
    pagina: it.event_source_url ?? "",
  }));
}

async function loadOverview() {
  loading.value = true;
  error.value = null;
  try {
    overview.value = await AnalyticsService.getOverview({
      ...commonParams(),
      granularity: granularity.value,
    });
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar el resumen.";
  } finally {
    loading.value = false;
  }
}

async function loadContent() {
  loading.value = true;
  error.value = null;
  try {
    const [c, cat, f] = await Promise.all([
      AnalyticsService.getContent({ kind: "courses", ...commonParams() }),
      AnalyticsService.getContent({ kind: "categories", ...commonParams() }),
      AnalyticsService.getContent({ kind: "filters", ...commonParams() }),
    ]);
    content.value = { courses: c.items, categories: cat.items, filters: f.items };
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar el contenido.";
  } finally {
    loading.value = false;
  }
}

async function loadAcquisition() {
  loading.value = true;
  error.value = null;
  try {
    acquisition.value = await AnalyticsService.getAcquisition(acqBy.value, commonParams());
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar la adquisición.";
  } finally {
    loading.value = false;
  }
}

async function loadFunnel() {
  loading.value = true;
  error.value = null;
  try {
    const [f, pm, ab] = await Promise.all([
      AnalyticsService.getFunnel({ ...commonParams(), compare_to: funnelCompare.value }),
      AnalyticsService.getPaymentMethods(commonParams()),
      AnalyticsService.getAbandonedCheckouts({ ...commonParams(), limit: 50 }),
    ]);
    funnel.value = f;
    paymentMethods.value = pm.items;
    abandoned.value = ab;
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar el embudo.";
  } finally {
    loading.value = false;
  }
}

async function loadSearch() {
  loading.value = true;
  error.value = null;
  try {
    const [si, sp] = await Promise.all([
      AnalyticsService.getSearchInternal({ ...commonParams(), limit: 20 }),
      AnalyticsService.getSearchPaidTerms({ ...commonParams(), limit: 20 }),
    ]);
    searchInternal.value = si.items;
    searchPaid.value = sp.items;
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar la búsqueda.";
  } finally {
    loading.value = false;
  }
}

async function loadRetention() {
  loading.value = true;
  error.value = null;
  try {
    retention.value = await AnalyticsService.getRetention({
      weeks: retentionWeeks.value,
      cohort: retentionCohort.value,
      channel: segments.value.channel,
      device: segments.value.device,
    });
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar la retención.";
  } finally {
    loading.value = false;
  }
}

async function loadSeo() {
  loading.value = true;
  error.value = null;
  try {
    const res = await AnalyticsService.getSearchSeo(seoKind.value, {
      date_from: range.value.date_from,
      date_to: range.value.date_to,
      limit: 50,
    });
    seo.value = res.items;
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar el SEO.";
  } finally {
    loading.value = false;
  }
}

async function loadCoursesInterest() {
  loading.value = true;
  error.value = null;
  try {
    const [ci, people] = await Promise.all([
      AnalyticsService.getCoursesInterest({ ...commonParams(), limit: 50 }),
      AnalyticsService.getCoursesInterestPeople({
        ...commonParams(),
        offset: peopleOffset.value,
        limit: PAGE_SIZE,
      }),
    ]);
    coursesInterest.value = ci;
    peopleInterest.value = people;
  } catch (e) {
    console.error(e);
    error.value = "No se pudieron cargar los cursos de interés.";
  } finally {
    loading.value = false;
  }
}

async function loadActivity() {
  loading.value = true;
  error.value = null;
  try {
    activity.value = await AnalyticsService.getActivity({
      ...commonParams(),
      event_name: activityEventName.value,
      content_id: activityContentId.value,
      offset: activityOffset.value,
      limit: PAGE_SIZE,
    });
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar la bitácora de actividad.";
  } finally {
    loading.value = false;
  }
}

async function loadNavigation() {
  loading.value = true;
  error.value = null;
  navSelectedPage.value = null; // al (re)entrar o cambiar rango, volver a la vista global
  try {
    const [map, clicks] = await Promise.all([
      AnalyticsService.getNavigationMap({ ...commonParams(), limit: 40 }),
      AnalyticsService.getNavigationClicks({
        ...commonParams(),
        page_path: navSelectedPage.value,
        limit: 30,
      }),
    ]);
    navMap.value = map;
    navClicks.value = clicks;
  } catch (e) {
    console.error(e);
    error.value = "No se pudo cargar la navegación.";
  } finally {
    loading.value = false;
  }
}

/** Recarga solo el ranking de clicks (drill-down por página), sin rehacer el mapa. */
async function loadNavClicks() {
  try {
    navClicks.value = await AnalyticsService.getNavigationClicks({
      ...commonParams(),
      page_path: navSelectedPage.value,
      limit: 30,
    });
  } catch (e) {
    console.error(e);
  }
}
function selectNavPage(path: string) {
  navSelectedPage.value = path;
  loadNavClicks();
}
function clearNavPage() {
  navSelectedPage.value = null;
  loadNavClicks();
}

/** Abre el recorrido de una sesión (desde Actividad o Navegación). */
async function openSession(sid: string) {
  sessionId.value = sid;
  sessionData.value = null;
  sessionError.value = null;
  sessionLoading.value = true;
  try {
    sessionData.value = await AnalyticsService.getNavigationSession(sid);
  } catch (e) {
    console.error(e);
    sessionError.value = "No se pudo cargar el recorrido de la sesión.";
  } finally {
    sessionLoading.value = false;
  }
}
function closeSession() {
  sessionId.value = null;
  sessionData.value = null;
  sessionError.value = null;
}

function loadActive() {
  if (activeTab.value === "overview") loadOverview();
  else if (activeTab.value === "content") loadContent();
  else if (activeTab.value === "courses_interest") loadCoursesInterest();
  else if (activeTab.value === "acquisition") loadAcquisition();
  else if (activeTab.value === "funnel") loadFunnel();
  else if (activeTab.value === "search") loadSearch();
  else if (activeTab.value === "retention") loadRetention();
  else if (activeTab.value === "seo") loadSeo();
  else if (activeTab.value === "activity") loadActivity();
  else if (activeTab.value === "navigation") loadNavigation();
  else {
    // "realtime": el panel es autocontenido (fetch + polling propios); solo limpiamos el estado
    // compartido para no arrastrar spinner/error de un tab anterior.
    loading.value = false;
    error.value = null;
  }
}

/** Refresco manual del tab activo. En Tiempo real remonta el panel para forzar su fetch. */
function refresh() {
  if (activeTab.value === "realtime") realtimeKey.value++;
  else loadActive();
}

// Campañas visibles → autocompletado del formulario de costos.
const campaignNames = computed(() =>
  acqBy.value === "campaign"
    ? Array.from(
        new Set(
          (acquisition.value?.items ?? [])
            .map((i) => i.campaign)
            .filter((c): c is string => !!c && c !== "(sin utm)")
        )
      )
    : []
);

/** Paginación de la bitácora / personas (avanza si hay más filas). */
function pageActivity(dir: number) {
  const next = activityOffset.value + dir * PAGE_SIZE;
  if (next < 0 || (activity.value && next >= activity.value.total)) return;
  activityOffset.value = next;
}
function pagePeople(dir: number) {
  const next = peopleOffset.value + dir * PAGE_SIZE;
  if (next < 0 || (peopleInterest.value && next >= peopleInterest.value.total)) return;
  peopleOffset.value = next;
}
function selectActivityEvent(v: string | null) {
  activityEventName.value = v;
  activityOffset.value = 0; // reinicia la paginación al cambiar de filtro
}

watch(
  [
    range, segments, granularity, activeTab, acqBy, funnelCompare,
    retentionWeeks, retentionCohort, seoKind,
    peopleOffset, activityOffset, activityEventName, activityContentId,
  ],
  loadActive,
  { deep: true }
);
onMounted(loadActive);
</script>

<template>
  <q-page>
    <div class="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="max-w-6xl mx-auto flex flex-col gap-5">
        <!-- Header -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h1 class="text-2xl font-bold text-gray-800">Analítica</h1>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                :disabled="loading"
                title="Refrescar datos"
                @click="refresh"
              >
                <svg
                  class="w-4 h-4"
                  :class="{ 'animate-spin': loading }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Refrescar
              </button>
              <DateRangePicker v-model="range" />
            </div>
          </div>
          <SegmentBar v-model="segments" />
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 border-b border-gray-200 overflow-x-auto">
          <button
            v-for="t in tabs"
            :key="t.value"
            class="px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap"
            :class="activeTab === t.value
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'"
            @click="activeTab = t.value"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Estados -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
          {{ error }}
        </div>
        <div v-else-if="loading" class="flex items-center justify-center py-20 text-gray-400">
          <svg class="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span class="text-sm font-semibold">Cargando…</span>
        </div>

        <!-- Tab: Resumen -->
        <template v-else-if="activeTab === 'overview' && overview">
          <div class="flex items-center justify-end -mt-2">
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                v-for="g in (['day', 'week'] as const)"
                :key="g"
                class="px-3 py-1 text-xs font-semibold transition-colors"
                :class="granularity === g ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="granularity = g"
              >
                {{ g === "day" ? "Día" : "Semana" }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiTile label="Visitantes" :value="overview.current.visitors" :delta="overview.current.deltas.visitors" />
            <KpiTile label="Sesiones" :value="overview.current.sessions" :delta="overview.current.deltas.sessions" />
            <KpiTile label="Páginas vistas" :value="overview.current.pageviews" :delta="overview.current.deltas.pageviews" />
            <KpiTile label="Compras" :value="overview.current.purchases" :delta="overview.current.deltas.purchases" />
            <KpiTile label="Ingresos" :value="overview.current.revenue" :delta="overview.current.deltas.revenue" format="currency" />
            <KpiTile label="Conversión" :value="overview.current.conversion_rate" :delta="overview.current.deltas.conversion_rate" format="percent" />
          </div>

          <TimeSeriesChart
            :current="overview.series.current"
            :previous="overview.series.previous"
            :compare="range.compare"
          />

          <!-- Mini-desgloses -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Nuevos vs. recurrentes</h3>
              <div class="flex flex-col gap-2">
                <div v-for="v in overview.breakdowns.visitor_type" :key="v.key" class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 capitalize">{{ v.key === "new" ? "Nuevos" : "Recurrentes" }}</span>
                  <span class="font-semibold text-gray-800 tabular-nums">{{ v.sessions.toLocaleString("es-CO") }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Por canal</h3>
              <div v-if="overview.breakdowns.channel.length === 0" class="text-sm text-gray-400">Sin datos.</div>
              <div v-else class="flex flex-col gap-2">
                <div v-for="c in overview.breakdowns.channel" :key="c.key" class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 capitalize">{{ c.key }}</span>
                  <span class="font-semibold text-gray-800 tabular-nums">{{ c.sessions.toLocaleString("es-CO") }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Por dispositivo</h3>
              <div v-if="overview.breakdowns.device.length === 0" class="text-sm text-gray-400">Sin datos.</div>
              <div v-else class="flex flex-col gap-2">
                <div v-for="d in overview.breakdowns.device" :key="d.key" class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 capitalize">{{ d.key === "mobile" ? "Móvil" : "Escritorio" }}</span>
                  <span class="font-semibold text-gray-800 tabular-nums">{{ d.sessions.toLocaleString("es-CO") }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab: Contenido -->
        <template v-else-if="activeTab === 'content'">
          <div class="flex items-center justify-end -mt-2 gap-2">
            <ExportCsvButton filename="contenido-cursos" label="CSV cursos" :rows="content.courses" />
            <ExportCsvButton filename="contenido-categorias" label="CSV categorías" :rows="content.categories" />
            <ExportCsvButton filename="contenido-filtros" label="CSV filtros" :rows="content.filters" />
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankingTable
              class="lg:col-span-2"
              title="Cursos más vistos → comprados"
              :items="content.courses"
              label-field="title"
              value-field="views"
              value-label="Vistas"
              :show-conversion="true"
              empty-hint="Aún no hay ViewContent con content_id en este rango (lo alimenta F3)."
            />
            <RankingTable
              title="Categorías más vistas"
              :items="content.categories"
              label-field="key"
              value-field="count"
              value-label="Vistas"
              empty-hint="Sin categorías registradas en este rango."
            />
            <RankingTable
              title="Filtros más usados"
              :items="content.filters"
              label-field="key"
              value-field="count"
              value-label="Usos"
              empty-hint="Sin eventos de filtro (UseFilter/ToggleFreeFilter) en este rango."
            />
          </div>
        </template>

        <!-- Tab: Cursos de interés (ViewContent de curso individual) -->
        <template v-else-if="activeTab === 'courses_interest'">
          <div class="flex items-center justify-between flex-wrap gap-2 -mt-2">
            <p class="text-xs text-gray-400 max-w-2xl">
              Cursos individuales que la gente vio (ViewContent de curso), con visitantes únicos y
              conversión a compra. No incluye packs.
            </p>
            <ExportCsvButton filename="cursos-interes" label="CSV cursos" :rows="coursesInterest?.items ?? []" />
          </div>
          <CoursesInterestTable :items="coursesInterest?.items ?? []" />

          <div class="flex items-center justify-between flex-wrap gap-2 mt-2">
            <h2 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Seguimiento comercial</h2>
            <ExportCsvButton filename="personas-interesadas" label="CSV personas" :rows="peopleCsvRows()" />
          </div>
          <PeopleInterestList
            v-if="peopleInterest"
            :items="peopleInterest.items"
            :total="peopleInterest.total"
          />
          <div
            v-if="peopleInterest && peopleInterest.total > PAGE_SIZE"
            class="flex items-center justify-end gap-2"
          >
            <button
              class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              :disabled="peopleOffset === 0"
              @click="pagePeople(-1)"
            >
              ← Anterior
            </button>
            <span class="text-xs text-gray-400 tabular-nums">
              {{ peopleOffset + 1 }}–{{ Math.min(peopleOffset + PAGE_SIZE, peopleInterest.total) }}
              de {{ peopleInterest.total }}
            </span>
            <button
              class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              :disabled="peopleOffset + PAGE_SIZE >= peopleInterest.total"
              @click="pagePeople(1)"
            >
              Siguiente →
            </button>
          </div>
        </template>

        <!-- Tab: Adquisición -->
        <template v-else-if="activeTab === 'acquisition' && acquisition">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                v-for="b in acqByTabs"
                :key="b.value"
                class="px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="acqBy === b.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="acqBy = b.value"
              >
                {{ b.label }}
              </button>
            </div>
            <ExportCsvButton filename="adquisicion" :rows="acquisition.items" />
          </div>

          <!-- Publicidad → gratis -->
          <div v-if="acqBy !== 'referral'" class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 class="text-sm font-bold text-gray-700 mb-3">Publicidad → gratis</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div class="text-[11px] uppercase text-gray-400 font-semibold">Sesiones pago</div>
                <div class="text-lg font-bold text-gray-800 tabular-nums">{{ num(acquisition.paid_to_free.paid_sessions) }}</div>
              </div>
              <div>
                <div class="text-[11px] uppercase text-gray-400 font-semibold">1ª vista gratis</div>
                <div class="text-lg font-bold text-gray-800 tabular-nums">
                  {{ num(acquisition.paid_to_free.free_first_sessions) }}
                  <span class="text-xs text-gray-400">({{ pct(acquisition.paid_to_free.free_first_share) }})</span>
                </div>
              </div>
              <div>
                <div class="text-[11px] uppercase text-gray-400 font-semibold">De esas, compran</div>
                <div class="text-lg font-bold text-gray-800 tabular-nums">{{ num(acquisition.paid_to_free.free_first_purchases) }}</div>
              </div>
              <div>
                <div class="text-[11px] uppercase text-gray-400 font-semibold">Conv. gratis→pago</div>
                <div class="text-lg font-bold text-emerald-600 tabular-nums">{{ pct(acquisition.paid_to_free.free_first_conversion) }}</div>
              </div>
            </div>
          </div>

          <!-- Costos de campaña → ROAS (P4). Solo por campaña. -->
          <CampaignCostsPanel
            v-if="acqBy === 'campaign'"
            :campaigns="campaignNames"
            @changed="loadAcquisition"
          />

          <AcquisitionTable
            :items="acquisition.items"
            :by="acqBy"
            :has-costs="acquisition.has_costs ?? false"
          />
        </template>

        <!-- Tab: Embudo -->
        <template v-else-if="activeTab === 'funnel' && funnel">
          <div class="flex items-center justify-end gap-2 -mt-2 flex-wrap">
            <span class="text-[11px] uppercase font-bold text-gray-400">Comparar con</span>
            <select
              v-model="funnelCompare"
              class="text-xs font-semibold rounded-lg border border-gray-200 px-2 py-1 text-gray-600 bg-white"
            >
              <option v-for="c in compareChannels" :key="c.label" :value="c.value">{{ c.label }}</option>
            </select>
          </div>

          <FunnelChart :data="funnel" />

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Métodos de pago -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-700">Conversión por método de pago</h3>
                <ExportCsvButton filename="metodos-pago" :rows="paymentMethods" />
              </div>
              <div v-if="paymentMethods.length === 0" class="p-6 text-center text-sm text-gray-400">
                Sin eventos SelectPaymentMethod en este rango.
              </div>
              <table v-else class="w-full text-sm">
                <thead>
                  <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
                    <th class="text-left font-semibold px-4 py-2">Método</th>
                    <th class="text-right font-semibold px-2 py-2">Selecciones</th>
                    <th class="text-right font-semibold px-2 py-2">Compras</th>
                    <th class="text-right font-semibold px-4 py-2">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(m, idx) in paymentMethods" :key="idx" class="border-t border-gray-50">
                    <td class="px-4 py-2 text-gray-700 font-medium">{{ m.method }}</td>
                    <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ num(m.selections) }}</td>
                    <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ num(m.purchases) }}</td>
                    <td class="px-4 py-2 text-right font-semibold text-emerald-600 tabular-nums">{{ pct(m.conversion_rate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex items-center justify-end -mb-2">
            <ExportCsvButton filename="carritos-abandonados" :rows="abandonedCsvRows()" />
          </div>
          <AbandonedList
            v-if="abandoned"
            :items="abandoned.items"
            :total="abandoned.total"
          />
        </template>

        <!-- Tab: Búsqueda -->
        <template v-else-if="activeTab === 'search'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Búsqueda interna -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-700">Búsqueda interna</h3>
                <ExportCsvButton filename="busqueda-interna" :rows="searchInternal" />
              </div>
              <div v-if="searchInternal.length === 0" class="p-6 text-center text-sm text-gray-400">
                Sin búsquedas (Search) en este rango. Lo alimenta F3.
              </div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
                      <th class="text-left font-semibold px-4 py-2">Término</th>
                      <th class="text-right font-semibold px-2 py-2">Búsq.</th>
                      <th class="text-right font-semibold px-2 py-2">Clics</th>
                      <th class="text-right font-semibold px-2 py-2" title="Búsquedas sin clic">Sin clic</th>
                      <th class="text-right font-semibold px-4 py-2">Compras</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, idx) in searchInternal" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/60">
                      <td class="px-4 py-2 text-gray-700 font-medium truncate max-w-[180px]">{{ s.term }}</td>
                      <td class="px-2 py-2 text-right text-gray-800 font-semibold tabular-nums">{{ num(s.searches) }}</td>
                      <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ num(s.clicks) }}</td>
                      <td class="px-2 py-2 text-right tabular-nums" :class="s.no_click > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'">{{ num(s.no_click) }}</td>
                      <td class="px-4 py-2 text-right text-emerald-600 font-semibold tabular-nums">{{ num(s.purchases) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Keywords pagadas -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-700">Keywords pagadas (utm_term)</h3>
                <ExportCsvButton filename="keywords-pagadas" :rows="searchPaid" />
              </div>
              <div v-if="searchPaid.length === 0" class="p-6 text-center text-sm text-gray-400">
                Sin campañas con utm_term en este rango.
              </div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr class="text-[11px] uppercase text-gray-400 tracking-wide">
                      <th class="text-left font-semibold px-4 py-2">Término</th>
                      <th class="text-right font-semibold px-2 py-2">Sesiones</th>
                      <th class="text-right font-semibold px-2 py-2">Compras</th>
                      <th class="text-right font-semibold px-2 py-2">Ingresos</th>
                      <th class="text-right font-semibold px-4 py-2">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, idx) in searchPaid" :key="idx" class="border-t border-gray-50 hover:bg-gray-50/60">
                      <td class="px-4 py-2 text-gray-700 font-medium truncate max-w-[180px]">{{ s.term }}</td>
                      <td class="px-2 py-2 text-right text-gray-800 font-semibold tabular-nums">{{ num(s.sessions) }}</td>
                      <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ num(s.purchases) }}</td>
                      <td class="px-2 py-2 text-right text-gray-600 tabular-nums">{{ money(s.revenue) }}</td>
                      <td class="px-4 py-2 text-right font-semibold text-emerald-600 tabular-nums">{{ pct(s.conversion_rate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab: Retención -->
        <template v-else-if="activeTab === 'retention' && retention">
          <div class="flex items-center justify-between flex-wrap gap-3 -mt-2">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  v-for="c in retentionCohortTabs"
                  :key="c.value"
                  class="px-3 py-1.5 text-xs font-semibold transition-colors"
                  :class="retentionCohort === c.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                  @click="retentionCohort = c.value"
                >
                  {{ c.label }}
                </button>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[11px] uppercase font-bold text-gray-400">Semanas</span>
                <select
                  v-model.number="retentionWeeks"
                  class="text-xs font-semibold rounded-lg border border-gray-200 px-2 py-1 text-gray-600 bg-white"
                >
                  <option v-for="w in [4, 6, 8, 10, 12]" :key="w" :value="w">{{ w }}</option>
                </select>
              </div>
            </div>
            <ExportCsvButton filename="retencion-cohortes" :rows="retentionCsvRows()" />
          </div>

          <CohortGrid :data="retention" />
        </template>

        <!-- Tab: SEO -->
        <template v-else-if="activeTab === 'seo'">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                v-for="k in seoKindTabs"
                :key="k.value"
                class="px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="seoKind === k.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="seoKind = k.value"
              >
                {{ k.label }}
              </button>
            </div>
            <ExportCsvButton :filename="`seo-${seoKind}`" :rows="seo" />
          </div>

          <p class="text-xs text-gray-400 -mt-2">
            Datos de Google Search Console (import nocturno). Vacío hasta que el service account tenga
            acceso a la propiedad y el job corra ≥1 vez.
          </p>

          <SeoOpportunityTable
            :kind="seoKind"
            :items="seo"
            :empty-hint="seoKind === 'opportunities'
              ? 'Sin oportunidades SEO en este rango (o sin datos de Search Console todavía).'
              : 'Sin datos de Search Console en este rango. Lo alimenta el import nocturno de GSC (P3).'"
          />
        </template>

        <!-- Tab: Actividad (bitácora de eventos individuales, sin caché) -->
        <template v-else-if="activeTab === 'activity'">
          <div class="flex items-center justify-between flex-wrap gap-2 -mt-2">
            <div class="flex rounded-lg border border-gray-200 overflow-hidden flex-wrap">
              <button
                v-for="k in activityEventTabs"
                :key="k.label"
                class="px-3 py-1.5 text-xs font-semibold transition-colors"
                :class="activityEventName === k.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="selectActivityEvent(k.value)"
              >
                {{ k.label }}
              </button>
            </div>
            <ExportCsvButton filename="registro-eventos" :rows="activityCsvRows()" />
          </div>

          <ActivityLog
            v-if="activity"
            :items="activity.items"
            :total="activity.total"
            @view-session="openSession"
          />

          <div
            v-if="activity && activity.total > PAGE_SIZE"
            class="flex items-center justify-end gap-2"
          >
            <button
              class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              :disabled="activityOffset === 0"
              @click="pageActivity(-1)"
            >
              ← Anterior
            </button>
            <span class="text-xs text-gray-400 tabular-nums">
              {{ activityOffset + 1 }}–{{ Math.min(activityOffset + PAGE_SIZE, activity.total) }}
              de {{ activity.total }}
            </span>
            <button
              class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              :disabled="activityOffset + PAGE_SIZE >= activity.total"
              @click="pageActivity(1)"
            >
              Siguiente →
            </button>
          </div>
        </template>

        <!-- Tab: Navegación (mapa de flujo + clicks por página + recorrido de sesión) -->
        <template v-else-if="activeTab === 'navigation'">
          <!-- KPIs de clicks -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiTile
              label="Clicks"
              :value="navClicks?.current.clicks ?? 0"
              :delta="navClicks?.current.deltas?.clicks ?? null"
            />
            <KpiTile
              label="Sesiones con clicks"
              :value="navClicks?.current.sessions_with_clicks ?? 0"
              :delta="navClicks?.current.deltas?.sessions_with_clicks ?? null"
            />
            <KpiTile
              label="Clicks / sesión"
              :value="navClicks?.current.clicks_per_session ?? 0"
              :delta="navClicks?.current.deltas?.clicks_per_session ?? null"
            />
            <KpiTile
              label="% clicks muertos"
              :value="navClicks?.current.dead_rate ?? 0"
              format="percent"
              :delta="navClicks?.current.deltas?.dead_rate ?? null"
              :invert-delta="true"
            />
          </div>

          <div class="flex items-center justify-between flex-wrap gap-2 -mt-1">
            <div class="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                v-for="v in (['table', 'sankey'] as const)"
                :key="v"
                class="px-3 py-1 text-xs font-semibold transition-colors"
                :class="navFlowView === v ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="navFlowView = v"
              >
                {{ v === "table" ? "Tabla" : "Sankey" }}
              </button>
            </div>
            <ExportCsvButton filename="navegacion-clicks" :rows="navClicks?.items ?? []" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <NavFlowSankey
              v-if="navFlowView === 'sankey'"
              :edges="navMap?.edges ?? []"
              :selected-page="navSelectedPage"
              @select-page="selectNavPage"
            />
            <NavFlowTable
              v-else
              :edges="navMap?.edges ?? []"
              :selected-page="navSelectedPage"
              @select-page="selectNavPage"
            />
            <PageClicksRanking
              :items="navClicks?.items ?? []"
              :page-path="navSelectedPage"
              @clear="clearNavPage"
            />
          </div>
        </template>

        <!-- Tab: Tiempo real (ventana fija 5 min, ignora rango/segmentos; polling propio) -->
        <template v-else-if="activeTab === 'realtime'">
          <RealtimePanel :key="realtimeKey" />
        </template>
      </div>
    </div>

    <!-- Modal: recorrido de una sesión (se abre desde Actividad o Navegación) -->
    <SessionTimeline
      v-if="sessionId"
      :session="sessionData"
      :loading="sessionLoading"
      :error="sessionError"
      @close="closeSession"
    />
  </q-page>
</template>
