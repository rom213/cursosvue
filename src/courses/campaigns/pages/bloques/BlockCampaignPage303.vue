<script setup lang="ts">
import StudyCampaignPage from "../../components/StudyCampaignPage.vue";
import { createBlockCampaign } from "../../config/blockCampaigns";
import definition from "../../config/bloques/303.json";

defineOptions({ name: "BlockCampaignPage303" });
const config = createBlockCampaign(definition);
</script>

<template><StudyCampaignPage :config="config" /></template>
