/** Clave localStorage para el JWT emitido por el backend tras /verify-token */
export const AUTH_ACCESS_TOKEN_KEY = "cursos_auth_access_token";

// --- Registro de eventos first-party (useEventContext / EventService) ---
/** localStorage: id anónimo estable del dispositivo; se genera una vez y NUNCA rota. */
export const EVENT_ANON_ID_KEY = "ce_anonymous_id";
/** localStorage: flag de que el dispositivo ya tuvo su primera visita (para FirstVisit/ReturnVisit). */
export const EVENT_FIRST_VISIT_KEY = "ce_first_visit";
/** sessionStorage: id de sesión; expira ~30 min de inactividad. */
export const EVENT_SESSION_ID_KEY = "ce_session_id";
/** sessionStorage: timestamp (ms) de la última actividad, para expirar la sesión. */
export const EVENT_SESSION_ACTIVE_KEY = "ce_session_active";
/** sessionStorage: atribución de marketing capturada en el landing (utm_*, fbclid, gclid). */
export const EVENT_ATTRIBUTION_KEY = "ce_attribution";
