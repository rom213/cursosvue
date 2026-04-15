import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const STORAGE_KEY = 'curso_promo'
const ROUTE_KEY = 'curso_promo_route'
const TYPE_KEY = 'curso_promo_type'
const INTRO_KEY = 'curso_promo_intro_dismissed'

export type PromoType = 'curso' | 'bloque'

// Shared reactive state so every component sees the same promo
const promoName = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))
const promoRoute = ref<string | null>(sessionStorage.getItem(ROUTE_KEY))
const promoType = ref<PromoType>((sessionStorage.getItem(TYPE_KEY) as PromoType) || 'curso')
const isIntroDismissed = ref<boolean>(sessionStorage.getItem(INTRO_KEY) === '1')

/** Vue Router puede devolver string | string[] en query */
function firstQueryValue(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

function parseName(raw: string): string {
  // Only convert hyphens to spaces if it looks like a slug (no spaces present)
  return raw.includes(' ') ? raw : raw.replace(/-/g, ' ')
}

function savePromo(name: string, path: string, type: PromoType) {
  promoName.value = name
  promoRoute.value = path
  promoType.value = type
  sessionStorage.setItem(STORAGE_KEY, name)
  sessionStorage.setItem(ROUTE_KEY, path)
  sessionStorage.setItem(TYPE_KEY, type)
}

/** Si el ref se vació (p. ej. HMR) pero la sesión sigue con promo, rehidratar */
function restorePromoFromSessionIfNeeded() {
  if (promoName.value) return
  const name = sessionStorage.getItem(STORAGE_KEY)
  if (!name) return
  const path = sessionStorage.getItem(ROUTE_KEY)
  const typeRaw = sessionStorage.getItem(TYPE_KEY)
  promoName.value = name
  promoRoute.value = path
  promoType.value = typeRaw === 'bloque' ? 'bloque' : 'curso'
}

function syncPromoFromRoute(r: RouteLocationNormalizedLoaded) {
  const bloqueParam = firstQueryValue(r.query.bloque_promo as string | string[] | undefined)
  const cursoParam = firstQueryValue(r.query.curso_promo as string | string[] | undefined)

  if (bloqueParam) {
    savePromo(parseName(String(bloqueParam)), r.path, 'bloque')
  } else if (cursoParam) {
    savePromo(parseName(String(cursoParam)), r.path, 'curso')
  } else {
    restorePromoFromSessionIfNeeded()
  }
}

let afterEachRegistered = false

// Se pone en true solo cuando el usuario hace click en el banner (goToPromo).
// Permite que la página destino aplique el autofiltro una sola vez.
const promoBannerClicked = ref(false)

export function usePromoQuery() {
  const route = useRoute()
  const router = useRouter()

  syncPromoFromRoute(route)

  if (!afterEachRegistered) {
    afterEachRegistered = true
    router.afterEach((to) => {
      syncPromoFromRoute(to)
    })
  }

  const isPromoActive = computed(() => !!promoName.value)
  const showPromoIntro = computed(() => isPromoActive.value && !isIntroDismissed.value)
  const showPromoBanner = computed(() => isPromoActive.value && isIntroDismissed.value)

  const dismissIntro = () => {
    isIntroDismissed.value = true
    sessionStorage.setItem(INTRO_KEY, '1')
    // Activar el highlight de promo al cerrar el diálogo, tanto si el
    // usuario llegó por URL directa como por click en el banner.
    if (promoName.value && promoType.value === 'curso') {
      promoBannerClicked.value = true
    }
  }

  /** Llamar desde App.vue justo antes de navegar al destino de la promo */
  const markBannerClicked = () => {
    promoBannerClicked.value = true
  }

  /** La página destino llama esto después de consumir el flag */
  const consumeBannerClick = () => {
    promoBannerClicked.value = false
  }

  const clearPromo = () => {
    promoName.value = null
    promoRoute.value = null
    isIntroDismissed.value = false
    promoBannerClicked.value = false
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(ROUTE_KEY)
    sessionStorage.removeItem(TYPE_KEY)
    sessionStorage.removeItem(INTRO_KEY)
  }

  return {
    promoName,
    promoRoute,
    promoType,
    promoBannerClicked,
    isPromoActive,
    showPromoIntro,
    showPromoBanner,
    dismissIntro,
    markBannerClicked,
    consumeBannerClick,
    clearPromo,
  }
}
