<script setup lang="ts">
import { AcademicCapIcon, BriefcaseIcon, BuildingStorefrontIcon, IdentificationIcon } from "@heroicons/vue/24/outline";

defineProps<{ id: string }>();
const icons = { trabajo: BriefcaseIcon, empleo: IdentificationIcon, negocio: BuildingStorefrontIcon, personal: AcademicCapIcon };
</script>

<template><component :is="icons[id as keyof typeof icons] ?? BriefcaseIcon" aria-hidden="true" /></template>
