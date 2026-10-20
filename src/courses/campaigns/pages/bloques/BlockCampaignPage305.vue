<script setup lang="ts">
import StudyCampaignPage from "../../components/StudyCampaignPage.vue";
import { createBlockCampaign } from "../../config/blockCampaigns";
import definition from "../../config/bloques/305.json";

defineOptions({ name: "BlockCampaignPage305" });
const config = createBlockCampaign(definition);
</script>

<template><StudyCampaignPage :config="config" /></template>
