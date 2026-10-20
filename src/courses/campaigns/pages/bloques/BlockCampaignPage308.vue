<script setup lang="ts">
import StudyCampaignPage from "../../components/StudyCampaignPage.vue";
import { createBlockCampaign } from "../../config/blockCampaigns";
import definition from "../../config/bloques/308.json";

defineOptions({ name: "BlockCampaignPage308" });
const config = createBlockCampaign(definition);
</script>

<template><StudyCampaignPage :config="config" /></template>
