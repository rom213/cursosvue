<script setup lang="ts">
import StudyCampaignPage from "../../components/StudyCampaignPage.vue";
import { personalizedCampaigns } from "../../config/personalizedCampaigns";
</script>
<template><StudyCampaignPage :config="personalizedCampaigns['100200300']" /></template>
