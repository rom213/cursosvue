// src/services/AnalyticsService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";

/**
 * Cliente del panel de analítica admin (`/api/managment/analytics`, protegido por require_admin).
 * El Bearer lo inyecta el interceptor de ApiService; aquí solo se arma la query y se devuelve `.data`.
 * Espeja las respuestas de `servises/events/analytics_model.py`.
 */

export interface AnalyticsRange {
  date_from: string;
  date_to: string;
}

export interface OverviewKpis {
  visitors: number;
  new_visitors: number;
  returning_visitors: number;
  sessions: number;
  pageviews: number;
  purchases: number;
  revenue: number;
  avg_ticket: number;
  conversion_rate: number;
  /** Δ% vs periodo anterior por KPI; `null` cuando no hay base de comparación. */
  deltas: Record<string, number | null>;
}

export interface TimeSeries {
  labels: string[];
  visitors: number[];
  sessions: number[];
  revenue: number[];
}

export interface BreakdownItem {
  key: string;
  sessions: number;
}

export interface OverviewResponse {
  range: AnalyticsRange;
  previous_range: AnalyticsRange;
  granularity: string;
  current: OverviewKpis;
  previous: OverviewKpis;
  series: { current: TimeSeries; previous: TimeSeries };
  breakdowns: {
    channel: BreakdownItem[];
    device: BreakdownItem[];
    visitor_type: BreakdownItem[];
  };
}

/** Fila de ranking: cursos traen title/views/purchases; categorías y filtros traen key/count. */
export interface ContentItem {
  content_id?: number;
  title?: string;
  views?: number;
  purchases?: number;
  conversion_rate?: number;
  key?: string;
  count?: number;
  share: number;
  trend_pct: number | null;
}

export interface ContentResponse {
  kind: string;
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: ContentItem[];
}

export interface OverviewParams {
  date_from?: string;
  date_to?: string;
  granularity?: "day" | "week";
  channel?: string | null;
  device?: string | null;
}

export interface ContentParams {
  kind?: "courses" | "categories" | "filters";
  date_from?: string;
  date_to?: string;
  channel?: string | null;
  device?: string | null;
  offset?: number;
  limit?: number;
}

// ------------------------------------------------------------------ P2: Adquisición
export interface AcquisitionItem {
  /** channel (paid/organic/…), campaña o afiliado según `by`. */
  key: string;
  sessions: number;
  // channel/campaign
  purchases?: number;
  revenue?: number;
  revenue_per_session?: number;
  conversion_rate?: number;
  campaign?: string;
  source?: string;
  medium?: string;
  // referral
  clicks?: number;
  // P4: solo con by=campaign — `cost`/`roas` son null si esa campaña no tiene costo cargado.
  cost?: number | null;
  roas?: number | null;
}

export interface PaidToFree {
  paid_sessions: number;
  free_first_sessions: number;
  free_first_share: number;
  free_first_purchases: number;
  free_first_conversion: number;
}

export interface AcquisitionResponse {
  by: "channel" | "campaign" | "referral";
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: AcquisitionItem[];
  paid_to_free: PaidToFree;
  /** Solo con by=campaign: hay ≥1 costo cargado → el front muestra la columna ROAS (P4). */
  has_costs?: boolean;
}

// ------------------------------------------------------------------ P2: Embudo
export interface FunnelStage {
  event: string;
  label: string;
  sessions: number;
  /** % que pasa desde la etapa anterior (1.0 en la primera). */
  step_pct: number;
  /** % que cae respecto a la etapa anterior. */
  drop_pct: number;
}

export interface FunnelSegment {
  label: string;
  stages: FunnelStage[];
}

export interface FunnelResponse {
  range: AnalyticsRange;
  primary: FunnelSegment;
  comparison: FunnelSegment | null;
}

export interface PaymentMethodItem {
  method: string;
  selections: number;
  purchases: number;
  conversion_rate: number;
}

export interface PaymentMethodsResponse {
  range: AnalyticsRange;
  items: PaymentMethodItem[];
}

// ------------------------------------------------------------------ P2: Abandonados
export interface AbandonedContact {
  name: string | null;
  email: string | null;
  whatsapp: string | null;
}

