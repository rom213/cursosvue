<script setup lang="ts">
import { computed, defineAsyncComponent, onActivated, onDeactivated, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { BLOCK_CAMPAIGN_PAGES } from "../campaigns/pages/bloques";
import TechnologyCampaignPage from "../campaigns/pages/pilares/TechnologyCampaignPage200.vue";

defineOptions({ name: "CourseInfoPage" });
const CourseInfoDetailPage = defineAsyncComponent(() => import("./CourseInfoDetailPage.vue").then((module) => module.default));
const campaignPages = {
  ...BLOCK_CAMPAIGN_PAGES,
  "100": defineAsyncComponent(() => import("../campaigns/pages/pilares/BusinessCampaignPage100.vue").then((module) => module.default)),
  "200": TechnologyCampaignPage,
  "300": defineAsyncComponent(() => import("../campaigns/pages/pilares/CreativeCampaignPage300.vue").then((module) => module.default)),
  "100200300": defineAsyncComponent(() => import("../campaigns/pages/pilares/AllAccessCampaignPage100200300.vue").then((module) => module.default)),
};
const route = useRoute();
const active = ref(true);
const campaignId = ref<keyof typeof campaignPages | null>(null);
const campaignPage = computed(() => campaignId.value ? campaignPages[campaignId.value] : null);
watch(() => [route.name, route.params.id, route.params.courseSlug], () => {
  if (route.name !== "courses-description" && route.name !== "affiliaty") return;
  const id = String(route.params.id);
  campaignId.value = route.name === "courses-description" && !route.params.courseSlug && Object.prototype.hasOwnProperty.call(campaignPages, id)
    ? id as keyof typeof campaignPages : null;
}, { immediate: true });
onActivated(() => { active.value = true; });
onDeactivated(() => { active.value = false; });
</script>

<template>
  <component :is="campaignPage" v-if="campaignPage && active" :key="campaignId!" />
  <CourseInfoDetailPage v-else-if="!campaignPage" />
</template>
