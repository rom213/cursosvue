<script setup lang="ts">
import StudyCampaignPage from "../../components/StudyCampaignPage.vue";
import { technologyCampaign } from "../../config/technologyCampaign";
defineOptions({ name: "TechnologyCampaignPage" });
</script>

<template>
  <StudyCampaignPage :config="technologyCampaign" />
</template>
