import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const CAMPAIGN_RETURN_STORAGE_KEY = "ce_campaign_return_v1";

export interface CampaignReturnState {
  id: string;
  title: string;
  path: string;
  categoryId: number;
}

function safeRead(): CampaignReturnState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CAMPAIGN_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CampaignReturnState>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.path !== "string" ||
      typeof parsed.categoryId !== "number"
    ) {
      localStorage.removeItem(CAMPAIGN_RETURN_STORAGE_KEY);
      return null;
    }
    return parsed as CampaignReturnState;
  } catch {
    return null;
  }
}

function safeWrite(value: CampaignReturnState | null) {
  if (typeof localStorage === "undefined") return;
  try {
    if (value) localStorage.setItem(CAMPAIGN_RETURN_STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(CAMPAIGN_RETURN_STORAGE_KEY);
  } catch {
    // El retorno es una ayuda de navegación: degrada sin romper la aplicación.
  }
}

const activeCampaign = ref<CampaignReturnState | null>(safeRead());

function pathname(path: string) {
  return path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

export function useCampaignReturn() {
  const route = useRoute();
  const router = useRouter();

  const isCampaignRoute = computed(() =>
    Boolean(activeCampaign.value && pathname(route.path) === pathname(activeCampaign.value.path)),
  );

  function activateCampaign(campaign: CampaignReturnState) {
    activeCampaign.value = campaign;
    safeWrite(campaign);
  }

  function dismissCampaignReturn() {
    activeCampaign.value = null;
    safeWrite(null);
  }

  async function returnToCampaign() {
    if (!activeCampaign.value) return;
    await router.push(activeCampaign.value.path);
  }

  return {
    activeCampaign,
    isCampaignRoute,
    activateCampaign,
    dismissCampaignReturn,
    returnToCampaign,
  };
}