export interface AbandonedItem {
  session_id: string;
  /** ISO en hora Bogotá del último InitiateCheckout. */
  last_activity: string;
  value: number | null;
  currency: string | null;
  cart: string;
  channel: string;
  /** Solo presente si la sesión estaba logueada (privacidad). */
  contact: AbandonedContact | null;
}

export interface AbandonedResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: AbandonedItem[];
}

// ------------------------------------------------------------------ P2: Búsqueda
export interface SearchInternalItem {
  term: string;
  searches: number;
  clicks: number;
  /** Búsquedas sin clic (demanda insatisfecha). */
  no_click: number;
  purchases: number;
}

export interface SearchInternalResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: SearchInternalItem[];
}

export interface SearchPaidTermItem {
  term: string;
  sessions: number;
  purchases: number;
  revenue: number;
  conversion_rate: number;
}

export interface SearchPaidTermsResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: SearchPaidTermItem[];
}

/** Segmentos transversales compartidos por los endpoints de P2. */
export interface SegmentParams {
  date_from?: string;
  date_to?: string;
  channel?: string | null;
  device?: string | null;
}

/** Params de paginación reutilizables por los endpoints con offset/limit. */
export interface PageParams {
  offset?: number;
  limit?: number;
}

// ------------------------------------------------------------------ P3: Retención
export interface RetentionCell {
  n: number;
  /** % de la cohorte activo en esa semana (0–1). */
  pct: number;
}

export interface RetentionCohort {
  /** Lunes ISO de la cohorte (YYYY-MM-DD). */
  week: string;
  size: number;
  /** Longitud = `weeks`; `null` = semana futura aún no observable. */
  cells: (RetentionCell | null)[];
}

export interface FreeToPaidBucket {
  bucket: string;
  label: string;
  n: number;
}

export interface FreeToPaid {
  /** Gratis-primero reales (sin compra previa). */
  free_users: number;
  excluded_prior_buyers: number;
  converted: number;
  conversion_rate: number;
  median_days: number | null;
  distribution: FreeToPaidBucket[];
}

export interface RetentionResponse {
  cohort: "first_visit" | "free_view";
  weeks: number;
  range: AnalyticsRange;
  grid: RetentionCohort[];
  free_to_paid: FreeToPaid;
}

export interface RetentionParams {
  weeks?: number;
  cohort?: "first_visit" | "free_view";
  channel?: string | null;
  device?: string | null;
}

// ------------------------------------------------------------------ P3: SEO / Search Console
export interface SeoItem {
  /** Query (queries/opportunities) o URL de página (pages). */
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** Solo en queries y opportunities. */
  branded?: boolean;
  /** Solo en opportunities: página objetivo (más impresiones). */
  page?: string;
  /** Solo en opportunities. */
  reason?: "striking_distance" | "low_ctr";
}

export interface SeoResponse {
  kind: "queries" | "pages" | "opportunities";
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: SeoItem[];
}

export interface SeoParams {
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

// ------------------------------------------------------------------ P4: Costos de campaña (ROAS)
export interface CampaignCost {
  id: number;
  utm_campaign: string;
  /** Mes comercial YYYY-MM. */
  month: string;
  cost: number;
  currency: string;
  updated_at: string | null;
}

export interface CampaignCostsResponse {
  items: CampaignCost[];
}

export interface CampaignCostInput {
  utm_campaign: string;
  month: string;
  cost: number;
  currency?: string;
}

// ------------------------------------------------------------------ P4: Tiempo real
export interface RealtimePage {
  page: string;
  visitors: number;
  events: number;
}

export interface RealtimeSource {
  channel: string;
  sessions: number;
}

export interface RealtimeResponse {
  window_minutes: number;
  /** ISO en hora Bogotá del instante de cálculo. */
  generated_at: string;
  active_visitors: number;
  active_sessions: number;
  pageviews: number;
  purchases: number;
  pages: RealtimePage[];
  sources: RealtimeSource[];
}

// ------------------------------------------------------------------ Cursos de interés + bitácora
export interface CourseInterestItem {
  content_id: number;
  title: string;
  /** Visitantes únicos (anonymous_id) que vieron el curso. */
  viewers: number;
  views: number;
  purchases: number;
  conversion_rate: number;
  trend_pct: number | null;
  share: number;
}

export interface CoursesInterestResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: CourseInterestItem[];
}

