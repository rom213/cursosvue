import { PILARES, TODA_LA_TIENDA_ID } from "../../courseFilterData";
import type { ICategory } from "../../../types/Categorie";

const categoryIds = new Set(PILARES.flatMap((pillar) => [pillar.pilarId, ...pillar.themes.map((theme) => theme.id)]));
categoryIds.add(TODA_LA_TIENDA_ID);

export function hasStudyCampaign(id: string | number) {
  return categoryIds.has(Number(id));
}

const blockIds = new Set(PILARES.flatMap((pillar) => pillar.themes.map((theme) => theme.id)));

export function searchResultCategoryId(result: Pick<ICategory, "id" | "pack_nombre">): number | null {
  // Deep search returns the pillar in `id`; the actual block is in the pack label.
  const blockId = Number(result.pack_nombre?.match(/^\s*(\d+)\s*\|/)?.[1]);
  if (blockIds.has(blockId)) return blockId;
  const id = Number(result.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
