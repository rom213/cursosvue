<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { emergentBuyStore } from "../../store/EmergentBuyStore";
import { useCampaignReturn } from "../../composables/useCampaignReturn";
import { useTracking } from "../../composables/useTracking";

const route = useRoute();
const buyStore = emergentBuyStore();
const {
  activeCampaign,
  isCampaignRoute,
  dismissCampaignReturn,
  returnToCampaign,
} = useCampaignReturn();
const { trackCustom } = useTracking();
const lastTrackedKey = ref("");

const visible = computed(() =>
  Boolean(
    activeCampaign.value &&
      !isCampaignRoute.value &&
      !buyStore.emergentBuy.emergent,
  ),
);

watch(
  [visible, () => route.fullPath],
  ([isVisible, currentPath]) => {
    const campaign = activeCampaign.value;
    if (!isVisible || !campaign) return;
    const key = `${campaign.id}:${currentPath}`;
    if (lastTrackedKey.value === key) return;
    lastTrackedKey.value = key;
    trackCustom("CampaignReturnBannerView", {
      content_id: campaign.categoryId,
      custom_data: { campaign_id: campaign.id, from_path: currentPath },
    });
  },
  { immediate: true },
);

async function handleReturn() {
  const campaign = activeCampaign.value;
  if (!campaign) return;
  trackCustom("CampaignReturnClick", {
    content_id: campaign.categoryId,
    custom_data: { campaign_id: campaign.id, from_path: route.fullPath },
  });
  await returnToCampaign();
}

function handleDismiss() {
  const campaign = activeCampaign.value;
  if (campaign) {
    trackCustom("CampaignReturnDismiss", {
      content_id: campaign.categoryId,
      custom_data: { campaign_id: campaign.id, from_path: route.fullPath },
    });
  }
  dismissCampaignReturn();
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <aside
      v-if="visible && activeCampaign"
      class="fixed inset-x-3 bottom-4 z-40 mx-auto max-w-lg rounded-2xl border border-[#e4c5b1] bg-[#fffaf4]/95 p-4 shadow-[0_18px_60px_rgba(65,38,29,0.24)] backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[430px]"
      aria-label="Volver a la campaña"
    >
      <button
        type="button"
        class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#80675e] transition hover:bg-[#f0dfd2] hover:text-[#452f28]"
        aria-label="Cerrar recordatorio de campaña"
        data-track="campaign-return-dismiss"
        @click="handleDismiss"
      >
        ×
      </button>
      <div class="pr-9">
        <p class="text-xs font-black uppercase tracking-[0.14em] text-[#9b4d3d]">Tu ruta creativa sigue aquí</p>
        <p class="mt-1 text-base font-black leading-snug text-[#422b25]">
          ¿Quieres seguir con {{ activeCampaign.title }}?
        </p>
      </div>
      <button
        type="button"
        class="mt-4 w-full rounded-xl bg-[#8f3f35] px-5 py-3 text-sm font-black text-white transition hover:bg-[#78352d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d89563]"
        data-track="campaign-return-click"
        @click="handleReturn"
      >
        Volver a la campaña →
      </button>
    </aside>
  </Transition>
</template>

