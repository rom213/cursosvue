import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'curso_promo'
const ROUTE_KEY = 'curso_promo_route'

// Shared reactive state so every component sees the same promo
const promoCourseName = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))
const promoRoute = ref<string | null>(sessionStorage.getItem(ROUTE_KEY))

export function usePromoQuery() {
  const route = useRoute()

  // URL query param takes priority — capture on first load
  const rawParam = route.query.curso_promo
  if (rawParam) {
    const raw = String(rawParam)
    // Only convert hyphens to spaces if it looks like a slug (no spaces present)
    const name = raw.includes(' ') ? raw : raw.replace(/-/g, ' ')
    promoCourseName.value = name
    sessionStorage.setItem(STORAGE_KEY, name)

    // Store the full path (without query) as the "home" route for the promo
    const promoPath = route.path
    promoRoute.value = promoPath
    sessionStorage.setItem(ROUTE_KEY, promoPath)
  }

  const isPromoActive = computed(() => !!promoCourseName.value)

  const clearPromo = () => {
    promoCourseName.value = null
    promoRoute.value = null
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(ROUTE_KEY)
  }

  return { promoCourseName, promoRoute, isPromoActive, clearPromo }
}
