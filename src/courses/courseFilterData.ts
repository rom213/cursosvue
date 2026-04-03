export type FilterType = 'all' | 'bloques' | 'pilares' | 'combos' | 'toda-la-tienda'

export type PilarKey = 'negocios' | 'tecnologia' | 'creativa'

export interface ThemeDefinition {
  id: number
  name: string
  courseCount: number
}

export interface PilarDefinition {
  key: PilarKey
  pilarId: number
  label: string
  shortLabel: string
  textColor: string
  bgColor: string
  dotColor: string
  hoverBg: string
  themes: ThemeDefinition[]
}

export interface ComboDefinition {
  id: number
  name: string
  shortName: string
  pilarKeys: PilarKey[]
  price: string
}

export const PILARES: PilarDefinition[] = [
  {
    key: 'negocios',
    pilarId: 100,
    label: 'Negocios Digitales y Éxito Profesional',
    shortLabel: 'Negocios Digitales',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-600',
    dotColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-50',
    themes: [
      { id: 101, name: 'Riqueza Exponencial: Inversiones y Finanzas', courseCount: 532 },
      { id: 102, name: 'Apuestas, Estrategia y Juegos de Azar', courseCount: 74 },
      { id: 103, name: 'Business Intelligence, Datos y Oficina', courseCount: 382 },
      { id: 104, name: 'Marketing Digital, Ventas y Tráfico', courseCount: 1321 },
      { id: 105, name: 'E-Commerce, Importaciones y Tiendas Online', courseCount: 243 },
      { id: 106, name: 'Idiomas y Comunicación', courseCount: 315 },
      { id: 107, name: 'Dirección Ejecutiva & Gestión Humana', courseCount: 821 },
    ],
  },
  {
    key: 'tecnologia',
    pilarId: 200,
    label: 'Tecnología, Código e Ingeniería',
    shortLabel: 'Tecnología',
    textColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-50',
    themes: [
      { id: 201, name: 'Desarrollo Web (Frontend/Backend) y UX/UI', courseCount: 867 },
      { id: 202, name: 'Software Pro: Cloud, DevOps y Lenguajes', courseCount: 831 },
      { id: 203, name: 'Hardware, Reparación y Redes', courseCount: 95 },
      { id: 204, name: 'Inteligencia Artificial y Data Science', courseCount: 357 },
      { id: 205, name: 'Ciberseguridad y Hacking', courseCount: 333 },
      { id: 206, name: 'Automatización Industrial, PLC y Robótica', courseCount: 36 },
      { id: 207, name: 'Ingeniería Civil, Arquitectura y Construcción', courseCount: 303 },
    ],
  },
  {
    key: 'creativa',
    pilarId: 300,
    label: 'Academia Creativa y Bienestar Integral',
    shortLabel: 'Academia Creativa',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-500',
    dotColor: 'bg-orange-500',
    hoverBg: 'hover:bg-orange-50',
    themes: [
      { id: 301, name: 'Identidad Visual, Dibujo y Diseño Gráfico', courseCount: 786 },
      { id: 302, name: 'Narrativa Visual: Video, Fotografía y Redes', courseCount: 585 },
      { id: 303, name: 'Música y Producción de Audio', courseCount: 239 },
      { id: 304, name: 'Fitness, Salud y Defensa Personal', courseCount: 294 },
      { id: 305, name: 'Gastronomía, Cocina y Bebidas', courseCount: 86 },
      { id: 306, name: 'Taller Maestro: Manualidades, Oficios y DIY', courseCount: 262 },
      { id: 307, name: 'Mística, Mentalidad y Psicología', courseCount: 584 },
      { id: 308, name: 'Belleza, Estética y Moda', courseCount: 48 },
      { id: 309, name: 'Mascotas y Animales', courseCount: 27 },
    ],
  },
]

export const COMBOS: ComboDefinition[] = [
  {
    id: 200300,
    name: 'EL ARQUITECTO DIGITAL',
    shortName: 'Ingeniería + Academia Creativa',
    pilarKeys: ['tecnologia', 'creativa'],
    price: '$80k',
  },
  {
    id: 100300,
    name: 'EL EMPRENDEDOR CREATIVO',
    shortName: 'Negocios + Academia Creativa',
    pilarKeys: ['negocios', 'creativa'],
    price: '$80k',
  },
  {
    id: 100200,
    name: 'EL SOCIO TECNOLÓGICO',
    shortName: 'Negocios + Ingeniería',
    pilarKeys: ['negocios', 'tecnologia'],
    price: '$80k',
  },
]

