<script setup lang="ts">
import { computed, defineAsyncComponent, onActivated, onDeactivated, ref, watch } from "vue";
import { useRoute } from "vue-router";
import TechnologyCampaignPage from "../campaigns/TechnologyCampaignPage.vue";

// Keep the existing route name and KeepAlive identity for catalog and affiliate links.
defineOptions({ name: "CourseInfoPage" });
const CourseInfoDetailPage = defineAsyncComponent(() => import("./CourseInfoDetailPage.vue").then((module) => module.default));
const route = useRoute();
const active = ref(true);
const technology = ref(false);
const isTechnologyLocation = computed(() => route.name === "courses-description"
  && String(route.params.id) === "200" && !route.params.courseSlug);
watch(() => [route.name, route.params.id, route.params.courseSlug], () => {
  if (route.name === "courses-description" || route.name === "affiliaty") {
    technology.value = isTechnologyLocation.value;
  }
}, { immediate: true });
onActivated(() => { active.value = true; });
onDeactivated(() => { active.value = false; });
</script>

<template>
  <TechnologyCampaignPage v-if="technology && active" />
  <CourseInfoDetailPage v-else-if="!technology" />
</template>
