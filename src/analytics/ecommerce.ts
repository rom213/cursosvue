import type { ICategory } from '../types/Categorie'

export interface GA4Item {
  item_id: string
  item_name: string
  item_category: string
  item_list_id?: string
  item_list_name?: string
  index?: number
  price: number
  quantity: number
}

export const TRACKING_CURRENCY = 'COP'

/** El precio cobrado en la UI es `precio`; `precio_desc` es el precio de referencia. */
export function categoryPrice(category: ICategory): number {
  return Number(category.precio ?? category.precio_desc ?? 0)
}

export function categoryToGA4Item(
  category: ICategory,
  list?: { id: string; name: string; index?: number },
): GA4Item {
  return {
    item_id: String(category.id),
    item_name: category.titulo ?? '',
    item_category: category.pack_nombre ?? 'Curso',
    ...(list ? {
      item_list_id: list.id,
      item_list_name: list.name,
      ...(list.index == null ? {} : { index: list.index }),
    } : {}),
    price: categoryPrice(category),
    quantity: 1,
  }
}

export function categoriesToGA4Items(categories: ICategory[]): GA4Item[] {
  return categories.map((category) => categoryToGA4Item(category))
}
