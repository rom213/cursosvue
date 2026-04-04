import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'curso_promo'
const ROUTE_KEY = 'curso_promo_route'
const TYPE_KEY = 'curso_promo_type'

export type PromoType = 'curso' | 'bloque'

// Shared reactive state so every component sees the same promo
const promoName = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))
const promoRoute = ref<string | null>(sessionStorage.getItem(ROUTE_KEY))
const promoType = ref<PromoType>((sessionStorage.getItem(TYPE_KEY) as PromoType) || 'curso')

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

export function usePromoQuery() {
  const route = useRoute()

  // The most recent param in the URL wins
  const cursoParam = route.query.curso_promo
  const bloqueParam = route.query.bloque_promo

  if (bloqueParam) {
    savePromo(parseName(String(bloqueParam)), route.path, 'bloque')
  } else if (cursoParam) {
    savePromo(parseName(String(cursoParam)), route.path, 'curso')
  }

  const isPromoActive = computed(() => !!promoName.value)

  const clearPromo = () => {
    promoName.value = null
    promoRoute.value = null
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(ROUTE_KEY)
    sessionStorage.removeItem(TYPE_KEY)
  }

  return { promoName, promoRoute, promoType, isPromoActive, clearPromo }
}