export const TODA_LA_TIENDA_ID = 100200300

export function classifyCategoryId(id: number): FilterType {
  if (id === TODA_LA_TIENDA_ID) return 'toda-la-tienda'
  if ([100200, 100300, 200300].includes(id)) return 'combos'
  if ([100, 200, 300].includes(id)) return 'pilares'
  if ((id >= 101 && id <= 107) || (id >= 201 && id <= 207) || (id >= 301 && id <= 309)) return 'bloques'
  return 'all'
}

export function getPilarForThemeId(id: number): PilarKey | null {
  if (id >= 101 && id <= 107) return 'negocios'
  if (id >= 201 && id <= 207) return 'tecnologia'
  if (id >= 301 && id <= 309) return 'creativa'
  return null
}

export function getGradientForCombo(pilarKeys: PilarKey[]): string {
  const colorMap: Record<PilarKey, string> = {
    negocios: 'blue-500',
    tecnologia: 'emerald-500',
    creativa: 'orange-500',
  }
  const from = colorMap[pilarKeys[0]] || 'blue-500'
  const to = colorMap[pilarKeys[1]] || 'emerald-500'
  return `from-${from} to-${to}`
}

export function getCategoryBorderClass(id: number): string {
  if (id === TODA_LA_TIENDA_ID) return 'border-2 border-amber-400'
  if ([100200, 100300, 200300].includes(id)) return 'border-2 border-purple-300'
  if (id === 100 || (id >= 101 && id <= 107)) return 'border-2 border-blue-400'
  if (id === 200 || (id >= 201 && id <= 207)) return 'border-2 border-emerald-400'
  if (id === 300 || (id >= 301 && id <= 309)) return 'border-2 border-orange-400'
  return 'border border-gray-100'
}

/**
 * Devuelve el ID de la categoría upsell sugerida para un producto dado.
 * Bloque → su Pilar padre, Pilar/Combo → Toda la Tienda, Toda la Tienda → null.
 */
export function getUpsellTargetId(id: number): number | null {
  const type = classifyCategoryId(id)
  if (type === 'bloques') {
    const pilar = getPilarForThemeId(id)
    if (pilar) {
      const def = PILARES.find((p) => p.key === pilar)
      return def?.pilarId ?? null
    }
    return null
  }
  if (type === 'pilares' || type === 'combos') return TODA_LA_TIENDA_ID
  return null // toda-la-tienda no tiene upsell
}

/**
 * Cantidad de bloques (temas) para una categoría.
 * Retorna null para bloques individuales (no mostrar "Bloques").
 */
export function getBloquesCountForCategory(id: number): number | null {
  const type = classifyCategoryId(id)

  if (type === 'bloques') return null

  if (type === 'pilares') {
    const pilar = PILARES.find(p => p.pilarId === id)
    return pilar?.themes.length ?? null
  }

  if (type === 'combos') {
    const combo = COMBOS.find(c => c.id === id)
    if (!combo) return null
    return combo.pilarKeys.reduce((sum, key) => {
      const pilar = PILARES.find(p => p.key === key)
      return sum + (pilar?.themes.length ?? 0)
    }, 0)
  }

  if (type === 'toda-la-tienda') {
    return PILARES.reduce((sum, p) => sum + p.themes.length, 0)
  }

  return null
}

export function getCategoryGlowClass(id: number): string {
  if (id === TODA_LA_TIENDA_ID) return 'ring-2 ring-amber-300 shadow-lg shadow-amber-200/50'
  if ([100200, 100300, 200300].includes(id)) return 'ring-2 ring-purple-300 shadow-lg shadow-purple-200/50'
  if (id === 100 || (id >= 101 && id <= 107)) return 'ring-2 ring-blue-300 shadow-lg shadow-blue-200/50'
  if (id === 200 || (id >= 201 && id <= 207)) return 'ring-2 ring-emerald-300 shadow-lg shadow-emerald-200/50'
  if (id === 300 || (id >= 301 && id <= 309)) return 'ring-2 ring-orange-300 shadow-lg shadow-orange-200/50'
  return ''
}