export interface PersonCourseRef {
  content_id: number;
  title: string;
  /** ISO en hora Bogotá de la última vista. */
  last_viewed: string;
}

export interface PersonInterest {
  person_id: string;
  /** Solo presente si la persona estaba logueada (privacidad). */
  contact: AbandonedContact | null;
  /** Etiqueta de-identificada para anónimos ("Visitante …"). */
  label?: string;
  courses: PersonCourseRef[];
  total_courses: number;
  last_activity: string;
  has_purchase: boolean;
}

export interface PeopleInterestResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: PersonInterest[];
}

export interface ActivityItem {
  /** ISO en hora Bogotá. */
  event_time: string;
  event_name: string;
  /** Nombre/email si está logueado; si no, "Visitante …" (sin PII). */
  person_label: string;
  contact: AbandonedContact | null;
  content_id: number | null;
  content_name: string | null;
  content_type: string | null;
  channel: string;
  value: number | null;
  event_source_url: string | null;
  session_id: string | null;
}

export interface ActivityResponse {
  range: AnalyticsRange;
  total: number;
  offset: number;
  limit: number;
  items: ActivityItem[];
}

export interface ActivityParams extends SegmentParams {
  event_name?: string | null;
  content_id?: number | null;
  offset?: number;
  limit?: number;
}

// ------------------------------------------------------------------ Navegación (mapa + clicks + sesión)
export interface NavNode {
  page_path: string;
  pageviews: number;
  sessions: number;
}
export interface NavEdge {
  from: string;
  to: string;
  sessions: number;
}
export interface NavigationMapResponse {
  range: AnalyticsRange;
  nodes: NavNode[];
  edges: NavEdge[];
}

export interface NavClickItem {
  /** track_name curado o target_selector derivado. */
  key: string;
  example_text: string | null;
  clicks: number;
  sessions: number;
  /** Proporción de "clicks muertos" (sin ancestro interactivo). */
  dead_rate: number;
  /** clicks / pageviews de la página. */
  ctr: number;
}
export interface NavClickTotals {
  clicks: number;
  sessions_with_clicks: number;
  clicks_per_session: number;
  dead_rate: number;
  deltas?: Record<string, number | null>;
}
export interface NavigationClicksResponse {
  range: AnalyticsRange;
  page_path: string | null;
  current: NavClickTotals;
  previous: NavClickTotals;
  total: number;
  offset: number;
  limit: number;
  items: NavClickItem[];
}

export interface NavTimelineItem {
  kind: "pageview" | "click";
  /** ISO en hora Bogotá. */
  at: string;
  page: string | null;
  label: string | null;
  text?: string | null;
  /** true = click muerto; null en pageviews. */
  dead: boolean | null;
}
export interface NavigationSessionResponse {
  session_id: string;
  /** Solo si la sesión estaba logueada (privacidad). */
  contact: AbandonedContact | null;
  timeline: NavTimelineItem[];
}

export interface NavigationParams extends SegmentParams {
  limit?: number;
}
export interface NavigationClicksParams extends SegmentParams {
  page_path?: string | null;
  offset?: number;
  limit?: number;
}

const BASE = "/api/managment/analytics";

/** Elimina claves nulas/vacías para no enviar `?channel=` sin valor. */
function clean(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );
}

class AnalyticsService {
  static async getOverview(params: OverviewParams = {}): Promise<OverviewResponse> {
    const res: AxiosResponse<OverviewResponse> = await ApiService.get(
      `${BASE}/overview`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getContent(params: ContentParams = {}): Promise<ContentResponse> {
    const res: AxiosResponse<ContentResponse> = await ApiService.get(
      `${BASE}/content`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getAcquisition(
    by: "channel" | "campaign" | "referral",
    params: SegmentParams & PageParams = {}
  ): Promise<AcquisitionResponse> {
    const res: AxiosResponse<AcquisitionResponse> = await ApiService.get(
      `${BASE}/acquisition`,
      clean({ by, ...params } as Record<string, unknown>)
    );
    return res.data;
  }

  static async getFunnel(
    params: SegmentParams & { compare_to?: string | null } = {}
  ): Promise<FunnelResponse> {
    const res: AxiosResponse<FunnelResponse> = await ApiService.get(
      `${BASE}/funnel`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getPaymentMethods(params: SegmentParams = {}): Promise<PaymentMethodsResponse> {
    const res: AxiosResponse<PaymentMethodsResponse> = await ApiService.get(
      `${BASE}/payment-methods`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getAbandonedCheckouts(
    params: SegmentParams & { offset?: number; limit?: number } = {}
  ): Promise<AbandonedResponse> {
    const res: AxiosResponse<AbandonedResponse> = await ApiService.get(
      `${BASE}/abandoned-checkouts`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getSearchInternal(
    params: SegmentParams & PageParams = {}
  ): Promise<SearchInternalResponse> {
    const res: AxiosResponse<SearchInternalResponse> = await ApiService.get(
      `${BASE}/search/internal`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getSearchPaidTerms(
    params: SegmentParams & PageParams = {}
  ): Promise<SearchPaidTermsResponse> {
    const res: AxiosResponse<SearchPaidTermsResponse> = await ApiService.get(
      `${BASE}/search/paid-terms`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getRetention(params: RetentionParams = {}): Promise<RetentionResponse> {
    const res: AxiosResponse<RetentionResponse> = await ApiService.get(
      `${BASE}/retention`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getSearchSeo(
    kind: "queries" | "pages" | "opportunities",
    params: SeoParams = {}
  ): Promise<SeoResponse> {
    const res: AxiosResponse<SeoResponse> = await ApiService.get(
      `${BASE}/search/seo`,
      clean({ kind, ...params } as Record<string, unknown>)
    );
    return res.data;
  }

  // ---------------------------------------------------------------- P4: Costos de campaña
  static async getCampaignCosts(utmCampaign?: string): Promise<CampaignCostsResponse> {
    const res: AxiosResponse<CampaignCostsResponse> = await ApiService.get(
      `${BASE}/campaign-costs`,
      clean({ utm_campaign: utmCampaign } as Record<string, unknown>)
    );
    return res.data;
  }

  static async upsertCampaignCost(input: CampaignCostInput): Promise<CampaignCost> {
    const res: AxiosResponse<CampaignCost> = await ApiService.post(`${BASE}/campaign-costs`, input);
    return res.data;
  }

  static async deleteCampaignCost(id: number): Promise<void> {
    await ApiService.delete(`${BASE}/campaign-costs/${id}`);
  }

  // ---------------------------------------------------------------- P4: Tiempo real
  static async getRealtime(): Promise<RealtimeResponse> {
    const res: AxiosResponse<RealtimeResponse> = await ApiService.get(`${BASE}/realtime`);
    return res.data;
  }

  // ---------------------------------------------------------------- Cursos de interés + bitácora
  static async getCoursesInterest(
    params: SegmentParams & PageParams = {}
  ): Promise<CoursesInterestResponse> {
    const res: AxiosResponse<CoursesInterestResponse> = await ApiService.get(
      `${BASE}/courses-interest`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getCoursesInterestPeople(
    params: SegmentParams & { offset?: number; limit?: number } = {}
  ): Promise<PeopleInterestResponse> {
    const res: AxiosResponse<PeopleInterestResponse> = await ApiService.get(
      `${BASE}/courses-interest/people`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getActivity(params: ActivityParams = {}): Promise<ActivityResponse> {
    const res: AxiosResponse<ActivityResponse> = await ApiService.get(
      `${BASE}/activity`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  // ---------------------------------------------------------------- Navegación (F4)
  static async getNavigationMap(params: NavigationParams = {}): Promise<NavigationMapResponse> {
    const res: AxiosResponse<NavigationMapResponse> = await ApiService.get(
      `${BASE}/navigation/map`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getNavigationClicks(
    params: NavigationClicksParams = {}
  ): Promise<NavigationClicksResponse> {
    const res: AxiosResponse<NavigationClicksResponse> = await ApiService.get(
      `${BASE}/navigation/clicks`,
      clean(params as Record<string, unknown>)
    );
    return res.data;
  }

  static async getNavigationSession(sessionId: string): Promise<NavigationSessionResponse> {
    const res: AxiosResponse<NavigationSessionResponse> = await ApiService.get(
      `${BASE}/navigation/session/${encodeURIComponent(sessionId)}`
    );
    return res.data;
  }
}

export default AnalyticsService;
